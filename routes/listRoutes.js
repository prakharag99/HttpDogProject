// routes/listRoutes.js
const express = require('express');
const router = express.Router();
const List = require('../models/List');

// Middleware to ensure user is logged in
function ensureAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Attach the middleware to all routes in this file
router.use(ensureAuthenticated);

// ============ Helper for Filtering Codes ============
function parseFilter(filterStr) {
  // We’ll search in range 100–599 (typical HTTP codes)
  const matchingCodes = [];
  for (let code = 100; code < 600; code++) {
    if (matchesPattern(code.toString(), filterStr)) {
      matchingCodes.push(code);
    }
  }
  return matchingCodes;
}

function matchesPattern(codeStr, filterStr) {
  // Convert '2xx' to a RegExp. e.g. '2xx' -> '^2\\d\\d$'
  // Convert '20x' -> '^20\\d$', etc.
  const regexString = '^' + filterStr.replace(/x/g, '\\d') + '$';
  const regex = new RegExp(regexString);
  return regex.test(codeStr);
}

// ============ Search Page ============
// GET /lists/search => Render the search page
router.get('/search', (req, res) => {
  res.render('search', { codes: [], filter: '', imageLinks: [] });
});

// POST /lists/search => Perform filter, show results
router.post('/search', (req, res) => {
  const { filter } = req.body;
  const codes = parseFilter(filter);
  const imageLinks = codes.map(c => `https://http.dog/${c}.jpg`);
  res.render('search', { codes, filter, imageLinks });
});

// ============ Save a list ============
// POST /lists/save
router.post('/save', async (req, res) => {
  const { filter, listName } = req.body;
  if (!filter || !listName) {
    return res.redirect('/lists/search');
  }

  const codes = parseFilter(filter);
  const imageLinks = codes.map(c => `https://http.dog/${c}.jpg`);

  try {
    const newList = new List({
      name: listName,
      codes,
      imageLinks,
      owner: req.session.userId,
    });
    await newList.save();
    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.redirect('/lists/search');
  }
});

// ============ Lists Page ============
// GET /lists => Show all lists belonging to user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const lists = await List.find({ owner: userId }).sort({ creationDate: -1 });
    res.render('lists', { lists });
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// GET /lists/:id => Show single list details & edit form
router.get('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.send('List not found.');
    }
    if (list.owner.toString() !== userId) {
      return res.send('You do not have permission to view this list.');
    }

    res.render('editList', { list });
  } catch (err) {
    console.error(err);
    res.redirect('/lists');
  }
});

// POST /lists/:id => Update a list
router.post('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, codes } = req.body; 
    // `codes` might be a comma-separated string, e.g. "200,201,202"
    const codesArr = codes.split(',').map(c => parseInt(c.trim(), 10));
    const imageLinksArr = codesArr.map(c => `https://http.dog/${c}.jpg`);

    const updatedList = await List.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { 
        name,
        codes: codesArr,
        imageLinks: imageLinksArr
      },
      { new: true }
    );

    if (!updatedList) {
      return res.send('List not found or not owned by user.');
    }

    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.redirect('/lists');
  }
});

// GET /lists/delete/:id => Delete a list
router.get('/delete/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    await List.findOneAndDelete({ _id: req.params.id, owner: userId });
    res.redirect('/lists');
  } catch (err) {
    console.error(err);
    res.redirect('/lists');
  }
});

module.exports = router;
