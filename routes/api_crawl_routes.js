const express = require('express');
const router = express.Router();

const CrawlsController = require('../controllers/api_crawl_controller');

router.get('/start/:id', CrawlsController.start);
router.get('/check/:id', CrawlsController.check);

module.exports = router;