import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSearchRequest, parseArgs, selectHit } from '../scripts/search-pixabay.mjs';

test('parses a focused image search', () => {
  const options = parseArgs([
    '--query', 'blue mountains',
    '--type', 'image',
    '--image-type', 'photo',
    '--orientation', 'horizontal',
    '--per-page', '5',
  ]);

  assert.deepEqual(options, {
    query: 'blue mountains',
    type: 'image',
    imageType: 'photo',
    orientation: 'horizontal',
    perPage: 5,
    lang: 'zh',
    order: 'popular',
    page: 1,
  });
});

test('rejects unsupported options and invalid page sizes', () => {
  assert.throws(() => parseArgs(['--query', 'mountains', '--unknown', 'value']), /Unknown option/);
  assert.throws(() => parseArgs(['--query', 'mountains', '--per-page', '2']), /3 to 200/);
  assert.throws(() => parseArgs(['--query', 'mountains', '--orientation', 'square']), /orientation/);
});

test('builds an encoded request without putting the API key in cache identity', () => {
  const options = parseArgs(['--query', 'blue & green mountains', '--type', 'image']);
  const request = buildSearchRequest('secret-api-key', options);

  assert.match(request.url, /key=secret-api-key/);
  assert.match(request.url, /q=blue\+%26\+green\+mountains/);
  assert.doesNotMatch(request.cacheKey, /secret-api-key/);
  assert.match(request.cacheKey, /safesearch=true/);
});

test('normalizes image and video result fields', () => {
  const image = selectHit({
    id: 7,
    type: 'photo',
    tags: 'mountain, blue',
    imageWidth: 1920,
    imageHeight: 1080,
    webformatURL: 'https://example.test/image.jpg',
    pageURL: 'https://pixabay.com/example',
    user: 'creator',
  }, 'image');
  const video = selectHit({
    id: 8,
    tags: 'wave',
    duration: 12,
    pageURL: 'https://pixabay.com/video',
    user: 'creator',
    videos: { medium: { width: 1280, height: 720, thumbnail: 'https://example.test/poster.jpg', url: 'https://example.test/video.mp4' } },
  }, 'video');

  assert.equal(image.previewUrl, 'https://example.test/image.jpg');
  assert.equal(image.attribution, 'Source: Pixabay');
  assert.equal(video.width, 1280);
  assert.equal(video.videoUrl, 'https://example.test/video.mp4');
});
