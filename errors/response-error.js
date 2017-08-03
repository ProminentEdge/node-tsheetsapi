
class TSheetsApiResponseError extends Error{
  constructor(...args){
    
    super(...args)
    Error.captureStackTrace(this, TSheetsApiResponseError);
  
  }
  
}

module.exports=TSheetsApiResponseError;
