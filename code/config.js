const dotenv = require('dotenv');
const path = require('path');

if (dotenv.error) {
	throw dotenv.error
}

dotenv.config({
    path: path.resolve(__dirname, '.env.' + process.env.NODE_ENV)
  });

  module.exports = {
      USERNAME: process.env.USERNAME || 'apiuser',
      KEY:process.env.KEY || ''
  }
