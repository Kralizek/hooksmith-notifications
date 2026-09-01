import type { Context, Event, Listener } from "@hooksmith/core";
import {
  bearerAuth,
  httpPost,
  jsonBody,
  type ValueOrFactory,
} from "@hooksmith/http";

export interface SlackMessageResult {
  channel: string;
  ts: string;
}

export interface SlackMessageOptions<TEvent extends Event = Event> {
  token: ValueOrFactory<string, TEvent>;
  channel: ValueOrFactory<string, TEvent>;
  text: ValueOrFactory<string, TEvent>;
  threadTs?: ValueOrFactory<string, TEvent>;
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
    body: jsonBody<TEvent>(async (event, context) => ({
      channel: await resolve(options.channel, event, context),
      text: await resolve(options.text, event, context),
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
