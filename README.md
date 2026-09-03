# hooksmith-notifications

Notification and messaging extensions for [Hooksmith](https://github.com/Kralizek/hooksmith).

These packages expose Hooksmith listeners for common messaging providers. They are intentionally not general-purpose provider SDKs: configuration stays focused on event processing, while HTTP transport is delegated to `@hooksmith/http`.

## Packages

| Package | Purpose |
| --- | --- |
| [`@hooksmith/discord`](https://jsr.io/@hooksmith/discord) | Send messages through Discord webhooks. |
| [`@hooksmith/slack`](https://jsr.io/@hooksmith/slack) | Send messages through the Slack Web API. |
| [`@hooksmith/teams`](https://jsr.io/@hooksmith/teams) | Send messages through Microsoft Teams Workflows webhooks. |

All packages build on `@hooksmith/http` and return ordinary Hooksmith `Listener` instances. That means they can be used directly in routes, as the terminal listener of a typed pipeline, or through `tap(listener)` when the notification should be a side effect and the current pipeline value should continue downstream.

For example:

```ts
pipe(
  project(toNotification),
  tap(slack),
  project(toArchiveRecord),
  archive,
);
```

## Examples

- [`examples/discord`](examples/discord)
- [`examples/slack`](examples/slack)
- [`examples/teams`](examples/teams)

Each example is isolated and contains the configuration needed to exercise that provider.

The main Hooksmith repository also contains an end-to-end [`aws-sqs-slack-lambda`](https://github.com/Kralizek/hooksmith/tree/master/examples/aws-sqs-slack-lambda) example that combines this repository with `@hooksmith/aws-lambda`.

## Provider setup

The examples document the provider-specific credentials or webhook URLs required by each listener. In broad terms:

- Slack uses the Web API and a bot token/channel configuration.
- Discord uses an incoming webhook URL and supports webhook message payloads.
- Teams uses a Microsoft Teams Workflows webhook URL and supports workflow message/card payloads exposed by the package.

## Ecosystem

This repository follows its own release cadence and depends on the public Hooksmith contracts plus `@hooksmith/http`. It does not depend on the Hooksmith runtime engine.

See the [main Hooksmith repository](https://github.com/Kralizek/hooksmith) for the runtime, typed pipeline operators, CLI, GitHub Action, AWS integrations, and the complete extension catalog.

## Development

```sh
deno task check
```

## Release

Run the **Release** workflow manually and choose a `major`, `minor`, or `patch` version bump. All workspace packages are versioned and released together.

## License

MIT
