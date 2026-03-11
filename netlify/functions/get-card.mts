import type { Context } from "@netlify/functions";
import { findCardByID } from "pokemon-tcg-sdk-typescript/dist/services/cardService.js";

export default async (req: Request, context: Context) => {
  findCardByID('sv3pt5-93')
    .then((card: any) => {
      return new Response(card)
    })
    .catch((error: any) => {
      return new Response(error)
    });
}