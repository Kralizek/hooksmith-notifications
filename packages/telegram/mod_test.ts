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

Deno.test("sendMessage posts through Telegram Bot API", async () => {
  await withFetch((input, init) => {
    assertEquals(
      String(input),
      "https://api.telegram.org/bot123:abc/sendMessage",
    );
    assertEquals(JSON.parse(String(init?.body)), {
      chat_id: 42,
      text: "hello",
    });
    return Promise.resolve(Response.json({
      ok: true,
      result: { message_id: 7, chat: { id: 42 } },
    }));
  }, async () => {
    const result = await sendMessage({
      token: "123:abc",
      chatId: 42,
      text: "hello",
    }).run(event, context);

    assertEquals(result.success, true);
    assertEquals(result.data, { messageId: 7, chatId: 42 });
  });
});

Deno.test("sendMessage composes Telegram options and native payload", async () => {
  await withFetch((_input, init) => {
    assertEquals(JSON.parse(String(init?.body)), {
      allow_paid_broadcast: false,
      chat_id: "@hooksmith",
      text: "*Hello*",
      parse_mode: "MarkdownV2",
      message_thread_id: 5,
      disable_notification: true,
      protect_content: true,
      link_preview_options: { is_disabled: true },
      reply_markup: {
        inline_keyboard: [[{ text: "Open", url: "https://example.com" }]],
      },
    });
    return Promise.resolve(Response.json({
      ok: true,
      result: { message_id: 8, chat: { id: -100123 } },
    }));
  }, async () => {
    const result = await sendMessage({
      token: "123:abc",
      chatId: "@hooksmith",
      text: "*Hello*",
      parseMode: "MarkdownV2",
      messageThreadId: 5,
      disableNotification: true,
      protectContent: true,
      linkPreviewOptions: { is_disabled: true },
      replyMarkup: {
        inline_keyboard: [[{ text: "Open", url: "https://example.com" }]],
      },
      payload: { allow_paid_broadcast: false, chat_id: "ignored" },
    }).run(event, context);

    assertEquals(result.success, true);
  });
});

Deno.test("sendMessage resolves factories", async () => {
  await withFetch((_input, init) => {
    assertEquals(JSON.parse(String(init?.body)), {
      chat_id: 99,
      text: "test.event",
    });
    return Promise.resolve(Response.json({
      ok: true,
      result: { message_id: 9, chat: { id: 99 } },
    }));
  }, async () => {
    const result = await sendMessage({
      token: () => "123:abc",
      chatId: () => 99,
      text: (current) => current.type,
    }).run(event, context);

    assertEquals(result.success, true);
  });
});

Deno.test("sendMessage treats Telegram API errors as failures", async () => {
  await withFetch(
    () =>
      Promise.resolve(Response.json({
        ok: false,
        error_code: 400,
        description: "Bad Request: chat not found",
      }, { status: 400 })),
    async () => {
      const result = await sendMessage({
        token: "123:abc",
        chatId: 42,
        text: "hello",
      }).run(event, context);

      assertFalse(result.success);
      assertEquals(result.data, {
        status: 400,
        errorCode: 400,
        description: "Bad Request: chat not found",
      });
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
