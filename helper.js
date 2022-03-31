//Retrives the user by their email
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

//check urls specefic to the userid
function urlsForUser(id, urlDatabase) {
  const res = {};
  for (let urlId in urlDatabase) {
      if (urlDatabase[urlId].userID === id) {
          res[urlId] = urlDatabase[urlId];
      }
  }

  return res;
}


module.exports = { getUserByEmail, generateRandomString, urlsForUser };