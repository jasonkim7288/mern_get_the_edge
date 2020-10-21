const Crawl = require('../models/crawl');

const getDefaultCrawls = async (req) => {
  let foundCrawls = await Crawl.find({ isDefault: true });

  return foundCrawls;
};

module.exports = { getDefaultCrawls };