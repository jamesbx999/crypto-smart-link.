import { WALLETS, buildEIP681URI, getChainId, BEP20_TOKENS } from "../../lib/walletLinks";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const {
    wallet = "metamask",
    amount,
    token = "USDT",
    chain = process.env.NEXT_PUBLIC_CHAIN || "bsc",
    address = process.env.NEXT_PUBLIC_WALLET_ADDRESS,
  } = req.query;

  if (!address) return res.status(400).json({ error: "Wallet address not configured" });

  const chainId = getChainId(chain);
  const walletDef = WALLETS.find((w) => w.id === wallet);
  if (!walletDef) return res.status(404).json({ error: `Unknown wallet: ${wallet}` });

  const context = { address, chainId, amount, token };
  const deepLink = walletDef.deepLink?.(context) ?? null;
  const universalLink = walletDef.universalLink?.(context) ?? deepLink;
  const eip681 = buildEIP681URI({ address, chainId, amount, token });
  const tokenContract = BEP20_TOKENS[token] ?? null;

  return res.status(200).json({
    wallet: walletDef.id,
    name: walletDef.name,
    deepLink,
    universalLink,
    eip681,
    address,
    chainId,
    chain,
    token,
    tokenContract,
    amount: amount ?? null,
  });
}
