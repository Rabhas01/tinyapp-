const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session')
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

//set ejs as the view engine
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "SpiderMan"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "SpiderMan"}
};

const users = { 
  'SpiderMan': {
    id: 'SpiderMan', 
    email: 'spiderman@avengers.com', 
    password: 'Iloveironman'
  },
 'Thanos': {
    id: 'Thanos', 
    email: 'mustdestroy@infinity_stones.com', 
    password: 'avengersucks'
  }
}



const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));



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

//check if user already exist
function userAlreadyExists(email)  {
  for (let userID in users) {
    let user = users[userID]
    if (user.email == email){
      return user.id;
    } 
  }
  return null; 
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

app.get('/register', (req, res) => {
  const user = users[req.session["user_id"]];
  res.render('urls_registration', { user: user });
});

//registration route from data
app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  const submitPassword = req.body.password;
  
  if (!submitEmail || !submitPassword){
    res.send(400, "Please enter a valid username and Password")
    return;
  };

  if (userAlreadyExists(submitEmail)){
    res.send(400, "Account already exists")
    return;
  };

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: submitEmail,
    password: bcrypt.hashSync(submitPassword, 10)
  
  };
   
  req.session['user_id'] = newUserID
  res.redirect('/urls')
  console.log(users);
});


//Login Route
app.post('/login', (req, res) =>{
 
  const email = req.body.email;
  const password = req.body.password;

  if (!userAlreadyExists(email)) {
    res.send(403);
  } else {
    const userID = userAlreadyExists(email);
      if (!bcrypt.hashSync(password, 10, users[userID].password)) {
      res.send(403, "Incorrect password! please try again ");
    } else {
      req.session['user_id'] = userID;
      res.redirect("/urls");
    }
  }
})

//
app.get('/login', (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_login', templateVars)
})

//logout Route
app.post('/logout', (req, res) =>{
  req.session["user_id"] = null;
  res.redirect('/urls');
})

//route for urls
app.get('/urls',(req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
    return;
  }
  const userUrl = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls: userUrl, user: user };
  res.render("urls_index", templateVars);
});

  
app.post('/urls', (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const user = users[req.session["user_id"]];
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  res.redirect("/urls/" + shortURL);  
});

//get route to render urls_new template
app.get('/urls/new', (req, res) => {
  const user = users[req.session['user_id']]
  if (!user) {
    res.status(400).send('Please login to access')
    } else {
  res.render('urls_new', { user: user })
  };
})


//route to render short url template
app.get('/urls/:shortURL',(req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
    return;
  }
  const templateVars = { 
   shortURL: req.params.shortURL, 
   longURL: urlDatabase[req.params.shortURL].longURL,
   user: user, }
  res.render('urls_show', templateVars)
})

app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
    return;
  }

  urlDatabase[req.params.shortURL].longURL = req.body.newUrl;
  res.redirect('/urls');        

})

app.get('/', (req, res) => {
  res.send('Welcome');
});



app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Tiny app is ready to listen on port ${PORT}!`);
});

app.get('/u/:shortURL', (req, res) => {
   const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
    return;
  }
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(user.id, urlDatabase)
  if (Object.keys(userUrls).includes(shortURL)) {
      delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send(401);
  }
});
