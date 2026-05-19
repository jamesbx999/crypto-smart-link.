import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPTS = {
  en: `You are a helpful assistant on a crypto payment page.
Help users send USDT or USDC on BNB Chain (BEP20, chain ID 56) using MetaMask and Trust Wallet.
Always remind users to select BNB Chain network in their wallet, not Ethereum or Polygon.
Be concise and friendly. Do not give financial advice.`,

  th: `คุณเป็นผู้ช่วยบนหน้าชำระเงิน crypto
ช่วยผู้ใช้ส่ง USDT หรือ USDC บน BNB Chain (BEP20) ผ่าน MetaMask และ Trust Wallet
เตือนผู้ใช้เสมอให้เลือก BNB Chain ใน wallet ไม่ใช่ Ethereum หรือ Polygon
กระชับ เป็นมิตร ไม่ให้คำแนะนำทางการเงิน`,

  ja: `あなたはBNBチェーン上のUSDT/USDC送金をサポートするアシスタントです。
MetaMaskやTrust WalletでBNBチェーン（BEP20）を選択するよう必ず伝えてください。
簡潔で親切に答えてください。金融アドバイスは行わないでください。`,
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, lang = "en" } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "messages required" });

  const sanitized = messages
    .slice(-10)
    .filter((m) => m.role && m.content)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 512,
      system: SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.en,
      messages: sanitized,
    });
    return res.status(200).json({ reply: response.content?.[0]?.text ?? "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "AI request failed" });
  }
}
