import type { HandlerEvent, HandlerContext } from "@netlify/functions";
import { admin } from "./firebase/firebaseAdmin";
import { fetchCardByID, updateCardCount } from "./firebase/db";
import { responseObject } from './helpers/helpers';

interface eventBodyInterface {
    cardID: string;
    countModifier: number;
}

export const handler = async (event: HandlerEvent, context: HandlerContext) => {
    try {
        // Handle preflight
        if (event.httpMethod === "OPTIONS") {
            return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "" })
        }

        // catch attempts to access without request body
        let eventBody;
        try {
            eventBody = JSON.parse(event.body || "{}");
        } catch (error) {
            return responseObject(400, ["allowOrigin"], { message: "Invalid JSON", error })
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
        const { cardID, countModifier }: eventBodyInterface = eventBody;
        // search db for existing card record
        let existingCardRecord;
        try {
            existingCardRecord = await fetchCardByID(uid, cardID);
        } catch (error) {
            return responseObject(404, ["allowOrigin"], { message: "failed to find card", error })
        }

        let count;
        if (existingCardRecord) {
            count = existingCardRecord.count + countModifier;
        }

        // update existing record
        try {
            updateCardCount(uid, cardID, count)
        } catch (error) {
            return responseObject(400, ["allowOrigin"], { message: "Failed to update card from database", error })
        }

        return responseObject(200, ["allowOrigin", "allowHeaders", "allowMethods"], { message: "Card successfully updated." })

    } catch (error) {
        return responseObject(500, ["allowOrigin"], { message: "Internal server error", error })
    }
};
