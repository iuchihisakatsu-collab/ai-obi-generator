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
  // ★ IDを一新して、全員のブラウザで確実に再表示させる
  id: 'notice-202611-16times-update',
  category: '🎉 キャンペーン開催中！',
  title: '【1日最大15回】心ゆくまで試せる「スケッチモード」新登場！',
  subtitle: '素敵な絵が出る「丁寧モード」は1日1回無料でご利用いただけます',
  badge: '期間限定',
  imageUrl: '',
  body: [
    '日頃のご愛顧に感謝して、図案づくりを心ゆくまで試せる特別キャンペーンを実施中です！',
    '新エンジン「意匠クリエイティブ」を導入し、鮮やかな発色とシャープな意匠が【1日最大16回】までたっぷり試せるようになりました。',
    '',
    '思いついた言葉や色をどんどん試して、あなただけの特別な帯・着物づくりをお楽しみください！'
  ],
  highlightBox: [
    '■ スケッチモード（アイデア出し）',
    '・1日15回までたっぷり試せる！',
    '・鮮やかでキレのあるベクター調のモダンテキスタイル意匠',
    '',
    '■ 丁寧に作るモード（本番高精細）',
    '・1日1回限定（無料）',
    '・新潟デジタル捺染工場「モナリザ」印刷用の最高精細仕上げ'
  ],
  ctaText: 'さっそく図案を作ってみる',
};
