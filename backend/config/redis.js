import Redis from 'ioredis'
import 'dotenv/config'

const redisClient = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD
    })


redisClient.on('connect', () => {
    console.log('Redis connected')
})


redisClient.on('ready', () => {
    console.log('Redis ready')
})


redisClient.on('error', (error) => {
    console.error(
        'Redis error:',
        error.message
    )
})


redisClient.on('close', () => {
    console.log('Redis connection closed')
})


export default redisClient