var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require("express-session");
var okta = require('@okta/okta-sdk-nodejs');
var ExpressOIDC = require('@okta/oidc-middleware').ExpressOIDC;

const dashboardRouter = require("./routes/dashboard");
const publicRouter = require("./routes/public");
const usersRouter = require("./routes/users");

var app = express();
var oktaClient = new okta.Client({
  orgUrl: 'https://dev-581505.okta.com',
  token: '00UwPwrFDg_6R5woAFbzFS80q35h7tBGVWX0xNB32O'
});
const oidc = new ExpressOIDC({
  issuer: 'https://dev-581505.okta.com/oauth2/default',
  client_id: '0oaa6j0v03sPCnCJ34x6',
  client_secret: 'DTdfrc5UALMXFxbS2zfhlaC0YBypVAkd84eLtOjT',
  appBaseUrl: 'http://localhost:3000',
  redirect_uri: 'http://localhost:3000/users/callback',
  scope: "openid profile",
  routes: {
    login: {
      path: "/users/login"
    },
    callback: {
      path: "/users/callback",
      defaultRedirect: "/dashboard"
    }
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'dklasASDF33sdksl22sdakkeiei31122ksdskldnlskdf22@@@#mdkskdflaksdfm!@!$!@!$@$!@!$@dkslakfmalskdfnasdflksdnfoin2o3in2o3i',
  resave: true,
  saveUninitialized: false
}));
app.use(oidc.router);

app.use((req, res, next) => {
  if (!req.userinfo) {
    return next();
  }

  oktaClient.getUser(req.userContext.userinfo.sub)
    .then(user => {
      req.user = user;
      res.locals.user = user;
      next();
    }).catch(err => {
      next(err);
    });
});

app.get('/test', (req, res) => {
  res.json({ profile: req.user ? req.user.profile : null });
});

function loginRequired(req, res, next) {
  if (!req.userContext) {
    return res.status(401).render("unauthenticated");
  }
  next();
}

app.use('/', publicRouter);
app.use('/dashboard', loginRequired, dashboardRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
