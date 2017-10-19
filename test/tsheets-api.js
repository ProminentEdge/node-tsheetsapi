const expect    = require("chai").expect;
const TSheetsApi = require("../tsheets-api.js");
const tsheets = new TSheetsApi({
  bearerToken : process.env.TSHEETS_BEARER_TOKEN
});

describe("TSheets API", () => {

  it("adds user by name", done => {

    const params = {
      data : [{
        username : 'test_user',
        password : '12wdfew34',
        first_name : 'Test123',
        last_name : '123Test'
      }]
    };

    async function testFunction(done){

      let res = await tsheets.users().add(params);

      expect(res.data).to.be.an('array');
      expect(res.data).to.have.lengthOf(1);
      expect(res.data[0]).to.have.property('_status_message');
      expect(res.data[0]['_status_message']).to.equal('Created');

      done();

    }

    testFunction(done);

  });

  it("gets user by name", done => {

    const params = {
      first_name : 'Test123',
      last_name : '123Test'
    };

    async function testFunction(done){
      let res = await tsheets.users().list(params);

      expect(res.data).to.be.an('array');
      expect(res.data).to.have.lengthOf(1);
      expect(res.data[0]).to.have.property('first_name');
      expect(res.data[0]).to.have.property('last_name');
      expect(res.data[0]).to.have.property('id');
      done(); 
    }

    testFunction(done);


  });


  it("updates user by username and deactivate the user", done => {

    const params = {
      data : [{
        username : 'test_user',
        first_name : 'Test1234',
        active : false
      }]
    };

    async function testFunction(done){

      let res = await tsheets.users().update(params);

      expect(res.data).to.be.an('array');
      expect(res.data).to.have.lengthOf(1);
      expect(res.data[0]).to.have.property('_status_message');
      expect(res.data[0]['_status_message']).to.equal('Updated');
      done();

    }

    testFunction(done);

  });

  it("gets all user", (done) => {

    async function testFunction(done){
      let res = await tsheets.users().list();

      while(res && res.data.length){
        expect(res.data).to.be.an('array');
        expect(res.supplemental_data).to.be.an('object');
        res = await res.next;
      }

      done();

    }

    testFunction(done);

  });

});
