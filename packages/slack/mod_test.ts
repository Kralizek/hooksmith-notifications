import { assertEquals, assertFalse } from "@std/assert";
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

Deno.test("sendMessage posts through Slack chat.postMessage", async () => {
  await withFetch((_input, init) => {
    const headers = new Headers(init?.headers);
    assertEquals(headers.get("authorization"), "Bearer xoxb-test");
    assertEquals(JSON.parse(String(init?.body)), {
      channel: "C123",
      text: "hello",
    });
    return Promise.resolve(
      Response.json({ ok: true, channel: "C123", ts: "123.456" }),
    );
  }, async () => {
    const result = await sendMessage({
      token: "xoxb-test",
      channel: "C123",
      text: "hello",
    }).run(event, context);
    assertEquals(result.success, true);
    assertEquals(result.data, { channel: "C123", ts: "123.456" });
  });
});

Deno.test("sendMessage treats Slack API errors as failures", async () => {
  await withFetch(
    () =>
      Promise.resolve(Response.json({ ok: false, error: "not_in_channel" })),
    async () => {
      const result = await sendMessage({
        token: "xoxb-test",
        channel: "C123",
        text: "hello",
      }).run(event, context);
      assertFalse(result.success);
      assertEquals(result.data, { status: 200, error: "not_in_channel" });
    },
  );
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
