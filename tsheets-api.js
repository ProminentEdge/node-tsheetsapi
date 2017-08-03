const request = require('request');
const url = require('url');
const TSheetsApiResponseError = require('./errors/response-error');
const TSheetsApiError = require('./errors/tsheetsapi-error');
const RequestError = require('./errors/request-error');

/**
 * A simple TSheetsApi handler that makes use of the Async/Await featues.. 
 * Supports almost any endpoint and follows the TSheets method nomenclature.
 * @param {object} params A init object that contains your bearerToken and optionally allows to set the API version & url used. 
 */

class TSheetsApi{

  constructor(params){

    const defaults = {
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

    this.baseUrl = `${params.baseUrl}/${params.version}`;
    this.bearerToken = params.bearerToken;

    const endpoints = ['users',
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

      endpoints.forEach( el => {

        TSheetsApi.prototype[el] = () => {

          return {
            list : async (params) => {
              return await this.build(el, 'GET', params);
            },
            add  : async (params) => {
              return await this.build(el, 'POST', params);
            },
            update : async (params) => {
              return await this.build(el, 'PUT', params);
            },
            delete : async (params) => {
              return await this.build(el, 'DELETE', params);
            }
          }

        };

      });

  }


  /**
   * Build request to API and execute it. 
   * @param {string} endpoint Can be one of the support TSheets endpoint such as 'users', 'jobcodes' or 'timesheets'
   * @param {string} method HTTP request method
   * @param {object} params Object that contains either the query string parameters or request body
   * @returns {Promise} 
   */
  async build(endpoint, method, params) {

    let queryObject = {

      method : method,
      url: `${this.baseUrl}/${endpoint}`,
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

    return await this.doRequest(queryObject, endpoint);

  }

  /**
   * Perform a request. Pagination is enabled by 
   * @param {object} queryObject The query parameters.
   * @param {string} endpoint The relevant endpoint.
   * @returns {object} res 
   * {
   *    data : [The response data gathered from TSheets],
   *    next : [null or a Promise to get the next batch]
   * }
   */ 
  async doRequest(queryObject, endpoint){

    return new Promise((resolve, reject) => {

      request(queryObject, (err, res, body) => {

        if(err){
          throw new RequestError(err);
        } 

        if (body.hasOwnProperty('error')){
          throw new TSheetsApiResponseError(body.error.message, body.error.code);
        } 

        const entries = body['results'][endpoint];
        let result = [];

        for(let key in entries){

          if(!entries.hasOwnProperty(key)) continue;

          result.push(entries[key]);

        }

        if(body['more'] && queryObject.method === 'GET'){

          queryObject['qs']['page'] = queryObject['qs']['page'] + 1;
          resolve({data: result, next: this.doRequest(queryObject, endpoint)});
        }

        return resolve({data:result, next: null});

      });

    });

  }

}


module.exports = TSheetsApi;
