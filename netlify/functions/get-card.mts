import type { Context } from "@netlify/functions";
import { findCardByID } from "pokemon-tcg-sdk-typescript/dist/services/cardService.js";

export default async (req: Request, context: Context) => {
  try {
    const card = await findCardByID('sv3pt5-93');
    return new Response(JSON.stringify(card))
  } catch {
    return new Response('error')
  }
  // findCardByID('sv3pt5-93')
  //   .then((card: any) => {
  //     return new Response(card.data.name)
  //   })
  //   .catch((error: any) => {
  //     return new Response(error)
  //   });
}