/**
 * Module dependencies.
 */
const express = require('express');
// const cors = require('cors');
// const logger = require('morgan');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const os = require('os');

const InitiateMongoServer = require("./common/dbconnection");
const redisStore = require("./common/redisConnection");

/**
 * require dotenv config.
 */
require("dotenv").config();

// Initiate Mongo Server
InitiateMongoServer();



redisStore.on("connect", () => {
    console.log(
      'Connected to Redis Session Store'
    );
  });  

/**
 * Create Express server.
 */
const app = express();

/**
 * Enable CORS
 */
// app.use(cors());

/**
 * Express configuration.
 */
app.set('host', process.env.HOST);
app.set('port', process.env.PORT);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// app.use(express.static('dist'));

// user routes
const userRoute = require('./User/user.route');
userRoute.route_config(app);




/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('App is running at %s:%d in %s mode', os.hostname, app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});