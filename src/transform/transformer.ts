import { TransformContext } from './context';
import { RawValue, ViteConfig } from '../config/vite';
import { VueCliTransformer } from './transformVuecli';
import { WebpackTransformer } from './transformWebpack';

/**
 * general implementation for vue.config.js and webpack.config.js
 *
 */
export interface Transformer{
    context: TransformContext;

    transform(rootDir: string): Promise<ViteConfig>;

}

export function initViteConfig () : ViteConfig {
  const config : ViteConfig = {}

  const defaultAlias = []
  defaultAlias.push({ find: new RawValue('/^~/'), replacement: '' });
  defaultAlias.push({ find: '', replacement: new RawValue('path.resolve(__dirname,\'src\')') });

  config.resolve = {};
  config.resolve.alias = defaultAlias;
  config.resolve.extensions = [
    '.mjs',
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.json',
    '.vue'
  ];

  return config;
}

export function getTransformer (projectType: string) : Transformer {
  if (projectType === 'vue-cli') {
    return new VueCliTransformer()
  }
  if (projectType === 'webpack') {
    return new WebpackTransformer()
  }

  return new VueCliTransformer()
}

export function transformImporters (context: TransformContext) : void {
  const plugins: RawValue[] = []
  if (context.vueVersion === 3) {
    context.importers.push('import vue from \'@vitejs/plugin-vue\';')
    plugins.push(new RawValue('vue()'))
    context.importers.push('import vueJsx from \'@vitejs/plugin-vue-jsx\';')
    plugins.push(new RawValue('vueJsx()'))
  } else {
    context.importers.push(
      'import { createVuePlugin } from \'vite-plugin-vue2\';'
    )
    plugins.push(new RawValue('createVuePlugin({jsx:true})'))
  }

  context.importers.push('import envCompatible from \'vite-plugin-env-compatible\';')
  context.importers.push('import { viteCommonjs } from \'@originjs/vite-plugin-commonjs\';')
  // TODO scan files to determine whether you need to add the plugin
  plugins.push(new RawValue('viteCommonjs()'))
  plugins.push(new RawValue('envCompatible()'))

  context.config.plugins = plugins
}
