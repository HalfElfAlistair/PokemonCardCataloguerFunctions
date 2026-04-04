import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { admin } from "./firebase/firebaseAdmin.js";
import { addList } from "./firebase/db.js";
import { responseObject } from "./helpers/helpers.js";

interface eventBodyInterface {
  listName: string;
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
  try {
    // Handle preflight
    if (event.httpMethod === "OPTIONS") {
      return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "" })
    }

    // collect idToken
    const { headers } = event;
    const authHeader = headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    // catch attempts to access without request body
    let eventBody;
    try {
      eventBody = JSON.parse(event.body || "{}");
    } catch (error) {
      return responseObject(400, ["allowOrigin"], { message: "Invalid JSON", error })
    }

    const { listName }: eventBodyInterface = eventBody;

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

    try {
      addList(verifiedUser.uid, listName)
    } catch (error) {
      return responseObject(400, ["allowOrigin"], { message: "Failed to add card to database", error })
    }

    return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "Card successfully added." })

  } catch (error) {
    return responseObject(500, ["allowOrigin"], { message: "Internal server error", error })
  }
};
