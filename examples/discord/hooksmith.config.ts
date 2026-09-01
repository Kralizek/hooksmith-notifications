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
      content: (event) => `${event.data.title}\n\n${event.metadata?.url}`,
    })],
  }],
} satisfies Config<PageEvent>;
