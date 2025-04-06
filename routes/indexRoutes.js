// routes/indexRoutes.js
const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
  res.render('layout', { body: `
    <h1>Welcome to the HTTP Dog Filter App</h1>
    <p><a href="/login">Login</a> or <a href="/signup">Signup</a> to continue.</p>
  ` });
});

module.exports = router;
