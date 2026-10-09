import { defineConfig } from 'vite';
import fs from 'node:fs';
import wbn from 'rollup-plugin-webbundle';
import * as wbnSign from 'wbn-sign';

const plugins = [];

if (process.env.BUILD_IWA === '1') {
  const keyPath = process.env.IWA_SIGNING_KEY_PATH;
  const passphrase = process.env.IWA_SIGNING_PASSPHRASE;
  if (!keyPath || !passphrase) {
    throw new Error('BUILD_IWA=1 requires IWA_SIGNING_KEY_PATH and IWA_SIGNING_PASSPHRASE.');
  }

  // The signing key defines the identity/origin of the IWA. Keep it private,
  // encrypted, stable between releases, and outside the Git repository.
  const key = wbnSign.parsePemKey(fs.readFileSync(keyPath), passphrase);
  plugins.push({
    ...wbn({
      baseURL: new wbnSign.WebBundleId(key).serializeWithIsolatedWebAppOrigin(),
      static: { dir: 'public' },
      output: 'orbit-chat.swbn',
      integrityBlockSign: {
        strategy: new wbnSign.NodeCryptoSigningStrategy(key),
      },
    }),
    enforce: 'post',
  });
}

export default defineConfig({ plugins });
