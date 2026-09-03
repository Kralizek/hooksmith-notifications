import type { Context, Event, Listener } from "@hooksmith/core";
import { httpPost, jsonBody, type ValueOrFactory } from "@hooksmith/http";

export type TelegramPayload = Record<string, unknown>;
export type TelegramReplyMarkup = Record<string, unknown>;
export type TelegramLinkPreviewOptions = Record<string, unknown>;

export interface TelegramMessageResult {
  messageId: number;
  chatId: number;
}

export interface TelegramMessageOptions<TEvent extends Event = Event> {
  token: ValueOrFactory<string, TEvent>;
  chatId: ValueOrFactory<number | string, TEvent>;
  text: ValueOrFactory<string, TEvent>;
  parseMode?: ValueOrFactory<string, TEvent>;
  messageThreadId?: ValueOrFactory<number, TEvent>;
  disableNotification?: ValueOrFactory<boolean, TEvent>;
  protectContent?: ValueOrFactory<boolean, TEvent>;
  linkPreviewOptions?: ValueOrFactory<TelegramLinkPreviewOptions, TEvent>;
  replyMarkup?: ValueOrFactory<TelegramReplyMarkup, TEvent>;
  payload?: ValueOrFactory<TelegramPayload, TEvent>;
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: { id: number };
  };
  description?: string;
  error_code?: number;
}

/** Sends a text message through the Telegram Bot API. */
export function sendMessage<TEvent extends Event = Event>(
  options: TelegramMessageOptions<TEvent>,
): Listener<TEvent> {
  return httpPost<TEvent>({
    url: async (event, context) => {
      const token = await resolve(options.token, event, context);
      return `https://api.telegram.org/bot${token}/sendMessage`;
    },
    body: jsonBody<TEvent>(async (event: TEvent, context: Context) => ({
      ...(options.payload === undefined
        ? {}
        : await resolve(options.payload, event, context)),
      chat_id: await resolve(options.chatId, event, context),
      text: await resolve(options.text, event, context),
      ...(options.parseMode === undefined
        ? {}
        : { parse_mode: await resolve(options.parseMode, event, context) }),
      ...(options.messageThreadId === undefined ? {} : {
        message_thread_id: await resolve(
          options.messageThreadId,
          event,
          context,
        ),
      }),
      ...(options.disableNotification === undefined ? {} : {
        disable_notification: await resolve(
          options.disableNotification,
          event,
          context,
        ),
      }),
      ...(options.protectContent === undefined ? {} : {
        protect_content: await resolve(options.protectContent, event, context),
      }),
      ...(options.linkPreviewOptions === undefined ? {} : {
        link_preview_options: await resolve(
          options.linkPreviewOptions,
          event,
          context,
        ),
      }),
      ...(options.replyMarkup === undefined ? {} : {
        reply_markup: await resolve(options.replyMarkup, event, context),
      }),
    })),
    response: {
      parse: "json",
      success: ({ status, body }) =>
        status >= 200 && status < 300 && (body as TelegramResponse).ok === true,
      successMap: ({ body }): TelegramMessageResult => {
        const response = body as TelegramResponse;
        return {
          messageId: response.result!.message_id,
          chatId: response.result!.chat.id,
        };
      },
      errorMap: ({ status, body }) => {
        const response = body as TelegramResponse | undefined;
        return {
          status,
          errorCode: response?.error_code,
          description: response?.description,
        };
      },
    },
  });
}

async function resolve<T, TEvent extends Event>(
  value: ValueOrFactory<T, TEvent>,
  event: TEvent,
  context: Context,
): Promise<T> {
  return typeof value === "function"
    ? await (value as (event: TEvent, context: Context) => T | Promise<T>)(
      event,
      context,
    )
    : value;
}
