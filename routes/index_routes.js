const express = require('express');
const router = express.Router();

const IndexController = require('../controllers/index_controller');
const {ensureGuest} = require('../middleware/auth');

router.route('/')
  .get(ensureGuest, IndexController.index);

module.exports = router;