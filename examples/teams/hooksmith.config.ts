import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/teams";

interface PageData {
  title: string;
}
type PageEvent = Event<PageData>;

export default {
  routes: [{
    name: "notify-teams",
    listeners: [sendMessage<PageEvent>({
      workflowUrl: Deno.env.get("TEAMS_WORKFLOW_URL")!,
      adaptiveCards: (event) => [{
        type: "AdaptiveCard",
        version: "1.5",
        body: [
          {
            type: "TextBlock",
            text: event.data.title,
            weight: "Bolder",
          },
          {
            type: "TextBlock",
            text: String(event.metadata?.url ?? ""),
            wrap: true,
          },
        ],
      }],
    })],
  }],
} satisfies Config<PageEvent>;
