const { assert } = require('chai');

const { getUserByEmail } = require('../helper.js');

const testUsers = {
  "james": {
    id: "james", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "julia": {
    id: "julia", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = {
      id: "james",
    email: "user1@example.com",
    password: "purple-monkey-dinosaur"
  };
  assert.deepEqual(user, expectedOutput);
});

it('should return undefined for invalid email', function() {
  const user = getUserByEmail("userX@example.com", testUsers);
  const expectedOutput = undefined;
  assert.deepEqual(user, expectedOutput);
});

});