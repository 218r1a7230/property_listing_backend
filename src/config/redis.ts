// config/redis.ts
import Redis from 'ioredis';
import config from './config';

const redisClient = new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redisClient;