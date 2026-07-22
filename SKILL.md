---
name: pixabay-api
description: Search Pixabay's licensed image and video catalog through its REST API, returning curated attribution-ready results with safe filtering and 24-hour caching. Use when Codex needs Pixabay photos, illustrations, vectors, or video footage; needs to download selected Pixabay assets; or needs to integrate Pixabay search into a website, document, presentation, or creative workflow.
---

# Pixabay API

Search Pixabay responsibly and return only the asset metadata needed for the task.

## Guardrails

- Read credentials only from `PIXABAY_API_KEY`; never hard-code, echo, commit, or expose it in browser code.
- Keep `safesearch=true` enabled unless the user explicitly requests otherwise and the request is appropriate.
- Make focused searches, cache successful API responses for 24 hours, and do not bulk crawl or systematically download assets.
- Include each result's `pageURL` and Pixabay attribution. Check Pixabay's current license and third-party rights before publishing or commercial use.
- Do not permanently hotlink image CDN URLs. Download selected images into approved storage for app use.

## Workflow

1. Infer or ask for the asset type, subject, orientation, quantity, and intended use.
2. Search with the bundled script using a focused query and the fewest results needed.
3. Curate the results by relevance and include creator, dimensions, source page, and attribution.
4. When downloading selected images, create a local attribution manifest alongside the files.
5. For application integrations, keep the API call server-side and cache normalized results for at least 24 hours.

## Command

```powershell
$env:PIXABAY_API_KEY = 'your-key'
node scripts/search-pixabay.mjs --query 'blue mountains' --type image --image-type photo --orientation horizontal --per-page 8
```

Run `node scripts/search-pixabay.mjs --help` for the complete option list. The script outputs reduced JSON, stores successful responses in the system temporary directory for 24 hours, and never downloads media itself.

## Integration requirements

- Use `https://pixabay.com/api/` for images and `https://pixabay.com/api/videos/` for video.
- Build requests with `URLSearchParams`; do not concatenate raw user input into URLs.
- Handle HTTP `429` with backoff instead of aggressive retries.
- Treat the upstream response as extensible and select only the fields your application needs.
