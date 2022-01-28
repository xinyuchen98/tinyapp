const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }, 
  k5aDs4: {
      longURL: "https://www.lighthouselab.ca",
      userID: "ipH92N"
  },
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "123"
  },
 "ipH92N": {
    id: "ipH92N", 
    email: "user2@example.com", 
    password: "234"
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

function getUrls(user_id, urlDatabase) {
  let outputObj = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user_id) {
      outputObj[key] = urlDatabase[key].longURL;
    }
  }
  return outputObj;
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
  const urls = getUrls(req.cookies["user_id"], urlDatabase);
  const templateVars = { user, urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect(`/login`);
  } else {
    const user = users[req.cookies["user_id"]];
    const templateVars = { user };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, urlUserID: urlDatabase[req.params.shortURL].userID };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(400);
    res.send('Invalid URL');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

app.get("/login", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect(`/urls`);
  } else {
    const user = users[req.cookies["user_id"]];
    const templateVars = { user };
    res.render("login", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect(`/urls`);
  } else {
    const user = users[req.cookies["user_id"]];
    const templateVars = { user };
    res.render("register", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('You do not have permission to update this link');
  } else {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.cookies['user_id'] !== urlDatabase[shortURL].userID) {
    res.status(403);
    res.send('You do not have permission to delete this link');
  } else {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.status(400);
    res.send('You are not logged in');
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID: req.cookies["user_id"] };
    res.redirect(`/urls/${shortURL}`);
  }
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