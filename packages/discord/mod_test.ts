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

Deno.test("sendMessage executes a Discord webhook", async () => {
  await withFetch((input, init) => {
    assertEquals(
      String(input),
      "https://discord.com/api/webhooks/1/token?wait=true",
    );
    assertEquals(JSON.parse(String(init?.body)), { content: "hello" });
    return Promise.resolve(Response.json({ id: "m1", channel_id: "c1" }));
  }, async () => {
    const result = await sendMessage({
      webhookUrl: "https://discord.com/api/webhooks/1/token",
      content: "hello",
    }).run(event, context);
    assertEquals(result.success, true);
    assertEquals(result.data, { id: "m1", channelId: "c1" });
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
