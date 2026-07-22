import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULTS = { lang: 'zh', order: 'popular', page: 1, perPage: 12, type: 'image' };
const IMAGE_TYPES = new Set(['all', 'photo', 'illustration', 'vector']);
const ORIENTATIONS = new Set(['all', 'horizontal', 'vertical']);
const ORDERS = new Set(['popular', 'latest']);

export function usage() {
  return [
    'Usage: node search-pixabay.mjs --query <text> [options]',
    '',
    'Options:',
    '  --type image|video                  Default: image',
    '  --image-type all|photo|illustration|vector',
    '  --orientation all|horizontal|vertical',
    '  --lang <code>                       Default: zh',
    '  --per-page <3-200>                  Default: 12',
    '  --page <number>                     Default: 1',
    '  --order popular|latest              Default: popular',
    '  --category <name>                   Images only',
    '  --colors <comma-separated-values>   Images only',
  ].join('\n');
}

export function parseArgs(argv) {
  const options = { ...DEFAULTS };
  const aliases = {
    q: 'query',
    query: 'query',
    type: 'type',
    lang: 'lang',
    page: 'page',
    'per-page': 'perPage',
    order: 'order',
    orientation: 'orientation',
    'image-type': 'imageType',
    category: 'category',
    colors: 'colors',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') return { help: true };
    if (!token.startsWith('--')) throw new Error(`Unknown argument: ${token}`);
    const name = aliases[token.slice(2)];
    if (!name) throw new Error(`Unknown option: ${token}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}`);
    options[name] = value;
    index += 1;
  }

  if (!options.query?.trim()) throw new Error('A --query value is required.');
  if (!['image', 'video'].includes(options.type)) throw new Error('--type must be image or video.');
  options.page = Number(options.page);
  options.perPage = Number(options.perPage);
  if (!Number.isInteger(options.page) || options.page < 1) throw new Error('--page must be a positive integer.');
  if (!Number.isInteger(options.perPage) || options.perPage < 3 || options.perPage > 200) throw new Error('--per-page must be an integer from 3 to 200.');
  if (!ORDERS.has(options.order)) throw new Error('--order must be popular or latest.');
  if (!/^[a-z]{2,5}$/i.test(options.lang)) throw new Error('--lang must be a language code.');
  if (options.type === 'image') {
    if (options.imageType && !IMAGE_TYPES.has(options.imageType)) throw new Error('--image-type must be all, photo, illustration, or vector.');
    if (options.orientation && !ORIENTATIONS.has(options.orientation)) throw new Error('--orientation must be all, horizontal, or vertical.');
  }
  return options;
}

export function buildSearchRequest(apiKey, options) {
  const endpoint = options.type === 'video' ? 'https://pixabay.com/api/videos/' : 'https://pixabay.com/api/';
  const publicParameters = new URLSearchParams({
    q: options.query,
    lang: options.lang,
    page: String(options.page),
    per_page: String(options.perPage),
    order: options.order,
    safesearch: 'true',
  });
  if (options.type === 'image') {
    for (const [option, parameter] of [['imageType', 'image_type'], ['orientation', 'orientation'], ['category', 'category'], ['colors', 'colors']]) {
      if (options[option]) publicParameters.set(parameter, options[option]);
    }
  }
  const requestParameters = new URLSearchParams(publicParameters);
  requestParameters.set('key', apiKey);
  return {
    endpoint,
    url: `${endpoint}?${requestParameters.toString()}`,
    cacheKey: `${endpoint}?${publicParameters.toString()}`,
  };
}

export function selectHit(hit, type) {
  if (type === 'video') {
    const video = hit.videos?.medium ?? hit.videos?.small ?? hit.videos?.tiny;
    return {
      id: hit.id,
      tags: hit.tags,
      durationSeconds: hit.duration,
      width: video?.width,
      height: video?.height,
      previewUrl: video?.thumbnail,
      videoUrl: video?.url,
      pageUrl: hit.pageURL,
      creator: hit.user,
      attribution: 'Source: Pixabay',
    };
  }
  return {
    id: hit.id,
    type: hit.type,
    tags: hit.tags,
    width: hit.imageWidth,
    height: hit.imageHeight,
    previewUrl: hit.webformatURL ?? hit.previewURL,
    pageUrl: hit.pageURL,
    creator: hit.user,
    attribution: 'Source: Pixabay',
  };
}

async function readCached(cacheFile) {
  try {
    const cache = JSON.parse(await readFile(cacheFile, 'utf8'));
    return Date.now() - cache.createdAt < CACHE_TTL_MS ? cache.payload : null;
  } catch {
    return null;
  }
}

export async function main(argv = process.argv.slice(2), environment = process.env) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(usage());
    return;
  }
  const apiKey = environment.PIXABAY_API_KEY;
  if (!apiKey) throw new Error('PIXABAY_API_KEY is not set. Store your key in an environment variable, not source code.');

  const request = buildSearchRequest(apiKey, options);
  const cacheDirectory = join(tmpdir(), 'pixabay-api-skill-cache');
  const cacheFile = join(cacheDirectory, `${createHash('sha256').update(request.cacheKey).digest('hex')}.json`);
  const cached = await readCached(cacheFile);
  if (cached) {
    console.log(JSON.stringify({ ...cached, cached: true }, null, 2));
    return;
  }

  const response = await fetch(request.url);
  if (!response.ok) {
    const message = (await response.text()).trim();
    const hint = response.status === 429 ? ' Wait for the rate-limit reset before retrying.' : '';
    throw new Error(`Pixabay API request failed (${response.status}): ${message || response.statusText}.${hint}`);
  }

  const data = await response.json();
  const payload = {
    query: options.query,
    type: options.type,
    totalHits: data.totalHits,
    results: (data.hits ?? []).map((hit) => selectHit(hit, options.type)),
    cached: false,
  };
  await mkdir(cacheDirectory, { recursive: true });
  await writeFile(cacheFile, JSON.stringify({ createdAt: Date.now(), payload }), 'utf8');
  console.log(JSON.stringify(payload, null, 2));
}

const invokedDirectly = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    console.error(usage());
    process.exitCode = 1;
  });
}
