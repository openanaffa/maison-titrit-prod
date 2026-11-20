import { checkBotId } from "botid/server";
import { NextResponse } from "next/server";

/**
 * 403 response when Vercel BotID flags the caller as a bot, else null.
 *
 * BotID only has signal on Vercel's runtime — off Vercel (self-hosted
 * checkouts, local/CI runs against a production build) the check cannot
 * work and must not block legitimate orders.
 */
export async function rejectBots(): Promise<NextResponse | null> {
	if (!process.env.VERCEL) return null;
	const { isBot } = await checkBotId();
	return isBot
		? NextResponse.json(
				{
					error:
						"La commande n’a pas pu être vérifiée. Réessayez ou commandez sur WhatsApp.",
				},
				{ status: 403 },
			)
		: null;
}
