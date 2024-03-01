const { Redis } = require("ioredis");

const client = new Redis({
  password: "chalkdusterRedis7365926202",
});

module.exports = client;
