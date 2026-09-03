import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/telegram";

interface PageData {
  title: string;
}
type PageEvent = Event<PageData>;

export default {
  routes: [{
    name: "notify-telegram",
    listeners: [sendMessage<PageEvent>({
      token: Deno.env.get("TELEGRAM_BOT_TOKEN")!,
      chatId: Deno.env.get("TELEGRAM_CHAT_ID")!,
      text: (event) => `${event.data.title}\n\n${event.metadata?.url}`,
      linkPreviewOptions: { is_disabled: true },
    })],
  }],
} satisfies Config<PageEvent>;
