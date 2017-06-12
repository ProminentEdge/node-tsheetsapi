var expect    = require("chai").expect;
var TSheetsApi = require("../tsheets-api.js");
var tsheets = new TSheetsApi({
  bearerToken : process.env.TSHEETS_BEARER_TOKEN
});

describe("TSheets API", function(){
    
    it("adds user by name", function(){
      
      var params = {
        data : [{
          username : 'test_user',
          password : '12wdfew34',
          first_name : 'Test123',
          last_name : '123Test'
        }]
      };

      return tsheets.users().add(params)
              .then(function(res){
                expect(res).to.be.an('array');
                expect(res).to.have.lengthOf(1);
                expect(res[0]).to.have.property('_status_message');
                expect(res[0]['_status_message']).to.equal('Created');
              }); 
    });

    it("gets user by name", function(){
      
      var params = {
        first_name : 'Test123',
        last_name : '123Test'
      };

      return tsheets.users().list(params)
              .then(function(res){ 
                expect(res).to.be.an('array');
                expect(res).to.have.lengthOf(1);
                expect(res[0]).to.have.property('first_name');
                expect(res[0]).to.have.property('last_name');
                expect(res[0]).to.have.property('id');
              });
    });
  
    
    it("updates user by username and deactivate the user", function(){
      
      var params = {
        data : [{
          username : 'test_user',
          first_name : 'Test1234',
          active : false
        }]
      };
      return tsheets.users().update(params)
              .then(function(res){
                expect(res).to.be.an('array');
                expect(res).to.have.lengthOf(1);
                expect(res[0]).to.have.property('_status_message');
                expect(res[0]['_status_message']).to.equal('Updated');
              });
    });

    it("gets all user", function(){
      
      return tsheets.users().list()
              .then(function(res){
                expect(res).to.be.an('array');
              })

    });

});
