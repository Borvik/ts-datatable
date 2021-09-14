const path = require('path');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'web',
  externals: {
    'sql.js': 'initSqlJs',
  },
  entry: {
    main: './src/demo/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader']
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { plugins: ['react-refresh/babel'] },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            }
          }
        ],
      },
      {
        test: /\.s?css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: false,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              implementation: require('sass'),
              sassOptions: (loaderContext) => {
                const { rootContext } = loaderContext;
                const modulesPath = path.join(rootContext, 'node_modules');
                return {
                  includePaths: [ modulesPath ]
                };
              }
            }
          }
        ]
      }
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    fallback: {
      path: require.resolve('path-browserify'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      fs: false,
    }
  },

  output: {
    filename: 'bundle.js',
  },

  plugins: [
    new ReactRefreshPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebPackPlugin({
      filename: './index.html',
      template: './public/index.html',
    }),
  ],

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
      staticOptions: {},
      publicPath: '/',
    },
    hot: true,
    liveReload: true,
    port: parseInt(process.env.PORT, 10) || 3000,
  },
};