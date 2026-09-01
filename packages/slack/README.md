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
fields when they are supplied. This keeps common message construction
convenient while leaving access to the full `chat.postMessage` payload surface.
