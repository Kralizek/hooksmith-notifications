import type { Context, Event, Listener } from "@hooksmith/core";
import { httpPost, jsonBody, type ValueOrFactory } from "@hooksmith/http";

export interface TeamsMessageOptions<TEvent extends Event = Event> {
  workflowUrl: ValueOrFactory<string | URL, TEvent>;
  text: ValueOrFactory<string, TEvent>;
}

export function sendMessage<TEvent extends Event = Event>(
  options: TeamsMessageOptions<TEvent>,
): Listener<TEvent> {
  return httpPost<TEvent>({
    url: options.workflowUrl,
    body: jsonBody<TEvent>(async (event: TEvent, context: Context) => ({
      text: await resolve(options.text, event, context),
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
