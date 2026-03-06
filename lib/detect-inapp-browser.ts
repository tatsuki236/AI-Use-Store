/**
 * アプリ内ブラウザ（WebView）を検知する
 * LINE, Facebook, Instagram, Twitter/X, KAKAOTALK, Messenger 等
 */
export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";

  const inAppPatterns = [
    /Line\//i,        // LINE
    /FBAV\//i,        // Facebook App
    /FBAN\//i,        // Facebook App (別パターン)
    /Instagram/i,     // Instagram
    /Twitter/i,       // Twitter
    /KAKAOTALK/i,     // KakaoTalk
    /Messenger/i,     // Facebook Messenger
  ];

  return inAppPatterns.some((pattern) => pattern.test(ua));
}
