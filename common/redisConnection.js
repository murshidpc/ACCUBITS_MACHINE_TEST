const session = require("express-session");
const redis = require("redis");

// connect to redis session store
const redisStore = redis.createClient();

module.exports =  redisStore;