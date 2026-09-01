import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/discord";

interface PageData {
  title: string;
}
type PageEvent = Event<PageData>;

export default {
  routes: [{
    name: "notify-discord",
    listeners: [sendMessage<PageEvent>({
      webhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL")!,
      content: (event) => event.data.title,
      embeds: (event) => [{
        title: event.data.title,
        url: event.metadata?.url,
        description: "A new page was published.",
      }],
      payload: {
        allowed_mentions: { parse: [] },
      },
    })],
  }],
} satisfies Config<PageEvent>;
