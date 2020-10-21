const Crawl = require('../models/crawl');
const User = require('../models/user');

const { startCrawl, checkCrawlId } = require('../utils/api_crawl_utils');

module.exports = {
  start: (req, res) => {
    console.log('craw started');
    const crawlId = req.params.id;

    if (crawlId) {
      if (req.user) {
        User.findById(req.user._id).populate('crawls.crawl')
        .then(curUser => {
          console.log('curUser:', curUser);
          console.log('curUser.crawls[0]:', curUser.crawls[0])
          const checkCrawlId = curUser.crawls.find(crawl => crawl._id == crawlId)
          if (checkCrawlId) {
            Crawl.findById(crawlId)
            .then(crawl => {
              console.log('crawl:', crawl);
              if (crawl.results && crawl.results.length > 0) {
                const createdDate = new Date(crawl.results[0].createdAt);
                const today = new Date();
                if (createdDate.getDate() === today.getDate() && createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear()) {
                  return res.json({result: 'existed'});
                }
              }
              const result = startCrawl(crawl);
              res.json({crawl, result});
            })
            .catch(err => {
              res.json({ error: err });
            });
          } else {
            Crawl.findById(crawlId)
            .then(crawl => {
              console.log('default crawl:', crawl);
              if (crawl.results && crawl.results.length > 0) {
                const createdDate = new Date(crawl.results[0].createdAt);
                const today = new Date();
                if (createdDate.getDate() === today.getDate() && createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear()) {
                  return res.json({result: 'existed'});
                }
              }
              const result = startCrawl(crawl);
              res.json({crawl, result});
            })
            .catch(err => {
              res.json({ error: 'Cannot match crawl id' });
            });
          }
        });
      } else {
        Crawl.findById(crawlId)
        .then(crawl => {
          console.log('default crawl:', crawl);
          if (crawl.results && crawl.results.length > 0) {
            const createdDate = new Date(crawl.results[0].createdAt);
            const today = new Date();
            if (createdDate.getDate() === today.getDate() && createdDate.getMonth() === today.getMonth() && createdDate.getFullYear() === today.getFullYear()) {
              return res.json({result: 'existed'});
            }
          }
          const result = startCrawl(crawl);
          res.json({crawl, result});
        })
        .catch(err => {
          res.json({ error: 'Cannot match crawl id' });
        });
      }
    }
  },
  check: (req, res) => {
    res.status(200).json({stage: checkCrawlId(req.params.id)});
  }
}
