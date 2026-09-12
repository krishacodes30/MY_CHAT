

// import redisClient from '../config/redis.js'


// /*
// |--------------------------------------------------------------------------
// | Presence configuration
// |--------------------------------------------------------------------------
// */

// const PRESENCE_TTL = 45


// /*
// |--------------------------------------------------------------------------
// | Redis keys
// |--------------------------------------------------------------------------
// |
// | presence:<projectId>:users
// |     -> Set of online user IDs
// |
// | presence:<projectId>:user:<userId>
// |     -> Set of socket IDs belonging to that user
// |
// */

// const usersKey = projectId =>
//     `presence:${String(projectId)}:users`


// const socketsKey = (
//     projectId,
//     userId
// ) =>
//     `presence:${String(projectId)}:user:${String(userId)}`


// /*
// |--------------------------------------------------------------------------
// | ADD ONLINE USER
// |--------------------------------------------------------------------------
// */

// export async function addOnlineUser(
//     projectId,
//     userId,
//     socketId
// ) {

//     const project =
//         String(projectId)

//     const user =
//         String(userId)

//     const socket =
//         String(socketId)

//     const key =
//         socketsKey(
//             project,
//             user
//         )


//     /*
//      * Store this specific socket.
//      *
//      * This allows:
//      *
//      * User
//      * ├── Laptop socket
//      * ├── Phone socket
//      * └── Another tab socket
//      *
//      * without incorrectly marking the user offline.
//      */

//     await redisClient.sadd(
//         key,
//         socket
//     )


//     /*
//      * User is considered online
//      * for 45 seconds.
//      */

//     await redisClient.expire(
//         key,
//         PRESENCE_TTL
//     )


//     /*
//      * Add user to project's online users.
//      */

//     await redisClient.sadd(
//         usersKey(project),
//         user
//     )
// }


// /*
// |--------------------------------------------------------------------------
// | HEARTBEAT
// |--------------------------------------------------------------------------
// |
// | Frontend sends:
// |
// | socket.emit('presence-heartbeat', projectId)
// |
// | every ~15 seconds.
// |
// */

// export async function heartbeatOnlineUser(
//     projectId,
//     userId,
//     socketId
// ) {

//     const project =
//         String(projectId)

//     const user =
//         String(userId)

//     const socket =
//         String(socketId)

//     const key =
//         socketsKey(
//             project,
//             user
//         )


//     /*
//      * Make sure this socket is still registered.
//      */

//     const exists =
//         await redisClient.sismember(
//             key,
//             socket
//         )


//     /*
//      * Socket disappeared from Redis.
//      *
//      * Re-add it.
//      */

//     if (!exists) {

//         await addOnlineUser(
//             project,
//             user,
//             socket
//         )

//         return
//     }


//     /*
//      * Refresh TTL.
//      */

//     await redisClient.expire(
//         key,
//         PRESENCE_TTL
//     )


//     /*
//      * Make sure user remains
//      * in the project's online set.
//      */

//     await redisClient.sadd(
//         usersKey(project),
//         user
//     )
// }


// /*
// |--------------------------------------------------------------------------
// | REMOVE SOCKET
// |--------------------------------------------------------------------------
// |
// | IMPORTANT:
// |
// | Do NOT immediately remove the user.
// |
// | First remove only the disconnected socket.
// |
// | If another socket exists,
// | the user stays ONLINE.
// |
// */

// export async function removeOnlineUser(
//     projectId,
//     userId,
//     socketId
// ) {

//     const project =
//         String(projectId)

//     const user =
//         String(userId)

//     const socket =
//         String(socketId)

//     const key =
//         socketsKey(
//             project,
//             user
//         )


//     /*
//      * Remove only this socket.
//      */

//     await redisClient.srem(
//         key,
//         socket
//     )


//     /*
//      * Check how many sockets
//      * the user still has.
//      */

//     const remainingSockets =
//         await redisClient.scard(
//             key
//         )


//     /*
//      * No sockets left.
//      *
//      * User is OFFLINE.
//      */

//     if (
//         remainingSockets === 0
//     ) {

//         await redisClient.del(
//             key
//         )

//         await redisClient.srem(
//             usersKey(project),
//             user
//         )

//         return
//     }


//     /*
//      * User still has another
//      * device/tab connected.
//      *
//      * Keep them online.
//      */

//     await redisClient.expire(
//         key,
//         PRESENCE_TTL
//     )
// }


// /*
// |--------------------------------------------------------------------------
// | GET ONLINE USERS
// |--------------------------------------------------------------------------
// */

// export async function getOnlineUsers(
//     projectId
// ) {

//     const project =
//         String(projectId)

//     const key =
//         usersKey(project)


//     /*
//      * Get all users currently
//      * listed as online.
//      */

//     const users =
//         await redisClient.smembers(
//             key
//         )


//     const onlineUsers = []


//     /*
//      * Verify every user's
//      * socket key still exists.
//      */

//     for (
//         const userId of users
//     ) {

//         const active =
//             await redisClient.exists(
//                 socketsKey(
//                     project,
//                     userId
//                 )
//             )


//         if (active) {

//             onlineUsers.push(
//                 userId
//             )

//         } else {

//             /*
//              * Clean stale user
//              * from project set.
//              */

//             await redisClient.srem(
//                 key,
//                 userId
//             )
//         }
//     }


//     return onlineUsers
// }


// /*
// |--------------------------------------------------------------------------
// | OPTIONAL: REMOVE USER FROM PROJECT
// |--------------------------------------------------------------------------
// |
// | Useful when a user is explicitly
// | leaving a project.
// |
// */

// export async function removeUserFromProjectPresence(
//     projectId,
//     userId
// ) {

//     const project =
//         String(projectId)

//     const user =
//         String(userId)


//     await redisClient.del(
//         socketsKey(
//             project,
//             user
//         )
//     )


//     await redisClient.srem(
//         usersKey(project),
//         user
//     )
// }


// /*
// |--------------------------------------------------------------------------
// | Recent Message Cache
// |--------------------------------------------------------------------------
// */

// const recentMessagesKey = projectId =>
//     `messages:${String(projectId)}`


// export async function cacheRecentMessage(
//     projectId,
//     message
// ) {

//     const key =
//         recentMessagesKey(projectId)

//     await redisClient.lpush(
//         key,
//         JSON.stringify(message)
//     )

//     /*
//      * Keep only the latest 50 messages.
//      */
//     await redisClient.ltrim(
//         key,
//         0,
//         49
//     )

//     /*
//      * Cache expires after 1 hour
//      * if the project receives no new messages.
//      */
//     await redisClient.expire(
//         key,
//         3600
//     )
// }



import redisClient from '../config/redis.js'

const MESSAGE_CACHE_TTL = Number(
    process.env.REDIS_MESSAGE_CACHE_TTL || 3600
)

const MESSAGE_CACHE_SIZE = 200

const PRESENCE_TTL = Number(
    process.env.REDIS_PRESENCE_TTL || 45
)

function messageKey(projectId) {
    return `project:${String(projectId)}:messages`
}

function presenceKey(projectId) {
    return `project:${String(projectId)}:presence`
}

function presenceMember(userId, socketId) {
    return `${String(userId)}:${String(socketId)}`
}

function parsePresenceMember(member) {
    const separator = member.indexOf(':')

    if (separator === -1) {
        return null
    }

    return {
        userId: member.slice(0, separator),
        socketId: member.slice(separator + 1)
    }
}

export async function cacheRecentMessage(projectId, message) {
    if (!projectId || !message) {
        return false
    }

    try {
        const key = messageKey(projectId)

        await redisClient
            .multi()
            .rpush(key, JSON.stringify(message))
            .ltrim(key, -MESSAGE_CACHE_SIZE, -1)
            .expire(key, MESSAGE_CACHE_TTL)
            .exec()

        return true
    } catch (error) {
        console.error(
            'Redis message cache write failed:',
            error.message
        )

        return false
    }
}

export async function getCachedMessages(projectId) {
    if (!projectId) {
        return null
    }

    try {
        const values = await redisClient.lrange(
            messageKey(projectId),
            0,
            -1
        )

        if (!values.length) {
            return null
        }

        const messages = []

        for (const value of values) {
            try {
                messages.push(JSON.parse(value))
            } catch {
                // Ignore one malformed cache entry.
            }
        }

        return messages.length ? messages : null
    } catch (error) {
        console.error(
            'Redis message cache read failed:',
            error.message
        )

        return null
    }
}

export async function cacheMessages(projectId, messages) {
    if (!projectId || !Array.isArray(messages)) {
        return false
    }

    try {
        const key = messageKey(projectId)

        const multi = redisClient.multi()

        multi.del(key)

        for (const message of messages.slice(-MESSAGE_CACHE_SIZE)) {
            multi.rpush(key, JSON.stringify(message))
        }

        multi.expire(key, MESSAGE_CACHE_TTL)

        await multi.exec()

        return true
    } catch (error) {
        console.error(
            'Redis message cache population failed:',
            error.message
        )

        return false
    }
}

export async function clearProjectMessageCache(projectId) {
    if (!projectId) {
        return false
    }

    try {
        await redisClient.del(messageKey(projectId))
        return true
    } catch (error) {
        console.error(
            'Redis message cache clear failed:',
            error.message
        )

        return false
    }
}

export async function addOnlineUser(
    projectId,
    userId,
    socketId
) {
    if (!projectId || !userId || !socketId) {
        return false
    }

    try {
        const key = presenceKey(projectId)
        const member = presenceMember(userId, socketId)
        const expiresAt = Date.now() + PRESENCE_TTL * 1000

        await redisClient.zadd(
            key,
            expiresAt,
            member
        )

        await redisClient.expire(
            key,
            PRESENCE_TTL + 60
        )

        return true
    } catch (error) {
        console.error(
            'Redis presence add failed:',
            error.message
        )

        return false
    }
}

export async function heartbeatOnlineUser(
    projectId,
    userId,
    socketId
) {
    if (!projectId || !userId || !socketId) {
        return false
    }

    try {
        const key = presenceKey(projectId)
        const member = presenceMember(userId, socketId)
        const expiresAt = Date.now() + PRESENCE_TTL * 1000

        const exists = await redisClient.zscore(
            key,
            member
        )

        if (exists === null) {
            return addOnlineUser(
                projectId,
                userId,
                socketId
            )
        }

        await redisClient.zadd(
            key,
            expiresAt,
            member
        )

        await redisClient.expire(
            key,
            PRESENCE_TTL + 60
        )

        return true
    } catch (error) {
        console.error(
            'Redis presence heartbeat failed:',
            error.message
        )

        return false
    }
}

export async function removeOnlineUser(
    projectId,
    userId,
    socketId
) {
    if (!projectId || !userId || !socketId) {
        return false
    }

    try {
        await redisClient.zrem(
            presenceKey(projectId),
            presenceMember(userId, socketId)
        )

        return true
    } catch (error) {
        console.error(
            'Redis presence remove failed:',
            error.message
        )

        return false
    }
}

export async function getOnlineUsers(projectId) {
    if (!projectId) {
        return []
    }

    try {
        const key = presenceKey(projectId)
        const now = Date.now()

        await redisClient.zremrangebyscore(
            key,
            '-inf',
            now
        )

        const members = await redisClient.zrange(
            key,
            0,
            -1
        )

        const users = new Set()

        for (const member of members) {
            const parsed = parsePresenceMember(member)

            if (parsed?.userId) {
                users.add(parsed.userId)
            }
        }

        if (!members.length) {
            await redisClient.del(key)
        }

        return Array.from(users)
    } catch (error) {
        console.error(
            'Redis online users read failed:',
            error.message
        )

        return []
    }
}
