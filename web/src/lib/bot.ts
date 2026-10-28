import { NextResponse } from "next/server";
import { checkBotId } from "botid/server";

/** 403 response when Vercel BotID flags the caller as a bot, else null. */
export async function rejectBots(): Promise<NextResponse | null> {
  const { isBot } = await checkBotId();
  return isBot ? NextResponse.json({ error: "Accès refusé." }, { status: 403 }) : null;
}
