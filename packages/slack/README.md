# @hooksmith/slack

Slack messaging extensions for Hooksmith using the Slack Web API.

## Setup

Hooksmith needs a Slack bot token and a destination channel ID.

1. Create or open a Slack app at <https://api.slack.com/apps>.
2. Under **OAuth & Permissions**, add the `chat:write` bot token scope.
3. Install or reinstall the app to the target workspace.
4. Copy the **Bot User OAuth Token**. Bot tokens normally start with `xoxb-`.
5. Add the app to the channel where Hooksmith should post. For public channels,
   `chat:write.public` can be used when posting without joining the channel.
6. Copy the channel ID. Slack channel IDs look like `C0123456789` and are
   preferred over channel names.

Store the values somewhere available to the Hooksmith process, for example:

```sh
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL=C0123456789
```

Map them to `token` and `channel` respectively:

```ts
import { sendMessage } from "@hooksmith/slack";

const listener = sendMessage({
  token: Deno.env.get("SLACK_BOT_TOKEN")!,
  channel: Deno.env.get("SLACK_CHANNEL")!,
  text: (event) => `Published: ${event.metadata?.url}`,
});
```

The listener uses Slack's `chat.postMessage` API and returns the channel and
message timestamp from Slack.

## Rich messages

`text`, `blocks`, and `attachments` are optional and can be combined. For rich
messages, `text` is useful as the notification and accessibility fallback.

```ts
const listener = sendMessage({
  token: Deno.env.get("SLACK_BOT_TOKEN")!,
  channel: "C0123456789",
  text: "Deployment complete",
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Deployment complete* :rocket:",
      },
    },
  ],
});
```

## Native Slack payload

Use `payload` for `chat.postMessage` fields that the package does not expose
explicitly. It can be static or event/context-derived and composes with the
first-class options.

```ts
const listener = sendMessage({
  token: Deno.env.get("SLACK_BOT_TOKEN")!,
  channel: "C0123456789",
  text: "Deployment complete",
  payload: {
    unfurl_links: false,
    metadata: {
      event_type: "deployment_complete",
      event_payload: { environment: "production" },
    },
  },
});
```

The native payload is applied first. Explicit `channel`, `text`, `blocks`,
`attachments`, and `threadTs` options override the corresponding native Slack
fields when they are supplied. This keeps common message construction convenient
while leaving access to the full `chat.postMessage` payload surface.
