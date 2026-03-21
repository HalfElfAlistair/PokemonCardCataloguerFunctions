import type { Context } from "@netlify/functions";
import { fetchWithRetry } from "../../helpers.ts";
import { getCache, setCache } from "../lib/cache";


export default async (req: Request, context: Context) => {
  const { name } = await req.json();
  try {
    const url = `https://api.tcgdex.net/v2/en/cards?name=${name}`;

    // run cache check before request, if data exists then return it as the response
    const cached = getCache(name);
    console.log('cached', cached)
    if (cached) {
      console.log("Serving from cache:", name);
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetchWithRetry(url, {});

    const data = await response.json();

    // store data from request in cache
    setCache(name, data);


    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500
    });
  }
};
