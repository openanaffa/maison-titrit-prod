import { initBotId } from "botid/client/core";

// Vercel BotID: invisible bot challenge on the public write endpoints.
// Each path here must call checkBotId() server-side (lib/bot.ts).
initBotId({
  protect: [
    { path: "/api/checkout", method: "POST" },
    { path: "/api/auth/register", method: "POST" },
    { path: "/api/track", method: "POST" },
  ],
});
