# Pixabay API Codex Skill

A Codex skill and dependency-free Node.js CLI for searching the Pixabay image and video API safely.

## Features

- Searches Pixabay images and videos with focused, URL-encoded queries.
- Enables SafeSearch by default and validates common filters before making an API call.
- Caches successful searches for 24 hours in the system temporary directory.
- Returns compact JSON with creator, dimensions, preview URL, Pixabay source page, and attribution.
- Keeps the API key out of source code, output, and cache identifiers.
- Includes offline tests using Node's built-in test runner.

## Requirements

- Node.js 18 or newer.
- A Pixabay API key supplied through the `PIXABAY_API_KEY` environment variable.

## Install as a Codex skill

Clone or copy this directory into your Codex skills directory:

```powershell
Copy-Item -Recurse .\pixabay-api "$HOME\.codex\skills\pixabay-api"
```

Restart Codex after installation. Codex can then invoke `$pixabay-api` for Pixabay searches and integrations.

## Use the CLI

Set the key for the current PowerShell session:

```powershell
$env:PIXABAY_API_KEY = 'YOUR_API_KEY'
```

Search horizontal photos:

```powershell
node scripts/search-pixabay.mjs --query 'blue mountains' --type image --image-type photo --orientation horizontal --per-page 5
```

Search videos:

```powershell
node scripts/search-pixabay.mjs --query 'ocean waves' --type video --lang en --per-page 6
```

Display the full option list:

```powershell
node scripts/search-pixabay.mjs --help
```

## Output

The CLI writes JSON to standard output. Each result includes Pixabay's source page and an attribution field. Keep the source information when presenting or storing selected assets.

The image `previewUrl` is intended for temporary previews. Do not permanently hotlink Pixabay image CDN URLs in an application; download approved assets to your own storage instead.

## Security

- Never commit a real API key. `.env` files are ignored by default.
- Keep API calls on the server when building a web application.
- Rotate a key that has appeared in a screenshot, commit, ticket, chat, or public document.
- See [SECURITY.md](SECURITY.md) for reporting guidance.

## License and content rights

This repository does not include a license yet. Choose and add an open-source license before publishing it publicly.

Pixabay assets are governed by Pixabay's applicable content license and may also involve rights relating to people, logos, trademarks, or private property. Verify that a specific asset is appropriate for your intended use.

## Development

```powershell
npm test
node --check scripts/search-pixabay.mjs
```

## Publishing checklist

- [ ] Confirm `PIXABAY_API_KEY` and downloaded assets are not tracked.
- [ ] Add a repository license appropriate for your intended reuse terms.
- [ ] Replace this README's example paths if your repository layout differs.
- [ ] Run `npm test` and `node --check scripts/search-pixabay.mjs`.
- [ ] Review Pixabay's current API terms and content license before release.
