import type { Context, Event, Listener } from "@hooksmith/core";
import {
  expectStatus,
  httpPost,
  jsonBody,
  type ValueOrFactory,
} from "@hooksmith/http";

/** Discord embed included in a webhook message. */
export type DiscordEmbed = Record<string, unknown>;

/** Discord message component included in a webhook message. */
export type DiscordComponent = Record<string, unknown>;

/** Additional native fields sent to the Discord webhook. */
export type DiscordPayload = Record<string, unknown>;

/** Identifiers returned after Discord successfully creates a webhook message. */
export interface DiscordMessageResult {
  id: string;
  channelId: string;
}

/** Options used to send a Discord webhook message from a Hooksmith event. */
export interface DiscordMessageOptions<TEvent extends Event = Event> {
  webhookUrl: ValueOrFactory<string | URL, TEvent>;
  content?: ValueOrFactory<string, TEvent>;
  embeds?: ValueOrFactory<DiscordEmbed[], TEvent>;
  components?: ValueOrFactory<DiscordComponent[], TEvent>;
  username?: ValueOrFactory<string, TEvent>;
  avatarUrl?: ValueOrFactory<string, TEvent>;
  payload?: ValueOrFactory<DiscordPayload, TEvent>;
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
      if (options.components !== undefined) {
        url.searchParams.set("with_components", "true");
      }
      return url;
    },
    body: jsonBody<TEvent>(async (event: TEvent, context: Context) => ({
      ...(options.payload === undefined
        ? {}
        : await resolve(options.payload, event, context)),
      ...(options.content === undefined
        ? {}
        : { content: await resolve(options.content, event, context) }),
      ...(options.embeds === undefined
        ? {}
        : { embeds: await resolve(options.embeds, event, context) }),
      ...(options.components === undefined
        ? {}
        : { components: await resolve(options.components, event, context) }),
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
