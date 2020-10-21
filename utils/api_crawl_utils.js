var Crawler = require('crawler');
const Crawl = require('../models/crawl');

var c = new Crawler({
  // rateLimit: 10,
  maxConnections: 10
})

var workQueue = [];
var theEndOfPages = [];
var crawlObject;
var totalNum = 0;

function runCrawl (crawlObject, url, pageNum) {

  if (pageNum === 1) {
    totalNum = 0;
    theEndOfPages = [];
  }
  theEndOfPages[pageNum] = true;
  const pageUrl = `${url}${pageNum === 1 ? '' : '?page=' + pageNum}`;
  console.log('pageUrl:', pageUrl)
  c.queue([{
    uri: pageUrl,
    callback: (err, res, done) => {
      let hrefs = null;
      if (err) {
        console.log('err:', err);
        return done();
      } else {
        let $ = res.$;
        let aKey;
        let keysWithAttribs = Object.keys($('a')).filter(key => {
          aKey = $('a')[key]
          return aKey.attribs && aKey.attribs.href && /\/job\//.test(aKey.attribs.href)
        });
        hrefs = keysWithAttribs.map(key => `https://www.seek.com.au${$('a')[key].attribs.href}`)
        // console.log('keysWithAttribs:', hrefs);

        $('a').each(function (index) {
          console.log('$(this).text():', $(this).text());
          if ($(this).text() === 'Next') {
            theEndOfPages[pageNum] = false;
          }
        })

        if (hrefs && hrefs.length > 0) {
          totalNum += hrefs.length;
          console.log('hrefs.length:', hrefs.length);
          hrefs.forEach((href, index) => {
            c.queue([{
              uri: href,
              callback: (err, res, done) => {
                if (err) {
                  console.log('err:', err);
                } else {
                  let $ = res.$;
                  // console.log($('li').text());
                  // let strBody = res.body;
                  // console.log(strBody.match(/.{30}angular.{30}/gi));
                  // /.{30}angular.{30}/gi.test(strBody) && count++;
                  // console.log($('li').text().match(/.{30}rest.{30}/gi));

                  counts.forEach(count => {
                    $('li').text().toLowerCase().includes(count.keyword) && count.count++;
                  })

                  if (index === hrefs.length - 1) {
                    console.log('totalNum, count:', totalNum, counts);
                  }

                  if (theEndOfPages[pageNum] && index === hrefs.length - 1) {
                    Crawl.findById(crawlObject._id)
                      .then(foundCrawl => {
                        foundCrawl.results.unshift({skills: counts, totalJobs: totalNum});
                        console.log('foundCrawl.results:', foundCrawl.results);
                        return foundCrawl.save();
                      })
                      .then(res => {
                        console.log('saved');
                      })
                      .catch(err => {
                        console.log('err:', err);
                      })
                      .finally(() => {
                        workQueue.shift();
                        if (workQueue.length > 0) {
                          totalNum = 0;
                          crawlObject = workQueue[0];
                          counts = crawlObject.skills.map(keyword => ({ keyword: keyword.keyword, count: 0}));
                          runCrawl(crawlObject, getUrl(crawlObject), 1);
                        }
                      });
                  } else if (!theEndOfPages[pageNum] && index === hrefs.length - 1) {
                    setTimeout(() => {
                      runCrawl(crawlObject, url, ++pageNum);
                    }, 10);
                  }
                }
                done();
              }
            }])
          })
        }

        done();
      }
    }
  }]);
};

function getUrl (crawlInstance) {
  const jobTitle = crawlInstance.jobTitle.split(' ').join('-') + '-jobs';
  const region = 'in-' + crawlInstance.region.split(' ').join('-');
  const returnUrl = `https://www.seek.com.au/${jobTitle}/${region}`;
  return returnUrl;
}

function startCrawl(crawlInstance) {
  console.log('workQueue, length:', workQueue, workQueue.length);
  if (workQueue.length === 0) {
    crawlObject = JSON.parse(JSON.stringify(crawlInstance));
    counts = crawlObject.skills.map(keyword => ({ keyword: keyword.keyword, count: 0}));
    workQueue.push(crawlObject);
    console.log('crawlObject:', crawlObject)
    runCrawl(crawlObject, getUrl(crawlObject), 1);
    return 'doing';
  } else {
    const indexFound = workQueue.findIndex(job => job._id === crawlInstance._id);
    if (indexFound !== -1) {
      return 'duplicated';
    } else {
      workQueue.push(JSON.parse(JSON.stringify(crawlInstance)));
      return 'queued';
    }
  }
}

function checkCrawlId(id) {
  if (workQueue.length === 0) {
    console.log('workQueue is empty')
    return 'done';
  } else {
    const indexFound = workQueue.findIndex(job => job._id == id);
    if (indexFound === -1) {
      console.log('workQueue, workQueue[0]._id, id:', workQueue, workQueue[0]._id, id)
      return 'done';
    } else if (indexFound === 0) {
      return 'doing';
    } else {
      return 'queued';
    }
  }
}

module.exports = {startCrawl, checkCrawlId};