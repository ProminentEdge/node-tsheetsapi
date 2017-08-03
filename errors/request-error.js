
class RequestError extends Error{
  constructor(...args){
    
    super(...args)
    Error.captureStackTrace(this, RequestError);
  
  }
  
}

module.exports=RequestError;
