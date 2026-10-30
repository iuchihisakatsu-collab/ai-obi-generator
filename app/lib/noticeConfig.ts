// lib/noticeConfig.ts

export interface NoticeConfig {
  id: string;            // 告知ごとにユニークなID（変えると全ユーザーに再表示されます）
  enabled: boolean;       // ポップアップを出すかどうか（出さない時は false）
  category: string;      // ラベル（例：重要なお知らせ、新着商品、イベント情報）
  title: string;         // お知らせのタイトル
  imageUrl?: string;     // アイキャッチ画像のURL（ない場合は空文字 ''）
  body: string[];        // 本文（段落ごとに配列）
  highlightBox?: string[]; // 目立たせたい枠内の箇条書き（不要なら空配列 []）
  primaryButton: {       // メインボタン
    label: string;
    action: 'close' | 'geometric' | 'link';
    url?: string;        // actionが 'link' の場合の飛び先
  };
  secondaryButton?: {     // サブボタン（不要なら undefined）
    label: string;
    action: 'close' | 'geometric' | 'link';
    url?: string;
  };
}

// ★ 次回からここを書き換えるだけでポップアップが自由自在に切り替わります
export const CURRENT_NOTICE: NoticeConfig = {
  id: 'notice-20261030-limit-update',
  enabled: true,
  category: '重要なお知らせ',
  title: 'AI生成の利用回数変更と、今後の運用についてのお願い',
  // imageUrl: 'https://store.gofukuyasan.com/html/upload/save_image/...', // 写真を載せたい場合はURLを指定
  body: [
    'いつも「妄想小紋図案帖」をお楽しみいただき、誠にありがとうございます。',
    '公開以来、予想をはるかに上回る数千回ものAI図案生成をいただき、大変嬉しく思っております。……が、正直に申し上げますと、あまりの反響にゴフクヤサンのお財布がパンク寸前になってしまいました。',
    '急な制限となってしまい、本当にごめんなさい。',
    'その代わりといっては何ですが、mm単位で実寸連動する「格子・水玉製作所」の機能を大幅にパワーアップいたしました。こちらはサーバー代・API代を気にせず、何十回でも心ゆくまで無料で遊んでいただけます。',
    '現在の最高画質AI生成を残しつつ、よりコストを抑えた仕組みと組み合わせた「ハイブリッド運用」を現在模索中です。準備が整い次第、またご案内いたします。'
  ],
  highlightBox: [
    'AI図案生成：1日3回 → しばらくの間【1日1回】に変更',
    '格子・水玉製作所：大幅アップデート【完全無料・無制限】'
  ],
  primaryButton: {
    label: '了解しました（1日1回のAI妄想を楽しむ）',
    action: 'close'
  },
  secondaryButton: {
    label: '作り放題の「格子・水玉製作所」を試す →',
    action: 'geometric'
  }
};
