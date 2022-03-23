const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

//set ejs as the view engine
app.set("view engine", "ejs");
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//get route to render urls_new template
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  res.render("urls_new",)
})

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

//Login Route
app.post("/login", (req, res) =>{
  const username = req.body.username
  res.cookie("username", username)
  res.redirect('/urls');
})

//logout Route
app.post("/logout", (req, res) =>{
  const username = req.body.username
  res.clearCookie("username")
  res.redirect('/urls');
})

app.post
//route for urls
app.get("/urls",(req, res) => {
  // const templateVars = { urls: urlDatabase }
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] }
  res.render("urls_index", templateVars)
})

//route to render short url template
app.get("/urls/:shortURL",(req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`] }
  res.render("urls_show", templateVars)
})


app.get("/", (req, res) => {
  res.render('/urls_index');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/u/:shortURL", (req, res) => {
   const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.newUrl;
  res.redirect('/urls');        // Respond with 'Ok' (we will replace this)

})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");

})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`);         // Respond with 'redirect to the new page with shorturl created ' (we will replace this)
  
});

