import type { Context, Event, Listener } from "@hooksmith/core";
import {
  bearerAuth,
  httpPost,
  jsonBody,
  type ValueOrFactory,
} from "@hooksmith/http";

/** Slack Block Kit block included in a message payload. */
export type SlackBlock = Record<string, unknown>;

/** Slack attachment included in a message payload. */
export type SlackAttachment = Record<string, unknown>;

/** Additional native fields sent to Slack's `chat.postMessage` API. */
export type SlackPayload = Record<string, unknown>;

/** Identifiers returned after Slack successfully posts a message. */
export interface SlackMessageResult {
  channel: string;
  ts: string;
}

/** Options used to send a Slack message from a Hooksmith event. */
export interface SlackMessageOptions<TEvent extends Event = Event> {
  token: ValueOrFactory<string, TEvent>;
  channel: ValueOrFactory<string, TEvent>;
  text?: ValueOrFactory<string, TEvent>;
  blocks?: ValueOrFactory<readonly SlackBlock[], TEvent>;
  attachments?: ValueOrFactory<readonly SlackAttachment[], TEvent>;
  threadTs?: ValueOrFactory<string, TEvent>;
  payload?: ValueOrFactory<SlackPayload, TEvent>;
}

interface SlackResponse {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
}

export function sendMessage<TEvent extends Event = Event>(
  options: SlackMessageOptions<TEvent>,
): Listener<TEvent> {
  return httpPost<TEvent>({
    url: "https://slack.com/api/chat.postMessage",
    headers: bearerAuth(options.token),
    body: jsonBody<TEvent>(async (event: TEvent, context: Context) => ({
      ...(options.payload === undefined
        ? {}
        : await resolve(options.payload, event, context)),
      channel: await resolve(options.channel, event, context),
      ...(options.text === undefined
        ? {}
        : { text: await resolve(options.text, event, context) }),
      ...(options.blocks === undefined
        ? {}
        : { blocks: await resolve(options.blocks, event, context) }),
      ...(options.attachments === undefined
        ? {}
        : { attachments: await resolve(options.attachments, event, context) }),
      ...(options.threadTs === undefined
        ? {}
        : { thread_ts: await resolve(options.threadTs, event, context) }),
    })),
    response: {
      parse: "json",
      success: ({ status, body }) =>
        status >= 200 && status < 300 && (body as SlackResponse).ok === true,
      successMap: ({ body }): SlackMessageResult => {
        const response = body as SlackResponse;
        return { channel: response.channel!, ts: response.ts! };
      },
      errorMap: ({ status, body }) => ({
        status,
        error: (body as SlackResponse | undefined)?.error,
      }),
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
