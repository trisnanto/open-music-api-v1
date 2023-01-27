const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  jwt: {
    keys: process.env.ACCESS_TOKEN_KEY,
    maxAgeSec: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitmq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
};

module.exports = config;
