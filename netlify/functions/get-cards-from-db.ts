import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { admin } from "./firebase/firebaseAdmin";
import { fetchUserCards } from "./firebase/db";
import type { Cards } from "./types/dataTypes";
import { getHeaders, responseObject } from './helpers/helpers';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle preflight
    if (event.httpMethod === "OPTIONS") {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "" })
    }

    const { headers } = event;
    const authHeader = headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    // catch attempts to access without idToken
    if (!idToken) {
      return responseObject(401, ["allowOrigin"], { message: "Missing ID token" })
    }

    // auth process, using provided it token
    let verifiedUser;
    try {
      verifiedUser = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return responseObject(401, ["allowOrigin"], { message: "Invalid auth credential", error })
    }

    const { uid } = verifiedUser;

    let userCards: Cards;

    // search db for existing card record
    try {
      userCards = await fetchUserCards(uid);
    } catch (error) {
      return responseObject(400, ["allowOrigin"], { message: "Failed to get cards from database", error })
    }

    return {
      statusCode: 200,
      headers: getHeaders(["allowOrigin", "allowHeaders", "allowMethods"]),
      body: JSON.stringify(userCards)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: getHeaders(["allowOrigin"]),
      body: JSON.stringify({
        error,
        message: "Internal server error"
      })
    };
  }
};
