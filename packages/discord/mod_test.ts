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

Deno.test("sendMessage composes embeds, components, and native payload", async () => {
  await withFetch((input, init) => {
    assertEquals(
      String(input),
      "https://discord.com/api/webhooks/1/token?wait=true&with_components=true",
    );
    assertEquals(JSON.parse(String(init?.body)), {
      tts: true,
      content: "explicit",
      embeds: [{ title: "Build complete" }],
      components: [{ type: 1, components: [] }],
      username: "Hooksmith",
    });
    return Promise.resolve(Response.json({ id: "m2", channel_id: "c1" }));
  }, async () => {
    await sendMessage({
      webhookUrl: "https://discord.com/api/webhooks/1/token",
      payload: { content: "payload", tts: true },
      content: "explicit",
      embeds: [{ title: "Build complete" }],
      components: [{ type: 1, components: [] }],
      username: "Hooksmith",
    }).run(event, context);
  });
});

Deno.test("sendMessage supports payload-only rich messages", async () => {
  await withFetch((_input, init) => {
    assertEquals(JSON.parse(String(init?.body)), {
      embeds: [{ description: "payload-only" }],
      allowed_mentions: { parse: [] },
    });
    return Promise.resolve(Response.json({ id: "m3", channel_id: "c1" }));
  }, async () => {
    await sendMessage({
      webhookUrl: "https://discord.com/api/webhooks/1/token",
      payload: {
        embeds: [{ description: "payload-only" }],
        allowed_mentions: { parse: [] },
      },
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
