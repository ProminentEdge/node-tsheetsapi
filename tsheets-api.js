const request = require('request');
const url = require('url');
const TSheetsApiError = require('./errors/tsheetsapi-error');

function sleep(s = 0) {
  return new Promise(r => setTimeout(r, s * 1000));
}


/**
 * A simple TSheetsApi handler that makes use of the Async/Await featues.. 
 * Supports almost any endpoint and follows the TSheets method nomenclature.
 * @param {object} params A init object that contains your bearerToken and optionally allows to set the API version & url used. 
 */

class TSheetsApi{
  
  createEndpoint(el, return_object_name) {
    // Specialty named routes are assumed to only support HTTP POST via 'get' method
    if (return_object_name) {
      TSheetsApi.prototype[el.replace(/\//g, '_')] = () => {
        return {
          get : async (params) => {
            return await this.build(el, 'POST', params, return_object_name);
          }
        }
      }
    }
    else {
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
    }
  }

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
      'last_modfied',
      'notifications',
      'reminders',
      'schedule_calendars', 
      'schedule_events',
      'managed_clients',
      {
        'reports': [
          {
            name: 'current_totals',
            return_object_name: 'current_totals_report'
          },
          {
            name: 'payroll',
            return_object_name: 'payroll_report'
          },
          {
            name: 'payroll_by_jobcode',
            return_object_name: 'payroll_by_jobcode_report'
          },
          {
            name: 'project',
            return_object_name: 'project_report'
          }
        ]
      }];

      endpoints.forEach( el => {
        if (typeof el === 'object') {
          Object.keys(el).forEach( i => {
            el[i].forEach( j => {
              this.createEndpoint(`${i}/${j.name}`, j.return_object_name);
            });
          });
        }
        else {
          this.createEndpoint(el);
        }
      });

  }


  /**
   * Build request to API and execute it. 
   * @param {string} endpoint Can be one of the support TSheets endpoint such as 'users', 'jobcodes' or 'timesheets'
   * @param {string} method HTTP request method
   * @param {object} params Object that contains either the query string parameters or request body
   * @returns {Promise} 
   */
  async build(endpoint, method, params, return_name) {

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

    return await this.doRequest(queryObject, endpoint, return_name);

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
  async doRequest(queryObject, endpoint, return_name){


    try{
      var [data, supplementalData, hasNext] = await new Promise((resolve, reject) => {

        request(queryObject, (err, res, body) => {

          if(err){
            return reject([err, 500]);
          } 

          if (body.hasOwnProperty('error')){
            return reject([body.error.message, body.error.code]);
          } 

          const entries = body['results'][return_name || endpoint];

          let result = Object.keys(entries).map(key => entries[key]);

          if(body.hasOwnProperty("supplemental_data")){
              return resolve([result, body["supplemental_data"], body["more"]]);
          }

          resolve([result, null, body["more"]]);
          
        });

      });

    }catch(e){

      let [,code] = e;

      if(parseInt(code) === 429){
        console.log("Got 'Too many requests' from TSheets. Let's wait 2min until next try...");
        await sleep(120);
        return await this.doRequest(queryObject, endpoint);

      }

      return Promise.reject(e);
    }


    if(hasNext && queryObject["method"] === 'GET'){

      queryObject['qs']['page'] = queryObject['qs']['page'] + 1;
      return Promise.resolve({data:data, supplemental_data: supplementalData, next: this.doRequest(queryObject, endpoint)});

    }

    return Promise.resolve({data:data, supplemental_data: supplementalData, next:null});


  }


}


module.exports = TSheetsApi;
