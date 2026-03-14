import type { Context } from "@netlify/functions";
import { fetchWithRetry } from "../../helpers.ts";

export default async (req: Request, context: Context) => {
  const { name } = await req.json();
  try {
    const url = `https://api.tcgdex.net/v2/en/cards?name=${name}`;

    const response = await fetchWithRetry(url, {});

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500
    });
  }
};
