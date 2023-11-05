const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  mode: "development",
  entry: "./src/index.ts",
  output: {
    filename: "index.js",
    path: __dirname + "/public/scripts",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [{ test: /\.ts$/, loader: "ts-loader" },
    {
      test: /\.s[ac]ss$/i,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader',
      ],
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
      ],
    }],
  },
  plugins: [new CopyWebpackPlugin({
    patterns: [
      {
        from: 'node_modules/7.css/dist/7.css',
        to: 'styles',
      },
      {
        from: 'node_modules/xp.css/dist/XP.css',
        to: 'styles',
      },
      {
        from: 'src/styles/xpProgressBar.css',
        to: 'styles',
      }
    ],
  }),]
};
