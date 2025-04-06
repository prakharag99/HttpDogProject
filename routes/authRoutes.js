// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET - Signup form
router.get('/signup', (req, res) => {
  res.render('signup');
});

// POST - Handle signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Could handle error more gracefully
      return res.send('User with that email already exists.');
    }

    const newUser = new User({ email, password });
    await newUser.save();

    // Save user ID to session
    req.session.userId = newUser._id;
    res.redirect('/search');
  } catch (err) {
    console.error(err);
    res.send('Signup error.');
  }
});

// GET - Login form
router.get('/login', (req, res) => {
  res.render('login');
});

// POST - Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.send('Invalid email or password.');
    }

    // Save user ID to session
    req.session.userId = user._id;
    res.redirect('/search');
  } catch (err) {
    console.error(err);
    res.send('Login error.');
  }
});

// GET - Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

module.exports = router;
