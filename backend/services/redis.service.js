// import Redis from 'ioredis';

// import 'dotenv/config';

// const redisClient = new Redis({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     password: process.env.REDIS_PASSWORD
// });


// redisClient.on('connect', () => {
//     console.log('Redis connected');
// })

// export default redisClient;



import redisClient from '../config/redis.js'


const recentMessagesKey = (projectId) =>
    `chat:recent:${projectId}`


const onlineUsersKey = (projectId) =>
    `project:online:${projectId}`


export async function cacheRecentMessage(
    projectId,
    message
) {

    await redisClient.lpush(
        recentMessagesKey(projectId),
        JSON.stringify(message)
    )

    await redisClient.ltrim(
        recentMessagesKey(projectId),
        0,
        49
    )

    await redisClient.expire(
        recentMessagesKey(projectId),
        60 * 60 * 24
    )
}


export async function getRecentMessages(
    projectId
) {

    const messages =
        await redisClient.lrange(
            recentMessagesKey(projectId),
            0,
            19
        )


    if (!messages.length) {
        return null
    }


    return messages
        .map(message => JSON.parse(message))
        .reverse()
}


export async function addOnlineUser(
    projectId,
    userId
) {

    await redisClient.sadd(
        onlineUsersKey(projectId),
        userId.toString()
    )
}


export async function removeOnlineUser(
    projectId,
    userId
) {

    await redisClient.srem(
        onlineUsersKey(projectId),
        userId.toString()
    )
}


export async function getOnlineUsers(
    projectId
) {

    return redisClient.smembers(
        onlineUsersKey(projectId)
    )
}