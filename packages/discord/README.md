# @hooksmith/discord

Discord messaging extensions for Hooksmith.

## Setup

Hooksmith needs the incoming webhook URL for the Discord channel where messages
should be posted.

1. Open the Discord server and go to **Server Settings** > **Integrations**.
2. Open **Webhooks** and create a new webhook.
3. Choose the destination text channel and optionally give the webhook a name
   and avatar.
4. Select **Copy Webhook URL**.

The webhook URL contains the webhook ID and token. Treat the complete URL as a
secret because anyone holding it can post through that webhook.

Store it somewhere available to the Hooksmith process, for example:

```sh
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Map it to `webhookUrl`:

```ts
import { sendMessage } from "@hooksmith/discord";

const listener = sendMessage({
  webhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL")!,
  content: (event) => `Published: ${event.metadata?.url}`,
});
```

`sendMessage` executes the webhook with `wait=true` and returns the created
message ID and channel ID. `username` and `avatarUrl` can optionally override
the webhook identity for the message.

## Rich messages

`content`, `embeds`, and `components` are optional and can be combined where
Discord permits the combination.

```ts
const listener = sendMessage({
  webhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL")!,
  content: "Deployment complete",
  embeds: [{
    title: "Production",
    description: "The deployment completed successfully.",
  }],
});
```

When `components` is supplied, Hooksmith automatically adds
`with_components=true` to the webhook URL. Discord restricts interactive
components to application-owned webhooks; ordinary webhooks can use
non-interactive components.

## Native Discord payload

Use `payload` for Execute Webhook fields that the package does not expose
explicitly, such as `tts`, `allowed_mentions`, `flags`, `poll`, `thread_name`,
or `applied_tags`.

```ts
const listener = sendMessage({
  webhookUrl: Deno.env.get("DISCORD_WEBHOOK_URL")!,
  embeds: [{ title: "Deployment complete" }],
  payload: {
    allowed_mentions: { parse: [] },
    flags: 4096,
  },
});
```

The native payload is applied first. Explicit `content`, `embeds`, `components`,
`username`, and `avatarUrl` options override matching native fields when they
are supplied.

File uploads are intentionally not part of this JSON message API because
Discord requires `multipart/form-data` for file content. They can be added as a
separate listener without complicating the common JSON path.
