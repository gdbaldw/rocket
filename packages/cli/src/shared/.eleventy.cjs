const eleventyPluginMdjsUnified = require('@d4kmor/eleventy-plugin-mdjs-unified');
const eleventyRocketNav = require('@d4kmor/eleventy-rocket-nav');

const { getComputedConfig } = require('../public/computedConfig.cjs');
const rocketFilters = require('../eleventy-plugins/rocketFilters.cjs');
const rocketCopy = require('../eleventy-plugins/rocketCopy.cjs');
const rocketCollections = require('../eleventy-plugins/rocketCollections.cjs');

module.exports = function (eleventyConfig) {
  const config = getComputedConfig();
  const { pathPrefix, inputDir, outputDir } = config;

  let metaPlugins = [
    {
      name: 'rocket-filters',
      plugin: rocketFilters,
      options: { inputDir },
    },
    {
      name: 'rocket-copy',
      plugin: rocketCopy,
      options: {
        inputDir,
        filesExtensionsToCopy: 'png,gif,jpg,jpeg,svg,css,xml,json,js',
      },
    },
    {
      name: 'eleventy-plugin-mdjs-unified',
      plugin: eleventyPluginMdjsUnified,
      options: { setupUnifiedPlugins: config.setupUnifiedPlugins },
    },
    {
      name: 'eleventy-rocket-nav',
      plugin: eleventyRocketNav,
    },
    {
      name: 'rocket-collections',
      plugin: rocketCollections,
      options: { inputDir },
    },
  ];

  if (Array.isArray(config.setupEleventyPlugins)) {
    for (const setupFn of config.setupEleventyPlugins) {
      metaPlugins = setupFn(metaPlugins);
    }
  }

  for (const pluginObj of metaPlugins) {
    if (pluginObj.options) {
      eleventyConfig.addPlugin(pluginObj.plugin, pluginObj.options);
    } else {
      eleventyConfig.addPlugin(pluginObj.plugin);
    }
  }

  if (config.eleventy) {
    const returnValue = config.eleventy(eleventyConfig);
    if (returnValue) {
      const returnString = JSON.stringify(returnValue, null, 2);
      const msg = [
        'Error: Setting eleventy values from within a rocket.config.mjs file is not allowed.',
        'All settings should be available at the root of the config.',
        'If something is missing then please open an issue. You are trying to set:',
        returnString,
      ].join('\n');
      console.error(msg);
      throw new Error(msg);
    }
  }

  return {
    dir: {
      // no input: inputDir as we set this when we create the eleventy instance
      data: '_merged_data',
      includes: '_merged_includes',
      output: outputDir,
    },
    pathPrefix,
    passthroughFileCopy: true,
  };
};
