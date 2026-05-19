import { useState, useEffect } from "react";
import Head from "next/head";
import { t, detectLang, SUPPORTED_LANGS } from "../lib/i18n";
import { WALLETS, getChainId } from "../lib/walletLinks";

const CHAIN = process.env.NEXT_PUBLIC_CHAIN || "bsc";
const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS || "";
const DISPLAY_NAME = process.env.NEXT_PUBLIC_DISPLAY_NAME || "";
const DEFAULT_TOKEN = process.env.NEXT_PUBLIC_DEFAULT_TOKEN || "USDT";

const CHAIN_INFO = { label: "BNB Chain (BEP20)", color: "#F3BA2F" };
const TOKEN_ICON = { USDT: "💚", USDC: "🔵" };
const LANG_FLAG = { en: "🇺🇸", th: "🇹🇭", ja: "🇯🇵" };
const WALLET_EMOJI = { metamask: "🦊", trust: "🛡️", coinbase: "🔵", rainbow: "🌈", walletconnect: "🔗" };

export default function HomePage() {
  const [lang, setLang] = useState("en");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: "" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLang(detectLang());
    setIsMobile(/Mobi|Android|iPhone/i.test(navigator.userAgent));
    setMessages([{ role: "assistant", content: t("chatGreeting", detectLang()) }]);
  }, []);

  const chainId = getChainId(CHAIN);
  const shortAddress = WALLET_ADDRESS ? `${WALLET_ADDRESS.slice(0, 6)}…${WALLET_ADDRESS.slice(-4)}` : "—";
  const walletContext = { address: WALLET_ADDRESS, chainId, amount, token };

  async function copyAddress() {
    if (!WALLET_ADDRESS) return;
    await navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function sendChat() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, lang }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || t("errorGeneral", lang) }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("errorGeneral", lang) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>{DISPLAY_NAME || "Crypto Smart Link"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="page">
        <div className="orb orb1" /><div className="orb orb2" />
        <div className="lang-row">
          {SUPPORTED_LANGS.map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {LANG_FLAG[l]} {l.toUpperCase()}
            </button>
          ))}
        </div>
        <main className="card">
          <div className="card-header">
            <div className="avatar">💳</div>
            <div>
              <h1 className="title">{DISPLAY_NAME || t("title", lang)}</h1>
              <p className="subtitle">{t("subtitle", lang)}</p>
            </div>
          </div>
          <div><span className="badge">● {CHAIN_INFO.label}</span></div>
          <div className="addr-row">
            <code className="addr">{shortAddress}</code>
            <button className="copy-btn" onClick={copyAddress}>
              {copied ? `✓ ${t("copied", lang)}` : `⎘ ${t("copyAddress", lang)}`}
            </button>
          </div>
          <div>
            <div className="sec-label">Token</div>
            <div className="token-tabs">
              {["USDT", "USDC"].map((tk) => (
                <button key={tk} className={`token-tab ${token === tk ? "active" : ""}`} onClick={() => setToken(tk)}>
                  {TOKEN_ICON[tk]} {tk}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="sec-label" htmlFor="amount">{t("amountLabel", lang)} ({token})</label>
            <input id="amount" type="number" min="0" step="any" placeholder="0.00" value={amount}
              onChange={(e) => setAmount(e.target.value)} className="amt-input" />
          </div>
          <div className="sec-label">{t("walletSectionTitle", lang)}</div>
          <div className="wallets">
            {WALLETS.map((w) => {
              const link = isMobile ? w.deepLink?.(walletContext) : w.universalLink?.(walletContext) ?? w.deepLink?.(walletContext);
              return (
                <a key={w.id} href={link || "#"} className="wallet-btn" style={{ "--wc": w.color }}
                  target={w.id === "walletconnect" ? "_blank" : "_self"} rel="noopener noreferrer">
                  <span className="wi">{WALLET_EMOJI[w.id]}</span>
                  <span className="wn">{w.name}</span>
                  {w.note && <span className="wnote">{w.note}</span>}
                  <span className="wa">↗</span>
                </a>
              );
            })}
          </div>
          <p className="foot">{isMobile ? "Tap to open wallet app" : "Desktop: use browser extension or scan QR"}</p>
        </main>

        <button className="chat-toggle" onClick={() => setChatOpen((o) => !o)}>
          {chatOpen ? "✕" : "💬"} <span>{t("chatTitle", lang)}</span>
        </button>

        {chatOpen && (
          <div className="chat-panel">
            <div className="chat-header"><span>🤖 {t("chatTitle", lang)}</span><button onClick={() => setChatOpen(false)}>✕</button></div>
            <div className="chat-msgs">
              {messages.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.content}</div>)}
              {loading && <div className="bubble assistant">...</div>}
            </div>
            <div className="chat-input">
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder={t("chatPlaceholder", lang)} rows={2} disabled={loading} />
              <button onClick={sendChat} disabled={loading || !input.trim()}>{t("chatSend", lang)}</button>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#0d0e1a;color:#fff;min-height:100vh}
      `}</style>
      <style jsx>{`
        .page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 16px 100px;position:relative;overflow-x:hidden}
        .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;opacity:.2}
        .orb1{width:400px;height:400px;background:#6c63ff;top:-80px;right:-80px}
        .orb2{width:300px;height:300px;background:#F3BA2F;bottom:-60px;left:-60px}
        .lang-row{display:flex;gap:8px;margin-bottom:20px;z-index:1}
        .lang-btn{padding:4px 12px;border-radius:50px;border:1px solid rgba(255,255,255,.15);background:transparent;color:rgba(255,255,255,.45);font-size:12px;cursor:pointer;transition:all .15s}
        .lang-btn.active{background:rgba(243,186,47,.2);border-color:#F3BA2F;color:#F3BA2F}
        .card{width:100%;max-width:440px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:28px;z-index:1;display:flex;flex-direction:column;gap:18px}
        .card-header{display:flex;align-items:center;gap:14px}
        .avatar{width:50px;height:50px;border-radius:14px;background:linear-gradient(135deg,#F3BA2F,#e6a800);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
        .title{font-size:20px;font-weight:700;color:#fff}
        .subtitle{font-size:12px;color:rgba(255,255,255,.45);margin-top:3px;line-height:1.4}
        .badge{font-size:12px;font-weight:700;padding:3px 12px;border-radius:50px;border:1px solid #F3BA2F55;background:#F3BA2F18;color:#F3BA2F}
        .addr-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px 14px}
        .addr{flex:1;font-size:13px;color:rgba(255,255,255,.8);font-family:monospace}
        .copy-btn{flex-shrink:0;background:none;border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.6);font-size:11px;padding:4px 10px;border-radius:8px;cursor:pointer;transition:all .15s;white-space:nowrap}
        .copy-btn:hover{background:rgba(255,255,255,.08);color:#fff}
        .sec-label{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.35);margin-bottom:6px}
        .token-tabs{display:flex;gap:8px}
        .token-tab{flex:1;padding:10px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.45);font-size:14px;font-weight:700;cursor:pointer;transition:all .15s}
        .token-tab.active{border-color:#F3BA2F;background:rgba(243,186,47,.15);color:#F3BA2F}
        .amt-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:#fff;font-size:18px;font-weight:600;padding:12px 16px;outline:none;transition:border-color .15s}
        .amt-input:focus{border-color:#F3BA2F}
        .amt-input::placeholder{color:rgba(255,255,255,.2)}
        .wallets{display:flex;flex-direction:column;gap:8px}
        .wallet-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);color:#fff;text-decoration:none;cursor:pointer;transition:all .15s}
        .wallet-btn:hover{background:rgba(255,255,255,.09);border-color:var(--wc)}
        .wi{font-size:20px;flex-shrink:0}
        .wn{font-size:13px;font-weight:600;flex:1}
        .wnote{font-size:10px;color:rgba(255,255,255,.35)}
        .wa{font-size:12px;color:rgba(255,255,255,.3)}
        .foot{font-size:10px;color:rgba(255,255,255,.25);text-align:center;line-height:1.5}
        .chat-toggle{position:fixed;bottom:24px;right:24px;display:flex;align-items:center;gap:8px;padding:12px 18px;border-radius:50px;background:linear-gradient(135deg,#F3BA2F,#e6a800);color:#000;border:none;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 20px rgba(243,186,47,.4);z-index:1000;transition:transform .15s}
        .chat-toggle:hover{transform:scale(1.05)}
        .chat-panel{position:fixed;bottom:88px;right:24px;width:320px;max-height:460px;background:#1a1b2e;border:1px solid rgba(255,255,255,.12);border-radius:20px;display:flex;flex-direction:column;z-index:999;overflow:hidden}
        .chat-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600;font-size:13px}
        .chat-header button{background:none;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:16px}
        .chat-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
        .bubble{padding:8px 12px;border-radius:12px;font-size:12px;line-height:1.5;max-width:88%;word-break:break-word}
        .bubble.user{background:linear-gradient(135deg,#F3BA2F,#e6a800);color:#000;align-self:flex-end;font-weight:600}
        .bubble.assistant{background:rgba(255,255,255,.08);color:rgba(255,255,255,.9);align-self:flex-start}
        .chat-input{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.08)}
        .chat-input textarea{flex:1;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:12px;padding:7px 9px;resize:none;outline:none;font-family:inherit}
        .chat-input textarea::placeholder{color:rgba(255,255,255,.3)}
        .chat-input button{padding:0 12px;border-radius:8px;background:linear-gradient(135deg,#F3BA2F,#e6a800);color:#000;border:none;font-size:12px;font-weight:700;cursor:pointer}
        .chat-input button:disabled{opacity:.4;cursor:not-allowed}
        @media(max-width:480px){.card{padding:20px;gap:14px}.chat-panel{width:calc(100vw - 32px);right:16px}}
      `}</style>
    </>
  );
}
