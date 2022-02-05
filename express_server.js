const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');
const { getUserIdByEmail, generateRandomString, checkPassword, getUrls } = require("./helpers");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

const urlDatabase = {};

const users = {};

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    res.redirect(`/urls`);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// List of urls page
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const urls = getUrls(req.session.user_id, urlDatabase);
  const templateVars = { user, urls };
  res.render("urls_index", templateVars);
});

// Create a new url page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect(`/login`);
  } else {
    const user = users[req.session.user_id];
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
});

// Edit a url page
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, urlUserID: urlDatabase[req.params.shortURL].userID };
  res.render("urls_show", templateVars);
});

// Redirect by short url page
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400);
    res.send('Invalid URL');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

// Login page
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect(`/urls`);
  } else {
    const user = users[req.session.user_id];
    const templateVars = { user };
    res.render("login", templateVars);
  }
});

// Register page
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect(`/urls`);
  } else {
    const user = users[req.session.user_id];
    const templateVars = { user };
    res.render("register", templateVars);
  }
});

// Edit a url action
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('You do not have permission to update this link');
  } else {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls`);
  }
});

// Delete a url action
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('You do not have permission to delete this link');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

// Create a new url action
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(400);
    res.send('You are not logged in');
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  }
});

// Login action
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // If email does not exist in database
  if (!getUserIdByEmail(email, users)) {
    res.status(403);
    res.send('Cannot find a user with the email address');
  // If email and password do not match
  } else if (!checkPassword(email, password, users)) {
    res.status(403);
    res.send('Password is incorrect');
  } else {
    req.session.user_id = getUserIdByEmail(email, users);
    res.redirect('/urls');
  }
});

// Logout action
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Register action
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(400);
    res.send('Email or password is empty');
  // If the email alrady exists in database
  } else if (getUserIdByEmail(email, users)) {
    res.status(400);
    res.send('This email is already registered');
  } else {
    // Generate the user object and store it in the database
    const id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id, 
      email, 
      password: hashedPassword, 
    }
    req.session.user_id = id;
    res.redirect('/urls');
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});