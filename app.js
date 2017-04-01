'use strict';

// Modules
const express = require('express');
const path = require('path');
const hbs = require('hbs');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bb = require('express-busboy');
const session = require('express-session');

// Constants
const PORT = 8080;
global.__base = __dirname + '/';

// Paths
const routes = require(path.join(__base, 'routes', 'index'));

// App
const app = express();

// View engine setup
app.set('view engine', 'hbs');
app.set('views', path.join(__base, 'views'));
hbs.registerPartials(path.join(__base, 'views', 'partials'));

// Routes
app.use('/', routes);

// Favicon
app.use(favicon(path.join(__base, 'public', 'images', 'ico', 'favicon.ico')));

// Request Handling
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'sequoia' }));
bb.extend(app, {
  upload: true,
  allowedPath: /./,
});

// Static Dirs
app.use(express.static(path.join(__base, 'public')));
app.use(express.static(path.join(__base, 'images')));

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);

module.exports = app;
