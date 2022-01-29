const { assert } = require('chai');

const { getUserIdByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user id with valid email', function() {
    const actualUserID = getUserIdByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(actualUserID, expectedUserID);
  });
  it('should return undefined with invalid email', function() {
    const actualUserID = getUserIdByEmail("user3@example.com", testUsers)
    assert.isUndefined(actualUserID);
  });
});