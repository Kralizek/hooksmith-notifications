# @hooksmith/telegram

Telegram notification listener for
[Hooksmith](https://github.com/Kralizek/hooksmith), built on `@hooksmith/http`
and the Telegram Bot API.

## Send a message

```ts
import type { Config, Event } from "@hooksmith/core";
import { sendMessage } from "@hooksmith/telegram";

interface Deployment {
  version: string;
}

type DeploymentEvent = Event<Deployment>;

export default {
  routes: [{
    name: "notify-telegram",
    listeners: [sendMessage<DeploymentEvent>({
      token: Deno.env.get("TELEGRAM_BOT_TOKEN")!,
      chatId: Deno.env.get("TELEGRAM_CHAT_ID")!,
      text: (event) => `Deployment ${event.data.version} completed`,
    })],
  }],
} satisfies Config<DeploymentEvent>;
```

`token`, `chatId`, `text`, and the optional message fields accept either fixed
values or factories that receive the current Hooksmith event and context.

`sendMessage()` also supports commonly useful Telegram fields such as
`parseMode`, `messageThreadId`, `disableNotification`, `protectContent`,
`linkPreviewOptions`, and `replyMarkup`. Use `payload` to pass additional
Telegram-native fields; explicit Hooksmith options override conflicting values
from `payload`.

The listener returns the Telegram `messageId` and `chatId` in its successful
result data.

## Setup

1. Open a chat with [BotFather](https://t.me/BotFather) in Telegram.
2. Use `/newbot` and follow the prompts to create a bot.
3. Save the bot token as `TELEGRAM_BOT_TOKEN`.
4. Add the bot to the target chat/channel, or start a private conversation with
   it.
5. Obtain the target chat ID and save it as `TELEGRAM_CHAT_ID`. Public channels
   can also be addressed with their `@channelusername`.

The bot must have permission to send messages in the target chat or channel.

## Pipelines

`sendMessage()` returns an ordinary Hooksmith listener, so it can be terminal or
used through pipeline helpers such as `tap()`:

```ts
pipe(
  project(toNotification),
  tap(sendMessage({
    token,
    chatId,
    text: (event) => event.data.text,
  })),
  nextListener,
);
```

## License

MIT
