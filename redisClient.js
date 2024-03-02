const { Redis } = require("ioredis");

const client = new Redis("redis://red-cnhhgni1hbls73ctri2g:6379");

module.exports = client;
