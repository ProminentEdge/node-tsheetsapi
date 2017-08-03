class TSheetsApiError extends Error{
  constructor(...args){
    super(...args)
    Error.captureStackTrace(this, TSheetsApiError);
  }

}

module.exports = TSheetsApiError;
