import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the app shell points to the Vite entry point', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /src="\/src\/main\.js"/);
  assert.match(html, /lang="es"/);
});

test('chat UI includes channels and message composer', async () => {
  const source = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.match(source, /presentaciones/);
  assert.match(source, /message-form/);
  assert.match(source, /createAuth0Client/);
  assert.match(source, /createClient/);
});

test('Supabase SQL enables RLS without open policies', async () => {
  const sql = await readFile(new URL('../supabase/migrations/001_orbit_chat.sql', import.meta.url), 'utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /No RLS policies are granted/i);
  assert.doesNotMatch(sql, /create policy[\s\S]{0,200}using\s*\(\s*true\s*\)/i);
});

test('GitHub Actions builds the app and uploads dist', async () => {
  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
});

test('IWA manifest is present with a valid numeric version and icon', async () => {
  const manifest = JSON.parse(await readFile(new URL('../public/.well-known/manifest.webmanifest', import.meta.url), 'utf8'));
  assert.equal(manifest.name, 'Orbit Chat');
  assert.match(manifest.version, /^\d+(\.\d+)*$/);
  assert.ok(manifest.icons.length > 0);
});

test('signed IWA build is configured to use a stable private signing key', async () => {
  const config = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8');
  const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(config, /WebBundleId/);
  assert.match(config, /NodeCryptoSigningStrategy/);
  assert.match(workflow, /IWA_SIGNING_KEY_PEM/);
  assert.match(workflow, /orbit-chat-iwa-swbn/);
});
