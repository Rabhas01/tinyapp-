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
function userAlreadyExists (email)  {
  for (let user in users){
    if (users[user].email === email){
      return true
    } 
  }
  return null; 
}


//Login Route
app.post('/login', (req, res) =>{
  let user = userAlreadyExists(req.body.username)
  user = user
  if (user && user[id]) {
    res.cookie('user_id', user.id);
    res.redirect('/urls'); 
  }
  
  res.sendStatus(403);
});

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
  const templateVars = { username: req.cookies['username'],
   shortURL: req.params.shortURL, 
   longURL: urlDatabase[`${req.params.shortURL}`] }
  res.render('urls_show', templateVars)
})


app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
  res.render('urls_registration', { user: user });
});

//endpoint registration from data
app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  // const submitEmail = req.body.email.toLowerCase();
  const submitPassword = req.body.password;
  
  if (!submitEmail && !submitPassword){
    res.send(400, "Please enter a valid username and Password")
  };

  if (userAlreadyExists(submitEmail)){
    res.send(400, "Account already exists")
  };

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: submitEmail,
    password: submitPassword
  };
   
  res.cookie('user_id', newUserID)
  res.redirect('/urls')
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
  const username = users[req.cookies['user_id']]
  res.render('urls_new', { username: req.cookies['username'] } )
})




app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

})


