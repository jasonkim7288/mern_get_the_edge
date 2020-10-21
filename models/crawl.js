const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CrawlSchema = Schema({
  jobTitle: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  skills: [
    {
      keyword: {
        type: String,
        required: true
      }
    }
  ],
  results: [
    {
      createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
      totalJobs: {
        type: Number,
        default: 0
      },
      skills: [
        {
          keyword: {
            type: String,
            required: true
          },
          count: {
            type: Number,
            required: true,
            default: 0
          }
        }
      ]
    }
  ],
  isDefault: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('crawls', CrawlSchema);