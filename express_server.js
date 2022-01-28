const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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
}

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
}

function emailExists(email, userDatabase) {
  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return true;
    }
  }
  return false;
}

function checkPassword(email, password, userDatabase) {
  for (const key in userDatabase) {
    if (userDatabase[key].email === email && userDatabase[key].password === password) {
      return true;
    }
  }
  return false;
}

function getUserId(email, userDatabase) {
  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return key;
    }
  }
  return false;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!emailExists(email, users)) {
    res.status(403);
    res.send('Cannot find a user with the email address');
  } else if (!checkPassword(email, password, users)) {
    res.status(403);
    res.send('Password is incorrect');
  } else {
    res.cookie('user_id', getUserId(email, users));
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    res.status(400);
    res.send('Email or password is empty');
  } else if (emailExists(email, users)) {
    res.status(400);
    res.send('This email is already registered');
  } else {
    const id = generateRandomString();
    users[id] = {
      id, 
      email, 
      password, 
    }
    res.cookie('user_id', id);
    res.redirect('/urls');
  } 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});