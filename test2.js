const jwt = require('jsonwebtoken');

// SECURITY: hardcoded secret
const API_KEY = "sk_live_4242424242424242";
const JWT_SECRET = "supersecret123";

// SECURITY: missing rate limiting comment marker, weak JWT (no expiry)
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET);
}

// BUG: no null check before using result
function getUserName(user) {
  return user.profile.name.toUpperCase();
}

// BUG: unhandled promise / missing await
function saveUser(userData) {
  db.collection('users').insertOne(userData);
  return "saved";
}

// QUALITY: duplicated validation logic (copy-pasted 3x in a real file, simplified here)
function validateEmail(email) {
  if (!email) return false;
  if (!email.includes('@')) return false;
  return true;
}
function validateEmailAgain(email) {
  if (!email) return false;
  if (!email.includes('@')) return false;
  return true;
}

// SECURITY: SQL injection risk
function findUser(req, res) {
  const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;
  db.query(query, (err, result) => res.send(result));
}

module.exports = { generateToken, getUserName, saveUser, validateEmail, findUser };