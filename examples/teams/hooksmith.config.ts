import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/teams";

interface PageData { title: string; }
type PageEvent = Event<PageData>;

export default {
  routes: [{
    name: "notify-teams",
    listeners: [sendMessage<PageEvent>({
      workflowUrl: Deno.env.get("TEAMS_WORKFLOW_URL")!,
      text: (event) => `${event.data.title}\n\n${event.metadata?.url}`,
    })],
  }],
} satisfies Config<PageEvent>;
