const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const postCssPresetEnv = require('postcss-preset-env');

module.exports = {
  entry: {
    main: "./src/lib/index.ts"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "index.js",
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  externals: [nodeExternals({
    whitelist: [
      /^\@fortawesome/,
      /^lodash/,
      'clean-deep',
      'dialog-polyfill',
      'react-sortable-hoc',
      'immutability-helper',
      'qs',
    ]
  })],
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['@svgr/webpack']
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                noEmit: false,
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(sass|scss|css)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            }
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              syntax: 'postcss-scss',
              plugins: [
                require('autoprefixer'),
                postCssPresetEnv({
                  stage: 0,
                  features: {
                    'color-mod-function': true,
                    'alpha-hex-colors': true
                  }
                }),
              ],
              browsers: ['> 0.25%', 'ie >= 11']
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g)$/,
        loader: 'file-loader?name=images/[name].[ext]'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "style.css"
    }),
  ],
  optimization: {
    usedExports: true,
  }
};