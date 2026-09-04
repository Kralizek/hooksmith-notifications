import type { Context, Event, Listener } from "@hooksmith/core";
import { httpPost, jsonBody, type ValueOrFactory } from "@hooksmith/http";

/** Adaptive Card payload accepted by the Teams workflow listener. */
export type TeamsAdaptiveCard = Record<string, unknown>;

/** Additional native payload fields sent to the Teams workflow webhook. */
export type TeamsPayload = Record<string, unknown>;

/** Options used to send a Teams workflow message from a Hooksmith event. */
export interface TeamsMessageOptions<TEvent extends Event = Event> {
  workflowUrl: ValueOrFactory<string | URL, TEvent>;
  text?: ValueOrFactory<string, TEvent>;
  adaptiveCards?: ValueOrFactory<TeamsAdaptiveCard[], TEvent>;
  payload?: ValueOrFactory<TeamsPayload, TEvent>;
}

export function sendMessage<TEvent extends Event = Event>(
  options: TeamsMessageOptions<TEvent>,
): Listener<TEvent> {
  return httpPost<TEvent>({
    name: "teams",
    url: options.workflowUrl,
    body: jsonBody<TEvent>(async (event: TEvent, context: Context) => ({
      ...(options.payload === undefined
        ? {}
        : await resolve(options.payload, event, context)),
      ...(options.text === undefined
        ? {}
        : { text: await resolve(options.text, event, context) }),
      ...(options.adaptiveCards === undefined ? {} : {
        type: "message",
        attachments: (await resolve(options.adaptiveCards, event, context)).map(
          (card) => ({
            contentType: "application/vnd.microsoft.card.adaptive",
            contentUrl: null,
            content: card,
          }),
        ),
      }),
    })),
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
