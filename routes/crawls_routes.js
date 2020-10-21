const express = require('express');
const router = express.Router();

const CrawlsController = require('../controllers/crawls_controller')
const {ensureAuthenticated} = require('../middleware/auth');

router.route('/')
  .get(ensureAuthenticated, CrawlsController.index)
  .post(ensureAuthenticated, CrawlsController.create);

router.route('/:id/edit')
  .get(ensureAuthenticated, CrawlsController.edit);

router.route('/new')
  .get(ensureAuthenticated, CrawlsController.newForm)

router.route('/:id')
  .get(CrawlsController.show)
  .put(ensureAuthenticated, CrawlsController.update)
  .delete(ensureAuthenticated, CrawlsController.destroy);

module.exports = router;