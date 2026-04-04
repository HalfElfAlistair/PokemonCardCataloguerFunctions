import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { admin } from "./firebase/firebaseAdmin";
import { fetchCardByID } from "./firebase/db";
import { getHeaders, responseObject } from './helpers/helpers';

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle preflight
    if (event.httpMethod === "OPTIONS") {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "" })
    }

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

    // auth process, using provided it token
    let verifiedUser;
    try {
      verifiedUser = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      return responseObject(401, ["allowOrigin"], { message: "Invalid auth credential", error })
    }

    const { uid } = verifiedUser;

    // search db for card
    let response;
    try {
      response = await fetchCardByID(uid, cardID);
    } catch (error) {
      return responseObject(404, ["allowOrigin"], { message: "failed to find card in database", error })
    }

    let data;
    if (response) {
      data = await response.json();
    }

    return {
      statusCode: 200,
      headers: getHeaders(["allowOrigin", "allowHeaders", "allowMethods"]),
      body: JSON.stringify(data)
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
