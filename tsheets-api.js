var request = require('request');
var Q = require('q');
var url = require('url');
var TSheetsApiResponseError = require('./errors/response-error');
var TSheetsApiError = require('./errors/tsheetsapi-error');

/**
 * A simple TSheetsApi handler that supports promises. 
 * Supports almost any endpoint and follows the TSheets method nomenclature.
 * @param {object} params A init object that contains your bearerToken and optionally allows to set the API version & url used. 
 */
function TSheetsApi(params){
  
  var defaults = {
    baseUrl : 'https://rest.tsheets.com/api',
    version : 'v1',
    bearerToken : ''
  };

  if(typeof params === "undefined"){
    throw new TSheetsApiError('Please provide at least a Bearer Token.');
  }else{
    
    if(!params.hasOwnProperty('baseUrl')){
      params['baseUrl'] = defaults.baseUrl;
    }
    
    if(!params.hasOwnProperty('version')){
      params['version'] = defaults.version;
    }

    if(!params.hasOwnProperty('bearerToken') || typeof params['bearerToken'] === "undefined"){
      throw new TSheetsApiError('Please provide an API key.'); 
    }
  
  }

  this.baseUrl = params.baseUrl + '/' + params.version;
  this.bearerToken = params.bearerToken;
  
  var endpoints = ['users',
                   'groups',
                   'jobcodes',
                   'jobcode_assignments',
                   'timesheets',
                   'timesheets_deleted',
                   'geolocations',
                   'reports',
                   'last_modfied',
                   'notifications',
                   'reminders',
                   'schedule_calendars', 
                   'schedule_events',
                   'managed_clients'];

  endpoints.forEach(function(el){
    
    TSheetsApi.prototype[el] = function(){
      
      var self = this;
      
      return {
        list : function(params){
          return self.build(el, 'GET', params);
        },
        add : function(params){
          return self.build(el, 'POST', params);
        },
        update : function(params){
          return self.build(el, 'PUT', params);
        },
        delete : function(params){
          return self.build(el, 'DELETE', params);
        }
      }

    };

  }.bind(this));

}

/**
 * Build request to API and execute it. 
 * @param {string} endpoint Can be one of the support TSheets endpoint such as 'users', 'jobcodes' or 'timesheets'
 * @param {string} method HTTP request method
 * @param {object} params Object that contains either the query string parameters or request body
 * @returns {Promise} 
 */
TSheetsApi.prototype.build = function(endpoint, method, params){
  
  var deferred = Q.defer();

  var queryObject = {
  
    method : method,
    url: this.baseUrl + '/' + endpoint,
    auth : {
      bearer : this.bearerToken
    },
    json : true
  }
  
  if(method === 'GET' && (typeof params === "undefined" || !params.hasOwnProperty('page'))){
    params = typeof params === "undefined" ? {} : params;
    params['page'] = 1;
  }

  if(method === 'GET' || method === 'DELETE') queryObject['qs'] = params;

  if(method === 'POST' || method === 'PUT') queryObject['body'] = params;
  
  var result = [];

  function doRequest(queryObject){
    
    request(queryObject, function(err, res, body){
      if(err){
        console.log(err);
      } 

      if (body.hasOwnProperty('error')){
        throw new TSheetsApiResponseError(body.error.message, body.error.code);
      } 

      var entries = body['results'][endpoint];

      for(var key in entries){

        if(!entries.hasOwnProperty(key)) continue;

        result.push(entries[key]);

      }

      if(body['more'] && method === 'GET'){

        params['page'] = params['page'] + 1;
        queryObject['qs'] = params;
        return doRequest(queryObject);
      }

      return deferred.resolve(result);

    });

  }

  doRequest(queryObject);

  return deferred.promise;

};


module.exports = TSheetsApi;
