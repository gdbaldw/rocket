import path from 'path';
import { rollupPluginHTML } from '@web/rollup-plugin-html';
import { generateSW } from 'rollup-plugin-workbox';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { polyfillsLoader } from '@web/rollup-plugin-polyfills-loader';
import { metaConfigToRollupConfig } from 'plugins-manager';

import { injectServiceWorker } from './utils.js';
import { createBasicMetaConfig } from './createBasicConfig.js';

export function createSpaConfig(userConfig) {
  const { config, pluginsArray } = createSpaMetaConfig(userConfig);
  return metaConfigToRollupConfig(config, pluginsArray);
}

export function createSpaMetaConfig(userConfig = { output: {} }) {
  const { config, pluginsArray, developmentMode } = createBasicMetaConfig(userConfig);

  // service worker
  let serviceWorkerFileName = 'service-worker.js';
  if (config.serviceWorkerFileName) {
    serviceWorkerFileName = config.serviceWorkerFileName;
    delete config.serviceWorkerFileName;
  }
  const swDest = path.join(config.output.dir, serviceWorkerFileName);

  // root dir
  let rootDir = process.cwd();
  if (config.rootDir) {
    rootDir = config.rootDir;
    delete config.rootDir;
  }

  const spaPluginsArray = [
    ...pluginsArray,
    {
      name: 'rollup-plugin-html',
      plugin: rollupPluginHTML,
      options: {
        rootDir,
        transformHtml: [injectServiceWorker(swDest, config.output.dir)],
      },
    },
    {
      name: 'generate-sw',
      plugin: generateSW,
      options: {
        // Keep 'legacy-*.js' just for retro compatibility
        globIgnores: ['polyfills/*.js', 'legacy-*.js', 'nomodule-*.js'],
        navigateFallback: '/index.html',
        // where to output the generated sw
        swDest: path.join(config.output.dir, 'service-worker.js'),
        // directory to match patterns against to be precached
        globDirectory: path.join(config.output.dir),
        // cache any html js and css by default
        globPatterns: ['**/*.{html,js,css,webmanifest}'],
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: 'polyfills/*.js',
            handler: 'CacheFirst',
          },
        ],
      },
    },
    {
      name: 'import-meta-assets',
      plugin: importMetaAssets,
    },
    {
      name: 'polyfills-loader',
      plugin: polyfillsLoader,
      options: {
        polyfills: {},
        minify: !developmentMode,
      },
    },
  ];

  return { config, pluginsArray: spaPluginsArray };
}
