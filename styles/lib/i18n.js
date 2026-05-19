export const SUPPORTED_LANGS = ["en", "th", "ja"];

const translations = {
  title: { en: "Send Crypto", th: "ส่ง Crypto", ja: "暗号通貨を送る" },
  subtitle: { en: "Open with any wallet — just tap below", th: "เปิดด้วย wallet ใดก็ได้ — แตะปุ่มด้านล่าง", ja: "任意のウォレットで開く — 下のボタンをタップ" },
  walletSectionTitle: { en: "Choose your wallet", th: "เลือก wallet ของคุณ", ja: "ウォレットを選択" },
  copyAddress: { en: "Copy address", th: "คัดลอกที่อยู่", ja: "アドレスをコピー" },
  copied: { en: "Copied!", th: "คัดลอกแล้ว!", ja: "コピーしました!" },
  amountLabel: { en: "Amount (optional)", th: "จำนวน (ไม่บังคับ)", ja: "金額（任意）" },
  amountPlaceholder: { en: "0.00", th: "0.00", ja: "0.00" },
  chatTitle: { en: "Ask AI", th: "ถามผู้ช่วย AI", ja: "AIに質問" },
  chatPlaceholder: { en: "Ask anything about this payment…", th: "ถามเกี่ยวกับการชำระเงิน…", ja: "支払いについて質問する…" },
  chatSend: { en: "Send", th: "ส่ง", ja: "送信" },
  chatGreeting: { en: "Hi! I can help you send USDT/USDC on BNB Chain.", th: "สวัสดี! ฉันช่วยคุณส่ง USDT/USDC บน BNB Chain ได้ครับ", ja: "こんにちは！BNBチェーンでUSDT/USDCの送金をお手伝いします。" },
  errorGeneral: { en: "Something went wrong. Please try again.", th: "เกิดข้อผิดพลาด กรุณาลองใหม่", ja: "エラーが発生しました。もう一度お試しください。" },
};

export function t(key, lang = "en") {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] ?? entry["en"] ?? key;
}

export function detectLang() {
  if (typeof navigator === "undefined") return "en";
  const raw = navigator.language?.slice(0, 2).toLowerCase();
  if (raw === "th") return "th";
  if (raw === "ja") return "ja";
  return "en";
}
