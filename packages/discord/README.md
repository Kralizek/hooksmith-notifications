# @hooksmith/discord

Discord messaging extensions for Hooksmith.

```ts
import { sendMessage } from "@hooksmith/discord";

const listener = sendMessage({
  webhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL")!,
  content: (event) => `Published: ${event.metadata?.url}`,
});
```

`sendMessage` executes a Discord webhook with `wait=true` and returns the
created message ID and channel ID. `username` and `avatarUrl` can optionally
override the webhook identity for the message.
