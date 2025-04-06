// server.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/listRoutes');
const indexRoutes = require('./routes/indexRoutes');

// =========== INITIALIZE APP ===========
const app = express();

// =========== CONNECT TO DB ===========
// Replace the string below with your actual MongoDB connection string or environment variable
mongoose.connect('mongodb://127.0.0.1:27017/httpdogproject', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// =========== MIDDLEWARE ==============
app.set('view engine', 'ejs'); // using EJS templates
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Body parser for form data
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(
  session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false
  })
);

// Simple middleware to attach `session` to local variables, so we can access it in EJS
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// =========== ROUTES ===================
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/lists', listRoutes);

// =========== START SERVER ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
