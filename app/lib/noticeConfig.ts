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
  // ★ IDを更新して全員に確実にお知らせを表示
  id: 'notice-202611-maintenance',
  category: '⚠️ お知らせ',
  title: '現在、新キャンペーンの準備＆テスト中です！',
  subtitle: 'まもなく楽しい企画がスタートします。もう少々お待ちください。',
  badge: '予告',
  imageUrl: '',
  body: [
    'いつも「妄想小紋図案帖」で遊んでいただきありがとうございます。',
    'ただいま、皆さまにもっと楽しんでいただける新しいプレゼントキャンペーンのシステム設定と最終テストを行っております。',
    '図案の生成機能はそのままお使いいただけますので、テスト完了と正式スタートまで、もう少々お待ちくださいませ。'
  ],
  highlightBox: [
    '■ ちょっとだけ予告',
    '近々、あなたが作った図案が「本物の帯」になるキャンペーンが始まります…👘✨',
    '今のうちに、お気に入りの図案を作って保存して準備しておいてくださいね！'
  ],
  ctaText: '図案を作りながら待つ',
};
