import { DevServerConfig } from '@web/dev-server';

export interface RocketPreset {
  path: string;

  // TODO: improve all setup functions
  setupUnifiedPlugins?: function[];
  setupDevAndBuildPlugins: function[];
  setupBuildPlugins: function[];
  setupDevPlugins: function[];
  setupCliPlugins: function[];
  setupEleventyPlugins: function[];
}

export interface RocketCliOptions {
  command: string;
  pathPrefix: string;
  configFile?: string;
  configDir: string;
  _configDirCwdRelative: string;
  inputDir: string;
  _inputDirConfigDirRelative: string;
  outputDir: string;
  watch: boolean;
  presets: Array<RocketPreset>;
  devServer: DevServerConfig;
  eleventy: function; // TODO: improve
  build: {
    outputDir: string;
    pathPrefix: string;
    absoluteBaseUrl?: function;
    emptyOutputDir?: boolen;
    serviceWorkerFileName?: string;
  };
  _presetPathes?: Array<string>;
  plugins: RocketPlugin[];

  // TODO: improve all setup functions
  setupUnifiedPlugins?: function[];
  setupDevAndBuildPlugins: function[];
  setupBuildPlugins: function[];
  setupDevPlugins: function[];
  setupCliPlugins: function[];
  setupEleventyPlugins: function[];
}

export interface RocketPlugin {
  commands: Array<string>;
}
