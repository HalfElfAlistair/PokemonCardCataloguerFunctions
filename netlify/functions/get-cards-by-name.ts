import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchWithRetry, responseObject } from './helpers/helpers';
import { getCache } from "./cache/cache.js";
import { admin } from "./firebase/firebaseAdmin";
import type { Cards } from "./types/dataTypes";

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle preflight
    if (event.httpMethod === "OPTIONS") {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "" })
    }

    // collect idToken and cardName from query params and headers
    const { headers, queryStringParameters } = event;
    const authHeader = headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    let cardName: string = '';
    if (queryStringParameters && queryStringParameters['name']) {
      cardName = queryStringParameters['name'];
    } else {
      return responseObject(401, ["allowOrigin"], { message: "Missing name parameter" })
    }

    // catch attempts to access without idToken
    if (!idToken) {
      return responseObject(401, ["allowOrigin"], { message: "Missing ID token" })
    }

    // auth process, using provided it token, ends function if invalid
    let verifiedUser;
    try {
      verifiedUser = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return responseObject(401, ["allowOrigin"], { message: "Invalid auth credential", error })
    }

    // checks through entire cache for name matches and adds to cached variable
    const cacheGlobal = getCache();
    let cached: Cards = {};
    let isCachedEmpty: boolean = true;
    for (const cardID in cacheGlobal) {
      const { name } = cacheGlobal[cardID];
      if (name.toLowerCase().search(cardName) >= 0) {
        cached[cardID] = cacheGlobal[cardID];
        isCachedEmpty = false;
      }
    }

    if (!isCachedEmpty) {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], cached)
    }

    const url = `https://api.tcgdex.net/v2/en/cards?name=${cardName}`;
    let response;
    try {
      response = await fetchWithRetry(url, {});
    } catch (error) {
      return responseObject(404, ["allowOrigin"], { message: "failed to find card", error })
    }

    const responseData = await response.json();

    // unlike id search, card search response is an object with multiple child objects. This collects and re-organises
    let data: Cards = {};
    for (const card of responseData) {
      const cardID: string = card['id'];
      data[cardID] = card;
    }

    return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], data)
  } catch (error) {
    return responseObject(500, ["allowOrigin"], { message: "Internal server error", error })
  }
};
