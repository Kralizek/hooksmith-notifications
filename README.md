# hooksmith-notifications

Notification and messaging extensions for
[Hooksmith](https://github.com/Kralizek/hooksmith).

## Packages

| Package                                                   | Purpose                                                   |
| --------------------------------------------------------- | --------------------------------------------------------- |
| [`@hooksmith/slack`](https://jsr.io/@hooksmith/slack)     | Send messages through the Slack Web API.                  |
| [`@hooksmith/discord`](https://jsr.io/@hooksmith/discord) | Send messages through Discord webhooks.                   |
| [`@hooksmith/teams`](https://jsr.io/@hooksmith/teams)     | Send messages through Microsoft Teams Workflows webhooks. |

All packages build on `@hooksmith/http` and expose Hooksmith listeners rather
than standalone API clients.

## Examples

- [`examples/slack`](examples/slack)
- [`examples/discord`](examples/discord)
- [`examples/teams`](examples/teams)

## Development

```sh
deno task check
```

## Release

Run the **Release** workflow manually and choose a `major`, `minor`, or `patch`
version bump. All workspace packages are versioned and released together.

## License

MIT
