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
  // ★ IDを更新して確実に再表示させる
  id: 'notice-202611-monthly-campaign',
  category: '🎁 毎月開催！プレゼントキャンペーン',
  title: 'あなたの図案が「本物の帯」になる！',
  subtitle: '毎月抽選で1名様に、投稿してくれた図案を本物の半幅帯に仕立ててプレゼント👘',
  badge: 'キャンペーン',
  imageUrl: '',
  body: [
    '妄想小紋図案帖で作ったお気に入りの図案を、Instagramでシェアしませんか？',
    '毎月月末締めで、ハッシュタグ「#妄想小紋図案帖」をつけてInstagramのフィードに投稿してくれた方の中から【抽選で毎月1名様】に、その図案を新潟工場で染めて本物の半幅帯にしてプレゼントいたします！',
    '',
    '🎫 【さらに！】ストーリーズで @gofukuyasan をメンションして作成途中の画面や図案をシェアすると、自動でDMに「丁寧に作るモード」が5回分使えるチケットコードが届きます！'
  ],
  highlightBox: [
    '■ プレゼント応募方法',
    '1. アプリでお気に入りの図案を作成',
    '2. 画像を保存し、Instagramのフィードに投稿',
    '3. その際、必ずハッシュタグ #妄想小紋図案帖 と @gofukuyasan のメンションをつける',
    '',
    '※毎月月末締め。翌月上旬にストーリーズのルーレット抽選で公平に当選者を決定します！'
  ],
  ctaText: 'さっそく図案を作ってみる',
};
