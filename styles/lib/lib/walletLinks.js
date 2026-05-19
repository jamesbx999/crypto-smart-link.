export const BEP20_TOKENS = {
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  USDC: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
};

export function buildEIP681URI({ address, chainId = 56, amount, token }) {
  const contractAddress = BEP20_TOKENS[token];
  if (contractAddress && amount) {
    const amountWei = String(Math.round(parseFloat(amount) * 1e18));
    return `ethereum:${contractAddress}@${chainId}/transfer?address=${address}&uint256=${amountWei}`;
  }
  if (contractAddress) {
    return `ethereum:${contractAddress}@${chainId}/transfer?address=${address}`;
  }
  return `ethereum:${address}@${chainId}`;
}

export const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    color: "#F6851B",
    deepLink: ({ address, chainId, amount, token }) => {
      const contract = BEP20_TOKENS[token] ?? address;
      return `https://metamask.app.link/send/${contract}@${chainId}/transfer?address=${address}${amount ? `&uint256=${Math.round(parseFloat(amount)*1e18)}` : ""}`;
    },
    universalLink: ({ address, chainId, amount, token }) => buildEIP681URI({ address, chainId, amount, token }),
  },
  {
    id: "trust",
    name: "Trust Wallet",
    color: "#3375BB",
    deepLink: ({ address, amount, token }) => {
      return `trust://send?coin=20000714&token_id=${BEP20_TOKENS[token] ?? ""}&address=${address}${amount ? `&amount=${amount}` : ""}`;
    },
    universalLink: ({ address, amount, token }) => {
      return `https://link.trustwallet.com/send?coin=20000714&token_id=${BEP20_TOKENS[token] ?? ""}&address=${address}${amount ? `&amount=${amount}` : ""}`;
    },
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    color: "#1652F0",
    deepLink: ({ address, chainId, amount, token }) => {
      return `https://go.cb-w.com/send?address=${address}&chain=${chainId}&token=${token}${amount ? `&amount=${amount}` : ""}`;
    },
  },
  {
    id: "rainbow",
    name: "Rainbow",
    color: "#FF4EEF",
    deepLink: ({ address, chainId, amount, token }) => {
      return `https://rnbwapp.com/send?address=${address}&chain=${chainId}&token=${token}${amount ? `&amount=${amount}` : ""}`;
    },
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    color: "#3B99FC",
    deepLink: () => "https://walletconnect.com/",
    note: "Scan QR with any wallet",
  },
];

export const CHAIN_IDS = {
  ethereum: 1, polygon: 137, bsc: 56, arbitrum: 421
