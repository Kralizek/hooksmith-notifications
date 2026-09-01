import type { Context, Event, Listener } from "@hooksmith/core";
import {
  expectStatus,
  httpPost,
  jsonBody,
  type ValueOrFactory,
} from "@hooksmith/http";

export interface DiscordMessageResult {
  id: string;
  channelId: string;
}

export interface DiscordMessageOptions<TEvent extends Event = Event> {
  webhookUrl: ValueOrFactory<string | URL, TEvent>;
  content: ValueOrFactory<string, TEvent>;
  username?: ValueOrFactory<string, TEvent>;
  avatarUrl?: ValueOrFactory<string, TEvent>;
}

interface DiscordMessageResponse {
  id: string;
  channel_id: string;
}

export function sendMessage<TEvent extends Event = Event>(
  options: DiscordMessageOptions<TEvent>,
): Listener<TEvent> {
  return httpPost<TEvent>({
    url: async (event, context) => {
      const url = new URL(
        String(await resolve(options.webhookUrl, event, context)),
      );
      url.searchParams.set("wait", "true");
      return url;
    },
    body: jsonBody<TEvent>(async (event, context) => ({
      content: await resolve(options.content, event, context),
      ...(options.username === undefined
        ? {}
        : { username: await resolve(options.username, event, context) }),
      ...(options.avatarUrl === undefined
        ? {}
        : { avatar_url: await resolve(options.avatarUrl, event, context) }),
    })),
    response: {
      parse: "json",
      success: expectStatus(200),
      successMap: ({ body }): DiscordMessageResult => {
        const response = body as DiscordMessageResponse;
        return { id: response.id, channelId: response.channel_id };
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
