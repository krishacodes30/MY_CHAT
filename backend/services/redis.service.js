// // import Redis from 'ioredis';

// // import 'dotenv/config';

// // const redisClient = new Redis({
// //     host: process.env.REDIS_HOST,
// //     port: process.env.REDIS_PORT,
// //     password: process.env.REDIS_PASSWORD
// // });


// // redisClient.on('connect', () => {
// //     console.log('Redis connected');
// // })

// // export default redisClient;



// import redisClient from '../config/redis.js'


// const recentMessagesKey = (projectId) =>
//     `chat:recent:${projectId}`


// const onlineUsersKey = (projectId) =>
//     `project:online:${projectId}`


// export async function cacheRecentMessage(
//     projectId,
//     message
// ) {

//     await redisClient.lpush(
//         recentMessagesKey(projectId),
//         JSON.stringify(message)
//     )

//     await redisClient.ltrim(
//         recentMessagesKey(projectId),
//         0,
//         49
//     )

//     await redisClient.expire(
//         recentMessagesKey(projectId),
//         60 * 60 * 24
//     )
// }


// export async function getRecentMessages(
//     projectId
// ) {

//     const messages =
//         await redisClient.lrange(
//             recentMessagesKey(projectId),
//             0,
//             19
//         )


//     if (!messages.length) {
//         return null
//     }


//     return messages
//         .map(message => JSON.parse(message))
//         .reverse()
// }


// export async function addOnlineUser(
//     projectId,
//     userId
// ) {

//     await redisClient.sadd(
//         onlineUsersKey(projectId),
//         userId.toString()
//     )
// }


// export async function removeOnlineUser(
//     projectId,
//     userId
// ) {

//     await redisClient.srem(
//         onlineUsersKey(projectId),
//         userId.toString()
//     )
// }


// export async function getOnlineUsers(
//     projectId
// ) {

//     return redisClient.smembers(
//         onlineUsersKey(projectId)
//     )
// }

import redisClient from '../config/redis.js'


/*
|--------------------------------------------------------------------------
| Presence configuration
|--------------------------------------------------------------------------
*/

const PRESENCE_TTL = 45


/*
|--------------------------------------------------------------------------
| Redis keys
|--------------------------------------------------------------------------
|
| presence:<projectId>:users
|     -> Set of online user IDs
|
| presence:<projectId>:user:<userId>
|     -> Set of socket IDs belonging to that user
|
*/

const usersKey = projectId =>
    `presence:${String(projectId)}:users`


const socketsKey = (
    projectId,
    userId
) =>
    `presence:${String(projectId)}:user:${String(userId)}`


/*
|--------------------------------------------------------------------------
| ADD ONLINE USER
|--------------------------------------------------------------------------
*/

export async function addOnlineUser(
    projectId,
    userId,
    socketId
) {

    const project =
        String(projectId)

    const user =
        String(userId)

    const socket =
        String(socketId)

    const key =
        socketsKey(
            project,
            user
        )


    /*
     * Store this specific socket.
     *
     * This allows:
     *
     * User
     * ├── Laptop socket
     * ├── Phone socket
     * └── Another tab socket
     *
     * without incorrectly marking the user offline.
     */

    await redisClient.sadd(
        key,
        socket
    )


    /*
     * User is considered online
     * for 45 seconds.
     */

    await redisClient.expire(
        key,
        PRESENCE_TTL
    )


    /*
     * Add user to project's online users.
     */

    await redisClient.sadd(
        usersKey(project),
        user
    )
}


/*
|--------------------------------------------------------------------------
| HEARTBEAT
|--------------------------------------------------------------------------
|
| Frontend sends:
|
| socket.emit('presence-heartbeat', projectId)
|
| every ~15 seconds.
|
*/

export async function heartbeatOnlineUser(
    projectId,
    userId,
    socketId
) {

    const project =
        String(projectId)

    const user =
        String(userId)

    const socket =
        String(socketId)

    const key =
        socketsKey(
            project,
            user
        )


    /*
     * Make sure this socket is still registered.
     */

    const exists =
        await redisClient.sismember(
            key,
            socket
        )


    /*
     * Socket disappeared from Redis.
     *
     * Re-add it.
     */

    if (!exists) {

        await addOnlineUser(
            project,
            user,
            socket
        )

        return
    }


    /*
     * Refresh TTL.
     */

    await redisClient.expire(
        key,
        PRESENCE_TTL
    )


    /*
     * Make sure user remains
     * in the project's online set.
     */

    await redisClient.sadd(
        usersKey(project),
        user
    )
}


/*
|--------------------------------------------------------------------------
| REMOVE SOCKET
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Do NOT immediately remove the user.
|
| First remove only the disconnected socket.
|
| If another socket exists,
| the user stays ONLINE.
|
*/

export async function removeOnlineUser(
    projectId,
    userId,
    socketId
) {

    const project =
        String(projectId)

    const user =
        String(userId)

    const socket =
        String(socketId)

    const key =
        socketsKey(
            project,
            user
        )


    /*
     * Remove only this socket.
     */

    await redisClient.srem(
        key,
        socket
    )


    /*
     * Check how many sockets
     * the user still has.
     */

    const remainingSockets =
        await redisClient.scard(
            key
        )


    /*
     * No sockets left.
     *
     * User is OFFLINE.
     */

    if (
        remainingSockets === 0
    ) {

        await redisClient.del(
            key
        )

        await redisClient.srem(
            usersKey(project),
            user
        )

        return
    }


    /*
     * User still has another
     * device/tab connected.
     *
     * Keep them online.
     */

    await redisClient.expire(
        key,
        PRESENCE_TTL
    )
}


/*
|--------------------------------------------------------------------------
| GET ONLINE USERS
|--------------------------------------------------------------------------
*/

export async function getOnlineUsers(
    projectId
) {

    const project =
        String(projectId)

    const key =
        usersKey(project)


    /*
     * Get all users currently
     * listed as online.
     */

    const users =
        await redisClient.smembers(
            key
        )


    const onlineUsers = []


    /*
     * Verify every user's
     * socket key still exists.
     */

    for (
        const userId of users
    ) {

        const active =
            await redisClient.exists(
                socketsKey(
                    project,
                    userId
                )
            )


        if (active) {

            onlineUsers.push(
                userId
            )

        } else {

            /*
             * Clean stale user
             * from project set.
             */

            await redisClient.srem(
                key,
                userId
            )
        }
    }


    return onlineUsers
}


/*
|--------------------------------------------------------------------------
| OPTIONAL: REMOVE USER FROM PROJECT
|--------------------------------------------------------------------------
|
| Useful when a user is explicitly
| leaving a project.
|
*/

export async function removeUserFromProjectPresence(
    projectId,
    userId
) {

    const project =
        String(projectId)

    const user =
        String(userId)


    await redisClient.del(
        socketsKey(
            project,
            user
        )
    )


    await redisClient.srem(
        usersKey(project),
        user
    )
}


/*
|--------------------------------------------------------------------------
| Recent Message Cache
|--------------------------------------------------------------------------
*/

const recentMessagesKey = projectId =>
    `messages:${String(projectId)}`


export async function cacheRecentMessage(
    projectId,
    message
) {

    const key =
        recentMessagesKey(projectId)

    await redisClient.lpush(
        key,
        JSON.stringify(message)
    )

    /*
     * Keep only the latest 50 messages.
     */
    await redisClient.ltrim(
        key,
        0,
        49
    )

    /*
     * Cache expires after 1 hour
     * if the project receives no new messages.
     */
    await redisClient.expire(
        key,
        3600
    )
}