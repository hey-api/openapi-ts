'use strict';

const fs = require('fs');

function copy(dir) {
    fs.copyFileSync('./test/e2e/assets/script.js', `./test/e2e/generated/${dir}/script.js`);
}

module.exports = copy;
