// app/lib/noticeConfig.ts

export interface NoticeConfig {
  enabled: boolean;
  id: string;
  category: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  body: string[];
  highlightBox: string[];
  ctaText: string;
}

export const CURRENT_NOTICE: NoticeConfig = {
  enabled: true,
  id: 'campaign-24-creative-final',
  category: '🎉 キャンペーン開催中！',
  title: '【1日24回】心ゆくまで試せる「意匠クリエイティブ」新登場！',
  subtitle: '鮮やかな配色とベクター調テキスタイルをたっぷり楽しめます',
  badge: '期間限定',
  imageUrl: '',
  body: [
    '日頃のご愛顧に感謝して、図案づくりを心ゆくまで試せる特別キャンペーンを実施中です！',
    '新エンジン「意匠クリエイティブ」を導入し、鮮やかな発色とシャープな意匠が【1日24回】までたっぷり試せるようになりました。',
    '',
    '思いついた言葉や色をどんどん試して、あなただけの特別な帯・着物づくりをお楽しみください！'
  ],
  highlightBox: [
    '■ 意匠クリエイティブ（fal）',
    '・1日24回まで利用可能！',
    '・鮮やかでキレのあるベクター調のモダンテキスタイル意匠',
    '',
    '■ 本番清書（OpenAI）',
    '・1日1回限定',
    '・新潟デジタル捺染工場「モナリザ」印刷用の最高精細仕上げ'
  ],
  ctaText: 'さっそく図案を作ってみる',
};
