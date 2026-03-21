import type { Context } from "@netlify/functions";
import { fetchWithRetry } from "../../helpers.ts";
// import { getCache, setCache } from "../lib/cache.ts";
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

    // working fetch
    // const response = await fetchWithRetry(url, {});
    // test response for testing caching
    const response = { name: 'Haunter', type: 'ghost' };

    // const data = await response.json();
    const data = response;

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
