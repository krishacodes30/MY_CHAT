// import 'dotenv/config';
// import http from 'http';
// import app from './app.js';
// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
// import projectModel from './models/project.model.js';
// // import { generateResult } from './services/ai.service.js';

// const port = process.env.PORT || 3000;



// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*'
//     }
// });


// io.use(async (socket, next) => {

//     try {

//         const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[ 1 ];
//         const projectId = socket.handshake.query.projectId;

//         if (!mongoose.Types.ObjectId.isValid(projectId)) {
//             return next(new Error('Invalid projectId'));
//         }


//         socket.project = await projectModel.findById(projectId);


//         if (!token) {
//             return next(new Error('Authentication error'))
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded) {
//             return next(new Error('Authentication error'))
//         }


//         socket.user = decoded;

//         next();

//     } catch (error) {
//         next(error)
//     }

// })


// io.on('connection', socket => {
//     socket.roomId = socket.project._id.toString()


//     console.log('a user connected');



//     socket.join(socket.roomId);

//     socket.on('project-message', async data => {

//         const message = data.message;

//         const aiIsPresentInMessage = message.includes('@ai');
//         socket.broadcast.to(socket.roomId).emit('project-message', data)

//         if (aiIsPresentInMessage) {


//             const prompt = message.replace('@ai', '');

//             const result = await generateResult(prompt);


//             io.to(socket.roomId).emit('project-message', {
//                 message: result,
//                 sender: {
//                     _id: 'ai',
//                     email: 'AI'
//                 }
//             })


//             return
//         }


//     })

//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//         socket.leave(socket.roomId)
//     });
// });




// server.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })



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

const io =
    new Server(
        server,
        {
            cors: {
                origin:
                    process.env.FRONTEND_URL,

                credentials:
                    true
            }
        }
    )


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


            /*
             * Your existing JWT may use
             * another field.
             *
             * If so, change decoded.email.
             */

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
            socket.user.email
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

                    const project =
                        await projectModel
                            .findOne({
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


                    socket.join(
                        room
                    )


                    socket.projectId =
                        projectId.toString()


                    /*
                     * Redis presence
                     */

                    await addOnlineUser(
                        projectId,

                        socket.user._id
                    )


                    const onlineUsers =
                        await getOnlineUsers(
                            projectId
                        )


                    io.to(room).emit(
                        'online-users',
                        onlineUsers
                    )


                } catch (error) {

                    console.error(
                        'Join project error:',
                        error
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
                     * verify project membership.
                     */

                    const project =
                        await projectModel
                            .findOne({
                                _id:
                                    projectId,

                                users:
                                    socket.user._id
                            })


                    if (!project) {
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
                    | BROADCAST TO EVERYONE
                    |--------------------------------------------------------------------------
                    */

                    io.to(room).emit(
                        'project-message',

                        savedMessage
                    )


                    /*
                    |--------------------------------------------------------------------------
                    | Normal message → done
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
                    | AI + MEMORY + RAG
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
                    | in background.
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

            async () => {

                console.log(
                    'Socket disconnected:',
                    socket.user.email
                )


                if (
                    !socket.projectId
                ) {
                    return
                }


                await removeOnlineUser(
                    socket.projectId,

                    socket.user._id
                )


                const onlineUsers =
                    await getOnlineUsers(
                        socket.projectId
                    )


                io.to(
                    `project:${socket.projectId}`
                ).emit(
                    'online-users',

                    onlineUsers
                )
            }
        )
    }
)


/*
|--------------------------------------------------------------------------
| Start server
|--------------------------------------------------------------------------
*/

const PORT =
    process.env.PORT || 5000


server.listen(
    PORT,

    () => {

        console.log(
            `Server running on port ${PORT}`
        )
    }
)