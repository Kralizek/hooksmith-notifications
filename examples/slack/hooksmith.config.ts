import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/slack";

interface PageData { title: string; }
type PageEvent = Event<PageData>;

export default {
  routes: [{
    name: "notify-slack",
    listeners: [sendMessage<PageEvent>({
      token: Deno.env.get("SLACK_BOT_TOKEN")!,
      channel: Deno.env.get("SLACK_CHANNEL")!,
      text: (event) => `${event.data.title}\n\n${event.metadata?.url}`,
    })],
  }],
} satisfies Config<PageEvent>;
