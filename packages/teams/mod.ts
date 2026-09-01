import type { Context, Event, Listener } from "@hooksmith/core";
import { httpPost, jsonBody, type ValueOrFactory } from "@hooksmith/http";

export type TeamsAdaptiveCard = Record<string, unknown>;
export type TeamsPayload = Record<string, unknown>;

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
