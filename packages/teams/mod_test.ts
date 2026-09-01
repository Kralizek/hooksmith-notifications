import { assertEquals } from "@std/assert";
import type { Context, Event } from "@hooksmith/core";
import { sendMessage } from "./mod.ts";

const event: Event = {
  type: "test.event",
  timestamp: Temporal.Instant.from("2026-01-01T00:00:00Z"),
  source: { kind: "test" },
  data: {},
};
const context: Context = {
  log: { debug() {}, info() {}, warn() {}, error() {} },
};

Deno.test("sendMessage posts to a Teams Workflow webhook", async () => {
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
