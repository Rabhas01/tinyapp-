const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

//set ejs as the view engine
app.set('view engine', 'ejs');
app.use(cookieParser())


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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


//Login Route
app.post('/login', (req, res) =>{
  
  const email = req.body.email;
  const password = req.body.password;

  if (!userAlreadyExists(email)) {
    res.send(403);
  } else {
    const userID = userAlreadyExists(email);
    if (users[userID].password !== password) {
      res.send(403, "Incorrect password! please try again ");
    } else {
      res.cookie('user_id', userID);
      res.redirect("/urls");
    }
  }
})

//
app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_login', templateVars)
})

//logout Route
app.post('/logout', (req, res) =>{
  res.clearCookie('user_id')
  res.redirect('/urls');
})


app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
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
    password: submitPassword
  };
   
  res.cookie('user_id', newUserID)
  res.redirect('/urls')
  console.log(users);
});


//route for urls
app.get('/urls',(req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_index', templateVars)
})

app.post('/urls', (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);         
  
});

//route to render short url template
app.get('/urls/:shortURL',(req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user,
   shortURL: req.params.shortURL, 
   longURL: urlDatabase[`${req.params.shortURL}`] }
  res.render('urls_show', templateVars)
})


app.get('/', (req, res) => {
  res.send('Welcome');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Tiny app is ready to listen on port ${PORT}!`);
});

app.get('/u/:shortURL', (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newUrl;
  res.redirect('/urls');        // Respond with 'Ok' (we will replace this)

})

//get route to render urls_new template
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']]
  res.render('urls_new', { user: user });
})




app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

})

