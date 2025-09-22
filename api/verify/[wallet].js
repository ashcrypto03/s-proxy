// GET /api/verify/:wallet  — Vercel Serverless Function
const WALLET_REGEX = /^0x[a-fA-F0-9]{40}$/;

export default async function handler(req, res) {
  try {
    const { wallet } = req.query;

    if (!wallet || !WALLET_REGEX.test(wallet)) {
      return res.status(400).json({ error: "Invalid wallet address" });
      }

    const apiKey = process.env.SOMNEX_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing SOMNEX_API_KEY" });
    }

    const upstream = `https://dapp.somnex.xyz/api/event/swap-somi/${wallet}`;

    const r = await fetch(upstream, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json"
      }
    });

    const text = await r.text();

    res
      .status(r.status)
      .setHeader("content-type", r.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    res.status(502).json({ error: "Upstream fetch failed", detail: String(err?.message || err) });
  }
}
