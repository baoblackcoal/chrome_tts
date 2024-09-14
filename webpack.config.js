const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];
const moduleRules = [
    {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
        exclude: /node_modules/
    },
    {
        test: new RegExp('.(' + fileExtensions.join('|') + ')$'),
        use: "file-loader?name=[name].[ext]",
        exclude: /node_modules/
    },
    {
        test: /\.html$/,
        use: {
            loader: "html-loader",
            options: {
                sources: false
            }
        },
        exclude: /node_modules/
    }
];

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: 'inline-source-map', 
    entry: {
      popup: './src/popup.js',
      background: './src/background.js',
      tts: './src/tts.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js'
    },
    module: {
      rules: moduleRules
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })]
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/popup.html', to: 'popup.html' },
          { from: 'src/popup.css', to: 'popup.css' },
          { from: 'src/languageStrings.json', to: 'languageStrings.json' },
          { from: 'src/48.png', to: '48.png' }
        ]
      })
    ],
    resolve: {
      extensions: ['.js']
    }
  };
};