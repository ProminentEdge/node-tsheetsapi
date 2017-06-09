'use strict';

module.exports = function TSheetsApiResponseError(message, code) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = '[Code ' + code + '] ' + message;
};

require('util').inherits(module.exports, Error);
