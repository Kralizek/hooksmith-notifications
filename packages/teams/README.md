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
trigger and pass its generated URL to `workflowUrl`. The listener posts a JSON
payload containing `text` and treats any `2xx` response as success.
