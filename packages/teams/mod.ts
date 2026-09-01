import type { Event, Listener } from "@hooksmith/core";
import { httpPost, jsonBody, type ValueOrFactory } from "@hooksmith/http";

export interface TeamsMessageOptions<TEvent extends Event = Event> {
  workflowUrl: ValueOrFactory<string | URL, TEvent>;
  text: ValueOrFactory<string, TEvent>;
}

export function sendMessage<TEvent extends Event = Event>(options: TeamsMessageOptions<TEvent>): Listener<TEvent> {
  return httpPost<TEvent>({
    url: options.workflowUrl,
    body: jsonBody<TEvent>(async (event, context) => ({
      text: await resolve(options.text, event, context),
    })),
  });
}

async function resolve<T, TEvent extends Event>(value: ValueOrFactory<T, TEvent>, event: TEvent, context: Parameters<Extract<ValueOrFactory<T, TEvent>, Function>>[1]): Promise<T> {
  return typeof value === "function"
    ? await (value as (event: TEvent, context: typeof context) => T | Promise<T>)(event, context)
    : value;
}
