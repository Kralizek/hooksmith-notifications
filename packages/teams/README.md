# @hooksmith/teams

Microsoft Teams messaging extensions for Hooksmith using Teams Workflows.

```ts
import { sendMessage } from "@hooksmith/teams";

const listener = sendMessage({
  workflowUrl: Deno.env.get("TEAMS_WORKFLOW_URL")!,
  text: (event) => `Published: ${event.metadata?.url}`,
});
```

Create a Teams Workflow using the **When a Teams webhook request is received**
trigger and pass its generated URL to `workflowUrl`. The listener treats any
`2xx` response as success.

## Adaptive Cards

`adaptiveCards` accepts one or more native Adaptive Card objects and wraps them
in the message envelope expected by the Teams webhook trigger.

```ts
const listener = sendMessage({
  workflowUrl: Deno.env.get("TEAMS_WORKFLOW_URL")!,
  adaptiveCards: [{
    type: "AdaptiveCard",
    version: "1.5",
    body: [{
      type: "TextBlock",
      text: "Deployment complete",
      weight: "Bolder",
    }],
  }],
});
```

## Native Teams payload

Use `payload` to send fields or supported message shapes that are not modeled
explicitly. It composes with `text` and `adaptiveCards`.

```ts
const listener = sendMessage({
  workflowUrl: Deno.env.get("TEAMS_WORKFLOW_URL")!,
  payload: {
    source: "hooksmith",
  },
  adaptiveCards: [{
    type: "AdaptiveCard",
    version: "1.5",
    body: [{ type: "TextBlock", text: "Deployment complete" }],
  }],
});
```

The native payload is applied first. Explicit `text` and `adaptiveCards` options
override the corresponding native message fields when supplied.
