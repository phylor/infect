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
            { test: /phaser/, loader: 'script-loader' },
            { test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/, loader: 'file-loader' }
        ]
    },
    resolve: {
        alias: {
            'phaser': phaser,
        }
    }
}
