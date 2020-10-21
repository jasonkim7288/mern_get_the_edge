const {
  addCrawl,
  removeCrawl,
  updateCrawl,
  getAllCrawls,
  getOneCrawl
} = require('../utils/crawls_utils');

const User = require('../models/user');

module.exports = {
  index: async (req, res) => {
    const allCrawls = JSON.parse(JSON.stringify(await getAllCrawls(req)));
    // console.log('allCrawls: ', allCrawls);
    res.render('crawls/index', {
      allCrawls
    });
  },
  create: (req, res) => {
    console.log(req.body);
    if (req.user) {
      const strSkills = req.body.skills;
      req.body.skills = strSkills.split(',').map(skill => ({keyword: skill.trim()}))
      addCrawl(req).save((err, crawl) => {
        if (err) {
          res.redirect('/crawls/new?err=failed');
        } else {
          console.log('req.user._id:', req.user._id);
          User.findById(req.user._id)
            .then(curUser => {
              curUser.crawls.unshift(crawl);
              console.log('curUser.crawls:', curUser.crawls)
              return curUser.save();
            })
            .then(savedUser => {
              res.redirect('/crawls');
            })
            .catch(err => {
              console.log('err:', err);
              res.redirect('/crawls/new?err=failed');
            });
        }
      });
    } else {
      res.redirect('/');
    }
  },
  edit: (req, res) => {
    if (req.user) {
      const foundCrawl = req.user.crawls.some(crawl => crawl._id == req.params.id);
      console.log('foundCrawl:', foundCrawl)
      if(foundCrawl) {
        getOneCrawl(req).exec((err, crawl) => {
          if (err) {
            return res.status(500).json({error: err.message});
          }
          let editCrawl = JSON.parse(JSON.stringify(crawl));
          const skills = editCrawl.skills;
          editCrawl.skills = skills.map(skill => skill.keyword).join(', ')
          res.render('crawls/edit', { crawl: editCrawl });
        });
      } else {
        res.redirect(`/crawls`);
      }
    } else {
      res.redirect('/');
    }
  },
  newForm: (req, res) => {
    res.render('crawls/new');
  },
  show: (req, res) => {
    getOneCrawl(req).exec((err, crawl) => {
      if (err) {
        console.log('err:', err);
        return res.redirect('/cralws')
      }
      const oneCrawl = JSON.parse(JSON.stringify(crawl))
      let strRecentDate = null;
      let totalJobs = null;
      if (oneCrawl.results && oneCrawl.results[0]) {
        const recentDate = new Date(oneCrawl.results[0].createdAt);
        strRecentDate = recentDate.getDate() + '-' + (recentDate.getMonth() + 1) + '-' + recentDate.getFullYear();
        totalJobs = oneCrawl.results[0].totalJobs
      }
      // console.log('strRecentDate:', strRecentDate)
      res.render('crawls/show',{ crawlStr: JSON.stringify(crawl), crawl: oneCrawl, recentDate: strRecentDate, totalJobs});
    })

  },
  update: (req, res) => {
    if (req.error) {
      res.status(req.error.status);
      res.send(req.error.message);
    } else {
      const strSkills = req.body.skills;
      req.body.skills = strSkills.split(',').map(skill => ({keyword: skill.trim()}))
      console.log('req.body:', req.body);
      updateCrawl(req).exec((err, crawl) => {
        if (err) {
          res.status(500);
          return res.json({
            error: err.message
          });
        }
        res.redirect('/crawls');
      });
    }
  },
  destroy: (req, res) => {
    if (req.error) {
      res.status(req.error.status);
      res.send(req.error.message);
    } else {
      // execute the query from deletePost
      removeCrawl(req.params.id).exec((err) => {
        if (err) {
          res.status(500);
          return res.json({
            error: err.message
          });
        }
        User.findById(req.user._id)
        .then(curUser => {
          curUser.crawls = curUser.crawls.filter(crawl => crawl.id != req.params.id);
          return curUser.save();
        })
        .then(savedUser => {
          res.redirect('/crawls');
        })
        .catch(err => {
          console.log('err:', err);
          res.redirect('/crawls?err=failed');
        });
      });
    }
  }
}