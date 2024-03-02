const { Redis } = require("ioredis");

const client = new Redis(process.env.REDIS);

module.exports = client;
