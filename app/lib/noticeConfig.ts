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
  id: 'notice-202611-ig-follower-campaign',
  category: '🎁 Instagramフォロワー様限定',
  title: '【フォロワー様限定】最高画質「丁寧モード」無料クーポン配布中！',
  subtitle: 'Instagramでメンションして限定シリアルコード（5回分）をGET',
  badge: '期間限定',
  imageUrl: '',
  body: [
    'いつもゴフクヤサンをフォロー＆応援いただき、誠にありがとうございます！',
    '日頃の感謝を込めて、フォロワー様限定で最高精細な「丁寧に作るモード」をさらに【5回分無料】でお試しいただける特別クーポンをInstagram DMにてプレゼント中です！',
    '',
    '届いたコードを入力するだけで、クオリティの高い美しい図案づくりをすぐにお楽しみいただけます。'
  ],
  highlightBox: [
    '■ クーポンの受け取り＆ご利用手順',
    '1. Instagram（@gofukuyasan）をフォロー',
    '2. ストーリーズで「@gofukuyasan」をメンション投稿（または対象投稿にコメント）',
    '3. DMで自動返信されるクーポンコード（IG-から始まる英数字）をコピー',
    '4. 本アプリの【チケットコードで丁寧に作る】枠に貼り付けて生成！',
    '',
    '※通常の「1日15回スケッチモード」「1日1回丁寧モード」も引き続き無料でご利用いただけます。'
  ],
  ctaText: '図案帳を開く / コードを入力する',
};
