import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchWithRetry, responseObject } from './helpers/helpers';
import { getCacheItem, setCache } from "./cache/cache.js";
import { admin } from "./firebase/firebaseAdmin";

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
    let cardID: string = '';
    if (queryStringParameters && queryStringParameters['id']) {
      cardID = queryStringParameters['id'];
    } else {
      return responseObject(401, ["allowOrigin"], { message: "Missing id parameter" })
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

    // check cache for card using ID, if present return it
    const cached = getCacheItem(cardID);
    if (cached) {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { [cardID]: cached })
    }

    let response;

    // if card not already in db, search external API for it
    const url = `https://api.tcgdex.net/v2/en/cards/${cardID}`;
    try {
      response = await fetchWithRetry(url, {});
    } catch (error) {
      return responseObject(404, ["allowOrigin"], { message: "failed to find card", error })
    }



    const data = await response.json();

    setCache(cardID, data);

    return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], data)
  } catch (error) {
    return responseObject(500, ["allowOrigin"], { message: "Internal server error", error })
  }
};
