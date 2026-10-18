import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import OpenAI from "openai";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// この値を変更してPushすると、旧デプロイとの区別ができる
const ROUTE_MARKER = "genroute-diag-20261019-01";
const IMAGE_MODEL = "gpt-image-2.5-sunburst";

const headers = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "X-Debug-Route": ROUTE_MARKER,
};

// 一時診断用：ブラウザからアクセスして実行環境を確認する
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      routeMarker: ROUTE_MARKER,
      model: IMAGE_MODEL,
      commit:
        process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "unknown",
      openAIKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
      blobTokenConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    },
    { headers }
  );
}

export async function POST(req: Request) {
  const requestId = randomUUID();

  console.info("[GENERATE:START]", {
    requestId,
    routeMarker: ROUTE_MARKER,
    model: IMAGE_MODEL,
    commit:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "unknown",
  });

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    const body = await req.json();
    const { motif, color, density, itemType } = body;

    // ここは診断用の簡易プロンプト。
    // 問題が解消したら、現在使用している詳細なプロンプトに戻す。
    const prompt = [
      "Create a textile pattern design.",
      `Motif: ${String(motif ?? "")}`,
      `Color: ${String(color ?? "")}`,
      `Density: ${String(density ?? "")}`,
      `Item type: ${String(itemType ?? "")}`,
    ].join("\n");

    const openai = new OpenAI({ apiKey });

    console.info("[GENERATE:OPENAI_REQUEST]", {
      requestId,
      routeMarker: ROUTE_MARKER,
      model: IMAGE_MODEL,
      size: "1024x1024",
    });

    const result = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
      output_format: "png",
    });

    const base64Image = result.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error("OpenAI returned no image data");
    }

    console.info("[GENERATE:OPENAI_SUCCESS]", {
      requestId,
      routeMarker: ROUTE_MARKER,
      model: IMAGE_MODEL,
    });

    const buffer = Buffer.from(base64Image, "base64");

    const blob = await put(
      `generated/${requestId}.png`,
      buffer,
      {
        access: "public",
        contentType: "image/png",
      }
    );

    console.info("[GENERATE:BLOB_SUCCESS]", {
      requestId,
      routeMarker: ROUTE_MARKER,
    });

    return NextResponse.json(
      {
        ok: true,
        requestId,
        routeMarker: ROUTE_MARKER,
        model: IMAGE_MODEL,
        imageUrl: blob.url,
      },
      {
        headers: {
          ...headers,
          "X-Debug-Request-Id": requestId,
        },
      }
    );
  } catch (error) {
    const isOpenAIError = error instanceof OpenAI.APIError;

    const message =
      error instanceof Error ? error.message : String(error);

    const openAIError = isOpenAIError
      ? {
          status: error.status,
          code: error.code,
          type: error.type,
          requestId: error.request_id,
        }
      : null;

    console.error("[GENERATE:ERROR]", {
      requestId,
      routeMarker: ROUTE_MARKER,
      model: IMAGE_MODEL,
      message,
      openAIError,
    });

    return NextResponse.json(
      {
        ok: false,
        requestId,
        routeMarker: ROUTE_MARKER,
        model: IMAGE_MODEL,
        error: message,
        openAIRequestId: openAIError?.requestId ?? null,
      },
      {
        status: isOpenAIError ? error.status ?? 502 : 500,
        headers: {
          ...headers,
          "X-Debug-Request-Id": requestId,
        },
      }
    );
  }
}
