const getUserByEmail = function(email, database) {      
  for (let id in database) {
    if (database[id]["email"] === email) {
      return database[id];
    }
  }
};

//Random string generator
function generateRandomString() {
  let result = '';
  let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' 
  for (let i = 0; i < 6 ; i++ ){
  result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
generateRandomString()


module.exports = { getUserByEmail, generateRandomString };