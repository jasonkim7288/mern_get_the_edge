const express = require('express');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require("path");
const methodOverride = require("method-override");

const exphbs = require('express-handlebars');
const { select } = require('./helpers/hbs');

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(methodOverride("_method"));
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      select
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

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

app.use("/", require('./routes/index_routes'));
app.use('/auth', require('./routes/auth_routes'));
app.use('/crawls', require('./routes/crawls_routes'));
app.use('/api/crawl', require('./routes/api_crawl_routes'));

app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("server is listening on port " + port));