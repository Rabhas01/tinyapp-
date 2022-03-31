const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const { getUserByEmail } = require('./helper');
const { generateRandomString } = require('./helper');
const { urlsForUser } = require('./helper');


// Set ejs as the view engine
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "SpiderMan"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "TestUser"}
};

const users = {};

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// Register
// To render the registration page
app.get('/register', (req, res) => {
  const user = users[req.session["user_id"]];
  res.render('urls_registration', { user: user });
});

// To submit the registration form for a new registration
app.post('/register', (req, res) => {
  const submitEmail = req.body.email;
  const submitPassword = req.body.password;
  
  if (!submitEmail || !submitPassword) {
    res.status(400).send("Please enter a valid username and password");
    return;
  } else if (getUserByEmail(submitEmail, users)) {
    res.status(400).send("Account already exists");
    return;
  } else {
    const newUserID = generateRandomString();
    users[newUserID] = {
      id: newUserID,
      email: submitEmail,
      password: bcrypt.hashSync(submitPassword, 10)
    };
    req.session['user_id'] = newUserID;
    res.redirect('/urls');
  }
});

// Login
// To render the login page
app.get('/login', (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { urls: urlDatabase, user: user };
  res.render('urls_login', templateVars);
});

// To submit the login form
app.post('/login', (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403).send("There is no account associated with this email address");
    return;
  } else if (!bcrypt.compareSync(password, users[user.id].password)) {
    res.status(403).send("Incorrect password! please try again ");
    return;
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

// Logout
app.post('/logout', (req, res) =>{
  req.session = null;
  res.redirect('/urls');
});

// Route for urls
// To render the list of Urls
app.get('/urls',(req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.status(400).send(`Please login to access this page <a href="/login"> Go to login </a>`);
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

// To render urls_new template
app.get('/urls/new', (req, res) => {
  const user = users[req.session['user_id']];
  if (!user) {
    res.redirect('/login');
  } else {
    res.render('urls_new', { user: user });
  }
});


// To render short url template
app.get('/urls/:shortURL',(req, res) => {
  if (!req.session["user_id"]) {
    res.status(400).send(`Please login to access this page <a href="/login"> Go to login </a>`);
    return;
  }
  const user = users[req.session["user_id"]];
  const userUrls = urlsForUser(user.id, urlDatabase);
  if (!user) {
    res.status(400).send(`Please login to access this page <a href="/login"> Go to login </a>`);
    return;
  } else if (!Object.keys(userUrls).includes(req.params.shortURL)) {
    res.status(403).send("You do not have access to this url");
    return;
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: user,
    };
    res.render('urls_show', templateVars);
  }
});

// Routes for Urls by shortUrl Id

app.post('/urls/:shortURL', (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
  }

  urlDatabase[req.params.shortURL].longURL = req.body.newUrl;
  res.redirect('/register');
});


app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400).send('This short url does not exist');
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.get('/', (req, res) => {
  res.redirect('/urls');
});


app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// To indicate that the server is running on the port
app.listen(PORT, () => {
  console.log(`Tiny app is ready to listen on port ${PORT}!`);
});

// To delete a shortUrl by Id
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.session["user_id"]];
  if (!user) {
    res.redirect('/login');
  }
  const shortURL = req.params.shortURL;
  const userUrls = urlsForUser(user.id, urlDatabase);
  if (Object.keys(userUrls).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("Cannot delete this URL");
    return;
  }
});
