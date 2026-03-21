import type { Context } from "@netlify/functions";
import { fetchWithRetry } from "../../helpers.ts";
import { getCache, setCache } from "../lib/cache";

// temporary data for testing requests
import { testingData } from "../../testingData.ts";


export default async (req: Request, context: Context) => {
  const { cardID } = await req.json();
  try {
    const url = `https://api.tcgdex.net/v2/en/cards/${cardID}`;

    // run cache check before request, if data exists then return it as the response
    const cached = getCache(cardID);
    if (cached) {
      console.log("Serving from cache:", cardID);
      return new Response(JSON.stringify(cached), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // const response = await fetchWithRetry(url, {});
    const { cards } = testingData;
    const key = cardID as keyof typeof cards;
    const response = cards[key];

    // const data = await response.json();
    const data = response;

    // store data from request in cache
    setCache(cardID, data);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500
    });
  }
};
