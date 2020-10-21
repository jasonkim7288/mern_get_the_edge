const { getDefaultCrawls } = require('../utils/index_utils');

module.exports = {
  index: async (req, res) => {
    const allCrawls = JSON.parse(JSON.stringify(await getDefaultCrawls(req)));
    // console.log('allCrawls: ', allCrawls);
    res.render('index/index', { allCrawls });
  }
}