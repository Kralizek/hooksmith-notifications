import { assertEquals } from "@std/assert";
import type { Context, Event } from "@hooksmith/core";
import { nullLoggerFactory } from "@hooksmith/runtime";
import { sendMessage } from "./mod.ts";

const event: Event = {
  type: "test.event",
  timestamp: Temporal.Instant.from("2026-01-01T00:00:00Z"),
  source: { kind: "test" },
  data: {},
};
const context: Context = {
  logger: nullLoggerFactory,
};

Deno.test("sendMessage posts text to a Teams Workflow webhook", async () => {
  await withFetch((input, init) => {
    assertEquals(String(input), "https://example.test/teams-workflow");
    assertEquals(JSON.parse(String(init?.body)), { text: "hello" });
    return Promise.resolve(new Response(null, { status: 202 }));
  }, async () => {
    const result = await sendMessage({
      workflowUrl: "https://example.test/teams-workflow",
      text: "hello",
    }).run(event, context);
    assertEquals(result.success, true);
  });
});

Deno.test("sendMessage wraps adaptive cards for the Teams webhook schema", async () => {
  await withFetch((_input, init) => {
    assertEquals(JSON.parse(String(init?.body)), {
      source: "hooksmith",
      type: "message",
      attachments: [{
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          type: "AdaptiveCard",
          version: "1.5",
          body: [{ type: "TextBlock", text: "Build complete" }],
        },
      }],
    });
    return Promise.resolve(new Response(null, { status: 202 }));
  }, async () => {
    await sendMessage({
      workflowUrl: "https://example.test/teams-workflow",
      payload: { type: "custom", source: "hooksmith" },
      adaptiveCards: [{
        type: "AdaptiveCard",
        version: "1.5",
        body: [{ type: "TextBlock", text: "Build complete" }],
      }],
    }).run(event, context);
  });
});

Deno.test("sendMessage supports payload-only workflow requests", async () => {
  await withFetch((_input, init) => {
    assertEquals(JSON.parse(String(init?.body)), {
      type: "MessageCard",
      summary: "Build complete",
    });
    return Promise.resolve(new Response(null, { status: 202 }));
  }, async () => {
    await sendMessage({
      workflowUrl: "https://example.test/teams-workflow",
      payload: { type: "MessageCard", summary: "Build complete" },
    }).run(event, context);
  });
});

async function withFetch(
  implementation: typeof fetch,
  test: () => Promise<void>,
): Promise<void> {
  const original = globalThis.fetch;
  globalThis.fetch = implementation;
  try {
    await test();
  } finally {
    globalThis.fetch = original;
  }
}
