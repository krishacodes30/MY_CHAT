// // import 'dotenv/config';
// // import http from 'http';
// // import app from './app.js';
// // import { Server } from 'socket.io';
// // import jwt from 'jsonwebtoken';
// // import mongoose from 'mongoose';
// // import projectModel from './models/project.model.js';
// // // import { generateResult } from './services/ai.service.js';

// // const port = process.env.PORT || 3000;



// // const server = http.createServer(app);
// // const io = new Server(server, {
// //     cors: {
// //         origin: '*'
// //     }
// // });


// // io.use(async (socket, next) => {

// //     try {

// //         const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
// //         const projectId = socket.handshake.query.projectId;

// //         if (!mongoose.Types.ObjectId.isValid(projectId)) {
// //             return next(new Error('Invalid projectId'));
// //         }


// //         socket.project = await projectModel.findById(projectId);


// //         if (!token) {
// //             return next(new Error('Authentication error'))
// //         }

// //         const decoded = jwt.verify(token, process.env.JWT_SECRET);

// //         if (!decoded) {
// //             return next(new Error('Authentication error'))
// //         }


// //         socket.user = decoded;

// //         next();

// //     } catch (error) {
// //         next(error)
// //     }

// // })


// // io.on('connection', socket => {
// //     socket.roomId = socket.project._id.toString()


// //     console.log('a user connected');



// //     socket.join(socket.roomId);

// //     socket.on('project-message', async data => {

// //         const message = data.message;

// //         const aiIsPresentInMessage = message.includes('@ai');
// //         socket.broadcast.to(socket.roomId).emit('project-message', data)

// //         if (aiIsPresentInMessage) {


// //             const prompt = message.replace('@ai', '');

// //             const result = await generateResult(prompt);


// //             io.to(socket.roomId).emit('project-message', {
// //                 message: result,
// //                 sender: {
// //                     _id: 'ai',
// //                     email: 'AI'
// //                 }
// //             })


// //             return
// //         }


// //     })

// //     socket.on('disconnect', () => {
// //         console.log('user disconnected');
// //         socket.leave(socket.roomId)
// //     });
// // });




// // server.listen(port, () => {
// //     console.log(`Server is running on port ${port}`);
// // })



// import 'dotenv/config'

// import http from 'http'
// import jwt from 'jsonwebtoken'

// import {
//     Server
// } from 'socket.io'

// import app from './app.js'

// import connectDB
//     from './db/db.js'

// import userModel
//     from './models/user.model.js'

// import projectModel
//     from './models/project.model.js'

// import {
//     createMessage
// } from './services/message.service.js'

// import {
//     generateProjectAIReply,
//     createProjectMemory
// } from './services/ai.service.js'

// import {
//     initVectorStore
// } from './services/vector.service.js'

// import {
//     addOnlineUser,
//     removeOnlineUser,
//     getOnlineUsers
// } from './services/redis.service.js'

// import redisClient
//     from './config/redis.js'


// /*
// |--------------------------------------------------------------------------
// | Database
// |--------------------------------------------------------------------------
// */

// await connectDB()


// /*
// |--------------------------------------------------------------------------
// | Redis
// |--------------------------------------------------------------------------
// */

// await redisClient.ping()

// console.log('Redis ping successful')


// /*
// |--------------------------------------------------------------------------
// | Qdrant
// |--------------------------------------------------------------------------
// */

// await initVectorStore()


// /*
// |--------------------------------------------------------------------------
// | HTTP server
// |--------------------------------------------------------------------------
// */

// const server =
//     http.createServer(app)


// /*
// |--------------------------------------------------------------------------
// | Socket.IO
// |--------------------------------------------------------------------------
// */

// const io = new Server(server, {
//   cors: {
//     origin: 'https://my-app-frontend-gpo8.onrender.com'||process.env.CLIENT_URL || 'http://localhost:5173',
//     credentials: true,
//   },
// });


// /*
// |--------------------------------------------------------------------------
// | Socket authentication
// |--------------------------------------------------------------------------
// */

// io.use(
//     async (
//         socket,
//         next
//     ) => {

//         try {

//             const token =
//                 socket
//                     .handshake
//                     .auth
//                     ?.token


//             if (!token) {

//                 return next(
//                     new Error(
//                         'Authentication required'
//                     )
//                 )
//             }


//             const decoded =
//                 jwt.verify(
//                     token,
//                     process.env.JWT_SECRET
//                 )


//             /*
//              * Your existing JWT may use
//              * another field.
//              *
//              * If so, change decoded.email.
//              */

//             const user =
//                 await userModel.findOne({
//                     email:
//                         decoded.email
//                 })


//             if (!user) {

//                 return next(
//                     new Error(
//                         'User not found'
//                     )
//                 )
//             }


//             socket.user =
//                 user


//             next()

//         } catch (error) {

//             next(
//                 new Error(
//                     'Invalid authentication token'
//                 )
//             )
//         }
//     }
// )


// /*
// |--------------------------------------------------------------------------
// | Socket connections
// |--------------------------------------------------------------------------
// */

// io.on(
//     'connection',
//     socket => {

//         console.log(
//             'Socket connected:',
//             socket.user.email
//         )


//         /*
//         |--------------------------------------------------------------------------
//         | JOIN PROJECT
//         |--------------------------------------------------------------------------
//         */

//         socket.on(
//             'join-project',

//             async projectId => {

//                 try {

//                     const project =
//                         await projectModel
//                             .findOne({
//                                 _id:
//                                     projectId,

//                                 users:
//                                     socket.user._id
//                             })


//                     if (!project) {

//                         socket.emit(
//                             'project-error',
//                             {
//                                 message:
//                                     'You are not a member of this project'
//                             }
//                         )

//                         return
//                     }


//                     const room =
//                         `project:${projectId}`


//                     socket.join(
//                         room
//                     )


//                     socket.projectId =
//                         projectId.toString()


//                     /*
//                      * Redis presence
//                      */

//                     await addOnlineUser(
//                         projectId,

//                         socket.user._id
//                     )


//                     const onlineUsers =
//                         await getOnlineUsers(
//                             projectId
//                         )


//                     io.to(room).emit(
//                         'online-users',
//                         onlineUsers
//                     )


//                 } catch (error) {

//                     console.error(
//                         'Join project error:',
//                         error
//                     )
//                 }
//             }
//         )


//         /*
//         |--------------------------------------------------------------------------
//         | PROJECT MESSAGE
//         |--------------------------------------------------------------------------
//         */

//         socket.on(
//             'project-message',

//             async ({
//                 projectId,
//                 message
//             }) => {

//                 try {

//                     if (
//                         !message?.trim()
//                     ) {
//                         return
//                     }


//                     /*
//                      * Security:
//                      * verify project membership.
//                      */

//                     const project =
//                         await projectModel
//                             .findOne({
//                                 _id:
//                                     projectId,

//                                 users:
//                                     socket.user._id
//                             })


//                     if (!project) {
//                         return
//                     }


//                     const cleanMessage =
//                         message.trim()


//                     const mentionsAI =
//                         /@ai\b/i.test(
//                             cleanMessage
//                         )


//                     /*
//                     |--------------------------------------------------------------------------
//                     | SAVE HUMAN MESSAGE
//                     |--------------------------------------------------------------------------
//                     */

//                     const savedMessage =
//                         await createMessage({
//                             projectId,

//                             senderId:
//                                 socket.user._id,

//                             senderEmail:
//                                 socket.user.email,

//                             content:
//                                 cleanMessage,

//                             role:
//                                 'user',

//                             mentionsAI
//                         })


//                     const room =
//                         `project:${projectId}`


//                     /*
//                     |--------------------------------------------------------------------------
//                     | BROADCAST TO EVERYONE
//                     |--------------------------------------------------------------------------
//                     */

//                     io.to(room).emit(
//                         'project-message',

//                         savedMessage
//                     )


//                     /*
//                     |--------------------------------------------------------------------------
//                     | Normal message → done
//                     |--------------------------------------------------------------------------
//                     */

//                     if (!mentionsAI) {
//                         return
//                     }


//                     /*
//                     |--------------------------------------------------------------------------
//                     | Remove @AI
//                     |--------------------------------------------------------------------------
//                     */

//                     const aiQuestion =
//                         cleanMessage
//                             .replace(
//                                 /@ai\b/i,
//                                 ''
//                             )
//                             .trim()


//                     if (!aiQuestion) {
//                         return
//                     }


//                     /*
//                     |--------------------------------------------------------------------------
//                     | AI THINKING
//                     |--------------------------------------------------------------------------
//                     */

//                     io.to(room).emit(
//                         'ai-status',
//                         {
//                             status:
//                                 'thinking'
//                         }
//                     )


//                     /*
//                     |--------------------------------------------------------------------------
//                     | AI + MEMORY + RAG
//                     |--------------------------------------------------------------------------
//                     */

//                     const aiReply =
//                         await generateProjectAIReply({
//                             projectId,

//                             userMessage:
//                                 aiQuestion
//                         })


//                     /*
//                     |--------------------------------------------------------------------------
//                     | SAVE AI MESSAGE
//                     |--------------------------------------------------------------------------
//                     */

//                     const aiMessage =
//                         await createMessage({
//                             projectId,

//                             senderEmail:
//                                 'AI Assistant',

//                             content:
//                                 aiReply,

//                             role:
//                                 'assistant',

//                             mentionsAI:
//                                 false
//                         })


//                     /*
//                     |--------------------------------------------------------------------------
//                     | BROADCAST AI MESSAGE
//                     |--------------------------------------------------------------------------
//                     */

//                     io.to(room).emit(
//                         'project-message',

//                         aiMessage
//                     )


//                     io.to(room).emit(
//                         'ai-status',
//                         {
//                             status:
//                                 'idle'
//                         }
//                     )


//                     /*
//                     |--------------------------------------------------------------------------
//                     | Update project memory
//                     | in background.
//                     |--------------------------------------------------------------------------
//                     */

//                     createProjectMemory(
//                         projectId
//                     ).catch(error => {

//                         console.error(
//                             'Memory update failed:',
//                             error.message
//                         )
//                     })


//                 } catch (error) {

//                     console.error(
//                         'Project message error:',
//                         error
//                     )


//                     io.to(
//                         `project:${projectId}`
//                     ).emit(
//                         'ai-status',
//                         {
//                             status:
//                                 'idle'
//                         }
//                     )


//                     socket.emit(
//                         'project-error',
//                         {
//                             message:
//                                 'Failed to process message'
//                         }
//                     )
//                 }
//             }
//         )


//         /*
//         |--------------------------------------------------------------------------
//         | DISCONNECT
//         |--------------------------------------------------------------------------
//         */

//         socket.on(
//             'disconnect',

//             async () => {

//                 console.log(
//                     'Socket disconnected:',
//                     socket.user.email
//                 )


//                 if (
//                     !socket.projectId
//                 ) {
//                     return
//                 }


//                 await removeOnlineUser(
//                     socket.projectId,

//                     socket.user._id
//                 )


//                 const onlineUsers =
//                     await getOnlineUsers(
//                         socket.projectId
//                     )


//                 io.to(
//                     `project:${socket.projectId}`
//                 ).emit(
//                     'online-users',

//                     onlineUsers
//                 )
//             }
//         )
//     }
// )


// /*
// |--------------------------------------------------------------------------
// | Start server
// |--------------------------------------------------------------------------
// */

// // const PORT =
// //     process.env.PORT || 5000


// // server.listen(
// //     PORT,

// //     () => {

// //         console.log(
// //             `Server running on port ${PORT}`
// //         )
// //     }
// // )

// if (!process.env.VERCEL) {
//   const PORT = process.env.PORT || 3000
//   server.listen(PORT, () => {
//     console.log(`🚀 Server running locally on http://localhost:${PORT}`)
//   })
// }


import 'dotenv/config'

import http from 'http'
import jwt from 'jsonwebtoken'

import {
    Server
} from 'socket.io'

import app from './app.js'

import connectDB
    from './db/db.js'

import userModel
    from './models/user.model.js'

import projectModel
    from './models/project.model.js'

import {
    createMessage
} from './services/message.service.js'

import {
    generateProjectAIReply,
    createProjectMemory
} from './services/ai.service.js'

import {
    initVectorStore
} from './services/vector.service.js'

import {
    addOnlineUser,
    removeOnlineUser,
    heartbeatOnlineUser,
    getOnlineUsers
} from './services/redis.service.js'

import redisClient
    from './config/redis.js'


/*
|--------------------------------------------------------------------------
| Database
|--------------------------------------------------------------------------
*/

await connectDB()


/*
|--------------------------------------------------------------------------
| Redis
|--------------------------------------------------------------------------
*/

await redisClient.ping()

console.log('Redis ping successful')


/*
|--------------------------------------------------------------------------
| Qdrant
|--------------------------------------------------------------------------
*/

await initVectorStore()


/*
|--------------------------------------------------------------------------
| HTTP server
|--------------------------------------------------------------------------
*/

const server =
    http.createServer(app)


/*
|--------------------------------------------------------------------------
| Socket.IO
|--------------------------------------------------------------------------
*/

const io = new Server(server, {
    cors: {
        origin:
            process.env.CLIENT_URL ||
            'https://my-app-frontend-gpo8.onrender.com',

        credentials: true
    },

    /*
     * Keep Socket.IO connection alive.
     */
    pingInterval: 25000,
    pingTimeout: 20000
})


/*
|--------------------------------------------------------------------------
| Socket authentication
|--------------------------------------------------------------------------
*/

io.use(
    async (
        socket,
        next
    ) => {

        try {

            const token =
                socket
                    .handshake
                    .auth
                    ?.token


            if (!token) {

                return next(
                    new Error(
                        'Authentication required'
                    )
                )
            }


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_SECRET
                )


            const user =
                await userModel.findOne({
                    email:
                        decoded.email
                })


            if (!user) {

                return next(
                    new Error(
                        'User not found'
                    )
                )
            }


            socket.user =
                user


            next()

        } catch (error) {

            console.error(
                'Socket authentication error:',
                error.message
            )

            next(
                new Error(
                    'Invalid authentication token'
                )
            )
        }
    }
)


/*
|--------------------------------------------------------------------------
| Socket connections
|--------------------------------------------------------------------------
*/

io.on(
    'connection',
    socket => {

        console.log(
            'Socket connected:',
            socket.user.email,
            '| socket:',
            socket.id
        )


        /*
        |--------------------------------------------------------------------------
        | JOIN PROJECT
        |--------------------------------------------------------------------------
        */

        socket.on(
            'join-project',

            async projectId => {

                try {

                    if (!projectId) {
                        return
                    }


                    /*
                     * If this socket was already inside
                     * another project, remove old presence.
                     */

                    if (
                        socket.projectId &&
                        String(socket.projectId) !== String(projectId)
                    ) {

                        const oldProjectId =
                            socket.projectId

                        await removeOnlineUser(
                            oldProjectId,
                            socket.user._id,
                            socket.id
                        )

                        socket.leave(
                            `project:${oldProjectId}`
                        )

                        const oldOnlineUsers =
                            await getOnlineUsers(
                                oldProjectId
                            )

                        io.to(
                            `project:${oldProjectId}`
                        ).emit(
                            'online-users',
                            oldOnlineUsers
                        )
                    }


                    /*
                     * Verify project membership.
                     */

                    const project =
                        await projectModel.findOne({
                            _id:
                                projectId,

                            users:
                                socket.user._id
                        })


                    if (!project) {

                        socket.emit(
                            'project-error',
                            {
                                message:
                                    'You are not a member of this project'
                            }
                        )

                        return
                    }


                    const room =
                        `project:${projectId}`


                    /*
                     * Join Socket.IO room.
                     */

                    socket.join(
                        room
                    )


                    socket.projectId =
                        String(projectId)


                    /*
                     * Add this specific socket
                     * to Redis presence.
                     *
                     * Multiple devices/tabs are supported.
                     */

                    await addOnlineUser(
                        projectId,
                        socket.user._id,
                        socket.id
                    )


                    /*
                     * Send current online users
                     * to everyone in the project.
                     */

                    const onlineUsers =
                        await getOnlineUsers(
                            projectId
                        )


                    io.to(room).emit(
                        'online-users',
                        onlineUsers
                    )


                    console.log(
                        'Project joined:',
                        socket.user.email,
                        '| project:',
                        projectId,
                        '| socket:',
                        socket.id
                    )

                } catch (error) {

                    console.error(
                        'Join project error:',
                        error
                    )

                    socket.emit(
                        'project-error',
                        {
                            message:
                                'Failed to join project'
                        }
                    )
                }
            }
        )


        /*
        |--------------------------------------------------------------------------
        | PRESENCE HEARTBEAT
        |--------------------------------------------------------------------------
        |
        | Frontend sends this every 15 seconds.
        |
        | Redis presence TTL = 45 seconds.
        |
        */

        socket.on(
            'presence-heartbeat',

            async projectId => {

                if (
                    !socket.projectId ||
                    String(projectId) !==
                        String(socket.projectId)
                ) {
                    return
                }


                try {

                    await heartbeatOnlineUser(
                        socket.projectId,
                        socket.user._id,
                        socket.id
                    )

                } catch (error) {

                    console.error(
                        'Presence heartbeat error:',
                        error.message
                    )
                }
            }
        )


        /*
        |--------------------------------------------------------------------------
        | LEAVE PROJECT
        |--------------------------------------------------------------------------
        */

        socket.on(
            'leave-project',

            async projectId => {

                if (
                    !socket.projectId ||
                    String(projectId) !==
                        String(socket.projectId)
                ) {
                    return
                }


                try {

                    const currentProjectId =
                        String(socket.projectId)


                    /*
                     * Remove only this socket.
                     *
                     * If another device/tab exists,
                     * the user stays online.
                     */

                    await removeOnlineUser(
                        currentProjectId,
                        socket.user._id,
                        socket.id
                    )


                    socket.leave(
                        `project:${currentProjectId}`
                    )


                    socket.projectId =
                        null


                    const onlineUsers =
                        await getOnlineUsers(
                            currentProjectId
                        )


                    io.to(
                        `project:${currentProjectId}`
                    ).emit(
                        'online-users',
                        onlineUsers
                    )

                } catch (error) {

                    console.error(
                        'Leave project error:',
                        error.message
                    )
                }
            }
        )


        /*
        |--------------------------------------------------------------------------
        | PROJECT MESSAGE
        |--------------------------------------------------------------------------
        */

        socket.on(
            'project-message',

            async ({
                projectId,
                message
            }) => {

                try {

                    if (
                        !message?.trim()
                    ) {
                        return
                    }


                    /*
                     * Security:
                     * Verify that the sender belongs
                     * to this project.
                     */

                    const project =
                        await projectModel.findOne({
                            _id:
                                projectId,

                            users:
                                socket.user._id
                        })


                    if (!project) {

                        socket.emit(
                            'project-error',
                            {
                                message:
                                    'You are not a member of this project'
                            }
                        )

                        return
                    }


                    const cleanMessage =
                        message.trim()


                    const mentionsAI =
                        /@ai\b/i.test(
                            cleanMessage
                        )


                    /*
                    |--------------------------------------------------------------------------
                    | SAVE HUMAN MESSAGE
                    |--------------------------------------------------------------------------
                    */

                    const savedMessage =
                        await createMessage({
                            projectId,

                            senderId:
                                socket.user._id,

                            senderEmail:
                                socket.user.email,

                            content:
                                cleanMessage,

                            role:
                                'user',

                            mentionsAI
                        })


                    const room =
                        `project:${projectId}`


                    /*
                    |--------------------------------------------------------------------------
                    | BROADCAST HUMAN MESSAGE
                    |--------------------------------------------------------------------------
                    */

                    io.to(room).emit(
                        'project-message',
                        savedMessage
                    )


                    /*
                    |--------------------------------------------------------------------------
                    | Normal message
                    |--------------------------------------------------------------------------
                    */

                    if (!mentionsAI) {
                        return
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | Remove @AI
                    |--------------------------------------------------------------------------
                    */

                    const aiQuestion =
                        cleanMessage
                            .replace(
                                /@ai\b/i,
                                ''
                            )
                            .trim()


                    if (!aiQuestion) {
                        return
                    }


                    /*
                    |--------------------------------------------------------------------------
                    | AI THINKING
                    |--------------------------------------------------------------------------
                    */

                    io.to(room).emit(
                        'ai-status',
                        {
                            status:
                                'thinking'
                        }
                    )


                    /*
                    |--------------------------------------------------------------------------
                    | AI + RAG
                    |--------------------------------------------------------------------------
                    */

                    const aiReply =
                        await generateProjectAIReply({
                            projectId,

                            userMessage:
                                aiQuestion
                        })


                    /*
                    |--------------------------------------------------------------------------
                    | SAVE AI MESSAGE
                    |--------------------------------------------------------------------------
                    */

                    const aiMessage =
                        await createMessage({
                            projectId,

                            senderEmail:
                                'AI Assistant',

                            content:
                                aiReply,

                            role:
                                'assistant',

                            mentionsAI:
                                false
                        })


                    /*
                    |--------------------------------------------------------------------------
                    | BROADCAST AI MESSAGE
                    |--------------------------------------------------------------------------
                    */

                    io.to(room).emit(
                        'project-message',
                        aiMessage
                    )


                    io.to(room).emit(
                        'ai-status',
                        {
                            status:
                                'idle'
                        }
                    )


                    /*
                    |--------------------------------------------------------------------------
                    | Update project memory
                    |--------------------------------------------------------------------------
                    */

                    createProjectMemory(
                        projectId
                    ).catch(error => {

                        console.error(
                            'Memory update failed:',
                            error.message
                        )
                    })

                } catch (error) {

                    console.error(
                        'Project message error:',
                        error
                    )


                    io.to(
                        `project:${projectId}`
                    ).emit(
                        'ai-status',
                        {
                            status:
                                'idle'
                        }
                    )


                    socket.emit(
                        'project-error',
                        {
                            message:
                                'Failed to process message'
                        }
                    )
                }
            }
        )


        /*
        |--------------------------------------------------------------------------
        | DISCONNECT
        |--------------------------------------------------------------------------
        */

        socket.on(
            'disconnect',

            async reason => {

                console.log(
                    'Socket disconnected:',
                    socket.user.email,
                    '| socket:',
                    socket.id,
                    '| reason:',
                    reason
                )


                if (!socket.projectId) {
                    return
                }


                const projectId =
                    String(socket.projectId)


                try {

                    /*
                     * Remove only this socket.
                     *
                     * Redis service checks whether
                     * another socket for the same
                     * user still exists.
                     */

                    await removeOnlineUser(
                        projectId,
                        socket.user._id,
                        socket.id
                    )


                    const onlineUsers =
                        await getOnlineUsers(
                            projectId
                        )


                    io.to(
                        `project:${projectId}`
                    ).emit(
                        'online-users',
                        onlineUsers
                    )


                    console.log(
                        'Presence updated after disconnect:',
                        socket.user.email,
                        onlineUsers
                    )

                } catch (error) {

                    console.error(
                        'Disconnect presence cleanup error:',
                        error.message
                    )
                }
            }
        )
    }
)


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

if (!process.env.VERCEL) {

    const PORT =
        process.env.PORT || 3000


    server.listen(
        PORT,
        () => {

            console.log(
                `🚀 Server running locally on http://localhost:${PORT}`
            )
        }
    )
}