# @hooksmith/slack

Slack messaging extensions for Hooksmith using the Slack Web API.

```ts
import { sendMessage } from "@hooksmith/slack";

const listener = sendMessage({
  token: Deno.env.get("SLACK_BOT_TOKEN")!,
  channel: "C0123456789",
  text: (event) => `Published: ${event.metadata?.url}`,
});
```

The token needs the `chat:write` scope and the app must be able to post to the
target conversation. The listener uses `chat.postMessage` and returns the
channel and message timestamp from Slack.
