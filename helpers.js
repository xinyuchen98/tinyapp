const bcrypt = require('bcryptjs');

const getUserIdByEmail = function (email, userDatabase) {
  for (const key in userDatabase) {
    if (userDatabase[key].email === email) {
      return key;
    }
  }
  return false;
}

const generateRandomString = function () {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  const length = 6;
  for (let i = 0; i < length; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
}

const checkPassword = function (email, password, userDatabase) {
  for (const key in userDatabase) {
    if (email === userDatabase[key].email && bcrypt.compareSync(password, userDatabase[key].password)) {
      return true;
    }
  }
  return false;
}

const getUrls = function (user_id, urlDatabase) {
  let outputObj = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user_id) {
      outputObj[key] = urlDatabase[key].longURL;
    }
  }
  return outputObj;
}

module.exports = { getUserIdByEmail, generateRandomString, checkPassword, getUrls };