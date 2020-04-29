const postCssPresetEnv = require('postcss-preset-env');

module.exports = {
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
};