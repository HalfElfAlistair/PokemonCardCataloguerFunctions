import type { Context } from "@netlify/functions";

const apiKey = process.env.POKEMONTCG_API_KEY ?? "";

export default async (req: Request, context: Context) => {
  try {
    const res = await fetch("https://api.pokemontcg.io/v2/cards/sv3pt5-93", {
      headers: {
        "X-Api-Key": apiKey
      }
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500
    });
  }
}