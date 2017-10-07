const path = require('path');
const phaser = path.join(__dirname, 'assets/js/phaser.min.js');

module.exports = {
    entry: './src/app.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist')
    },

    module: {
        loaders: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              include: [path.resolve(__dirname, 'src')],
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [require.resolve('babel-preset-env')]
                }
              }
            },
            { test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: 'file-loader' },
            { test: /phaser/, loader: 'script-loader' },
        ]
    },
    resolve: {
      extensions: ['.js'],
      modules: ['src', 'node_modules'],
      alias: {
          'phaser': phaser,
      }
    }
}
