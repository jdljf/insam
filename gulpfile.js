const prod = require('./gulpfile.prod.js');
const dev = require('./gulpfile.dev.js');

const knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'dev' }
};

dev()