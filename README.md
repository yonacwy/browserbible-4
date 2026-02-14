# BrowserBible v4

Bible software that runs in the browser, created by John Dyer and maintained by the Digital Bible Society.

## Getting started

Clone, install, and run the dev server:

```bash
git clone https://github.com/yonacwy/browserbible-4
cd browserbible-4
pnpm install
pnpm dev
```

## Adding local Bible packs (offline usage)

If you want to use local bible packs (for offline use or testing), follow these steps:

1. Download a starter bible pack and extract it into `app/content/texts`: create the app/content/texts folder if doesnt exist.

```bash
wget https://bibles.dbs.org/_assets/starter-pack.zip (if wget doesnt work just download via browser)
unzip starter-pack.zip -d app/content/texts
```

2. Generate the texts manifest (this reads folder names and `info.json` files under `app/content/texts` and writes `app/content/texts/texts.json`):

```bash
pnpm run generate:texts
```

3. Start the dev server and work offline if desired:

```bash
pnpm dev
```

Notes:

- The repository intentionally ignores the full bible HTML content under `app/content/texts/*` to avoid committing large binary/text packs. Only the generated manifests (`app/content/texts/texts.json` and `app/content/commentaries/commentaries.json`) are tracked.
- If you add a new bible folder, re-run `pnpm run generate:texts` to refresh the manifest shown in the UI.
- If your bible folder does not contain a top-level `info.json`, the app will attempt to use `html_chapterized/info.json` as a fallback.

## Development helpers

- Regenerate the texts manifest:

```bash
pnpm run generate:texts
```

- Lint JS files:

```bash
pnpm run lint
```

## Contributing

Please avoid committing large bible packs into the repository; instead include small sample metadata or instructions to reproduce the environment.
