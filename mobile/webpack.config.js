const fs = require("fs");
const webpack = require("webpack");
const { sources } = webpack;
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

class CopySkiaPlugin {
  apply(compiler) {
    console.log("CopySkiaPlugin applied");
    compiler.hooks.thisCompilation.tap("AddSkiaPlugin", (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: "copy-skia",
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        async () => {
          const src = require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");
          const content = await fs.promises.readFile(src);
          compilation.emitAsset("/canvaskit.wasm", new sources.RawSource(content));
          console.log("canvaskit.wasm emitted");
        }
      );
    });
  }
}

module.exports = (env, argv) => {
  env.mode = env.mode || (argv.mode || 'development');
  const isWeb = true;
  
  let config;
  try {
    config = require("@expo/webpack-config")(env) || {};
  } catch (e) {
    console.warn("@expo/webpack-config not found, using defaults.");
    config = {};
  }

  return {
    ...config,
    entry: './app/index.tsx',
    resolve: {
      ...(config.resolve || {}),
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        ...((config.resolve && config.resolve.alias) || {}),
        "@": path.resolve(__dirname, "app"),
        "react-native-reanimated/package.json": require.resolve(
          "react-native-reanimated/package.json"
        ),
        "react-native-reanimated": require.resolve("react-native-reanimated"),
        "react-native/Libraries/Image/AssetRegistry": false,
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,      // matches .js, .jsx, .ts, .tsx
          exclude: /node_modules/, // don’t transpile node_modules
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',        // transpile modern JS
                '@babel/preset-react',      // transpile JSX
                '@babel/preset-typescript', // transpile TypeScript
              ],
              plugins: [
                !isWeb && 'react-native-reanimated/plugin', // needed if using Reanimated
              ].filter(Boolean),
            },
          },
        },
      ],
    },
    plugins: [
      ...(config.plugins || []),
      new CopySkiaPlugin(),
      new NodePolyfillPlugin(),
    ],
    mode: argv.mode || 'development', // set a default mode
  };
};
