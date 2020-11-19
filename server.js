const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require("path");
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

require('./config/passport')(passport);

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  err => {
    if (err) {
      console.log('err:', err);
    } else {
      console.log('MongoDB connected')
    }
  }
);

const app = express();

var whitelist =['http://localhost:3000'];
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    console.log('origin:', origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}))

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());


app.use((req, res, next) => {
  res.locals.user = null;
  if (req.user) {
    res.locals.user = JSON.parse(JSON.stringify(req.user));
  }
  next();
});

// app.use("/", require('./routes/index_routes'));
app.use('/auth', require('./routes/auth_routes'));
app.use('/crawls', require('./routes/crawls_routes'));
app.use('/api/crawl', require('./routes/api_crawl_routes'));

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log("server is listening on port " + port));