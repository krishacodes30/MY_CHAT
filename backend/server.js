


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
//     heartbeatOnlineUser,
//     getOnlineUsers
// } from './services/redis.service.js'

// import redisClient
//     from './config/redis.js'

// await connectDB()

// try {
//     await redisClient.ping()
//     console.log('Redis ping successful')
// } catch (error) {
//     console.error(
//         'Redis startup check failed:',
//         error.message
//     )
//     throw error
// }

// await initVectorStore()

// const server =
//     http.createServer(app)

// const io = new Server(server, {
//     cors: {
//         origin:
//             process.env.CLIENT_URL ||
//             'https://my-app-frontend-gpo8.onrender.com',
//         credentials: true
//     },
//     pingInterval: 25000,
//     pingTimeout: 20000
// })

// io.use(
//     async (
//         socket,
//         next
//     ) => {
//         try {
//             const token =
//                 socket.handshake.auth?.token

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
//             console.error(
//                 'Socket authentication error:',
//                 error.message
//             )

//             next(
//                 new Error(
//                     'Invalid authentication token'
//                 )
//             )
//         }
//     }
// )

// io.on(
//     'connection',
//     socket => {
//         console.log(
//             'Socket connected:',
//             socket.user.email,
//             '| socket:',
//             socket.id
//         )

//         socket.on(
//             'join-project',
//             async projectId => {
//                 try {
//                     if (!projectId) {
//                         return
//                     }

//                     if (
//                         socket.projectId &&
//                         String(
//                             socket.projectId
//                         ) !==
//                         String(projectId)
//                     ) {
//                         const oldProjectId =
//                             socket.projectId

//                         await removeOnlineUser(
//                             oldProjectId,
//                             socket.user._id,
//                             socket.id
//                         )

//                         socket.leave(
//                             `project:${oldProjectId}`
//                         )

//                         const oldOnlineUsers =
//                             await getOnlineUsers(
//                                 oldProjectId
//                             )

//                         io.to(
//                             `project:${oldProjectId}`
//                         ).emit(
//                             'online-users',
//                             oldOnlineUsers
//                         )
//                     }

//                     const project =
//                         await projectModel.findOne({
//                             _id:
//                                 projectId,
//                             users:
//                                 socket.user._id
//                         })

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
//                         String(projectId)

//                     await addOnlineUser(
//                         projectId,
//                         socket.user._id,
//                         socket.id
//                     )

//                     const onlineUsers =
//                         await getOnlineUsers(
//                             projectId
//                         )

//                     io.to(room).emit(
//                         'online-users',
//                         onlineUsers
//                     )

//                     console.log(
//                         'Project joined:',
//                         socket.user.email,
//                         '| project:',
//                         projectId,
//                         '| socket:',
//                         socket.id
//                     )
//                 } catch (error) {
//                     console.error(
//                         'Join project error:',
//                         error
//                     )

//                     socket.emit(
//                         'project-error',
//                         {
//                             message:
//                                 'Failed to join project'
//                         }
//                     )
//                 }
//             }
//         )

//         socket.on(
//             'presence-heartbeat',
//             async projectId => {
//                 if (
//                     !socket.projectId ||
//                     String(projectId) !==
//                     String(socket.projectId)
//                 ) {
//                     return
//                 }

//                 await heartbeatOnlineUser(
//                     socket.projectId,
//                     socket.user._id,
//                     socket.id
//                 )
//             }
//         )

//         socket.on(
//             'leave-project',
//             async projectId => {
//                 if (
//                     !socket.projectId ||
//                     String(projectId) !==
//                     String(socket.projectId)
//                 ) {
//                     return
//                 }

//                 try {
//                     const currentProjectId =
//                         String(
//                             socket.projectId
//                         )

//                     await removeOnlineUser(
//                         currentProjectId,
//                         socket.user._id,
//                         socket.id
//                     )

//                     socket.leave(
//                         `project:${currentProjectId}`
//                     )

//                     socket.projectId =
//                         null

//                     const onlineUsers =
//                         await getOnlineUsers(
//                             currentProjectId
//                         )

//                     io.to(
//                         `project:${currentProjectId}`
//                     ).emit(
//                         'online-users',
//                         onlineUsers
//                     )
//                 } catch (error) {
//                     console.error(
//                         'Leave project error:',
//                         error.message
//                     )
//                 }
//             }
//         )

//         socket.on(
//             'project-message',
//             async ({
//                 projectId,
//                 message
//             }) => {
//                 try {
//                     if (!message?.trim()) {
//                         return
//                     }

//                     if (
//                         !socket.projectId ||
//                         String(projectId) !==
//                         String(socket.projectId)
//                     ) {
//                         socket.emit(
//                             'project-error',
//                             {
//                                 message:
//                                     'Join this project before sending messages'
//                             }
//                         )

//                         return
//                     }

//                     const project =
//                         await projectModel.findOne({
//                             _id:
//                                 projectId,
//                             users:
//                                 socket.user._id
//                         })

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

//                     const cleanMessage =
//                         message.trim()

//                     const mentionsAI =
//                         /@ai\b/i.test(
//                             cleanMessage
//                         )

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

//                     io.to(room).emit(
//                         'project-message',
//                         savedMessage
//                     )

//                     if (!mentionsAI) {
//                         return
//                     }

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

//                     io.to(room).emit(
//                         'ai-status',
//                         {
//                             status:
//                                 'thinking'
//                         }
//                     )

//                     const aiReply =
//                         await generateProjectAIReply({
//                             projectId,
//                             userMessage:
//                                 aiQuestion
//                         })

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
//                                 error?.message ||
//                                 'Failed to process message'
//                         }
//                     )
//                 }
//             }
//         )

//         socket.on(
//             'disconnect',
//             async reason => {
//                 console.log(
//                     'Socket disconnected:',
//                     socket.user.email,
//                     '| socket:',
//                     socket.id,
//                     '| reason:',
//                     reason
//                 )

//                 if (!socket.projectId) {
//                     return
//                 }

//                 const projectId =
//                     String(
//                         socket.projectId
//                     )

//                 try {
//                     await removeOnlineUser(
//                         projectId,
//                         socket.user._id,
//                         socket.id
//                     )

//                     const onlineUsers =
//                         await getOnlineUsers(
//                             projectId
//                         )

//                     io.to(
//                         `project:${projectId}`
//                     ).emit(
//                         'online-users',
//                         onlineUsers
//                     )
//                 } catch (error) {
//                     console.error(
//                         'Disconnect presence cleanup error:',
//                         error.message
//                     )
//                 }
//             }
//         )
//     }
// )

// if (!process.env.VERCEL) {
//     const PORT =
//         process.env.PORT || 3000

//     server.listen(
//         PORT,
//         () => {
//             console.log(
//                 `🚀 Server running locally on http://localhost:${PORT}`
//             )
//         }
//     )
// }

import 'dotenv/config'
import http from 'http'
import jwt from 'jsonwebtoken'
import {Server} from 'socket.io'
import app from './app.js'
import connectDB from './db/db.js'
import userModel from './models/user.model.js'
import projectModel from './models/project.model.js'
import {createMessage} from './services/message.service.js'
import {generateProjectAIReply,createProjectMemory} from './services/ai.service.js'
import {initVectorStore,deleteProjectVectors} from './services/vector.service.js'
import {addOnlineUser,removeOnlineUser,heartbeatOnlineUser,getOnlineUsers} from './services/redis.service.js'
import redisClient from './config/redis.js'

await connectDB()

try{
    await redisClient.ping()
    console.log('Redis ping successful')
}catch(error){
    console.error('Redis startup check failed:',error.message)
    throw error
}

await initVectorStore()

const server=http.createServer(app)

const io=new Server(server,{
    cors:{
        origin:
            process.env.CLIENT_URL||
            process.env.FRONTEND_URL||
            'http://localhost:5173',
        credentials:true
    },
    pingInterval:25000,
    pingTimeout:20000
})

app.set('io',io)

const documentLockKey=projectId=>
    `project:document:lock:${projectId}`

const documentOperationKey=projectId=>
    `project:document:operation:${projectId}`

const getDocumentOperation=async projectId=>{
    try{
        const raw=await redisClient.get(
            documentOperationKey(projectId)
        )

        if(!raw){
            return{
                status:'idle',
                fileName:'',
                userId:'',
                socketId:''
            }
        }

        return JSON.parse(raw)
    }catch(error){
        console.error(
            'Document operation read error:',
            error.message
        )

        return{
            status:'idle',
            fileName:'',
            userId:'',
            socketId:''
        }
    }
}

const releaseDocumentLock=async projectId=>{
    try{
        await redisClient.del(
            documentLockKey(projectId)
        )

        await redisClient.del(
            documentOperationKey(projectId)
        )
    }catch(error){
        console.error(
            'Document lock release error:',
            error.message
        )
    }
}

const emitDocumentState=async projectId=>{
    try{
        const project=
            await projectModel.findOne({
                _id:projectId
            }).select('ragDocument')

        if(!project)return

        const operation=
            await getDocumentOperation(projectId)

        io.to(
            `project:${projectId}`
        ).emit(
            'project-document-state',
            {
                projectId:String(projectId),
                document:
                    project.ragDocument||
                    null,
                operation
            }
        )
    }catch(error){
        console.error(
            'Document state emit error:',
            error.message
        )
    }
}

const emitProjectMembers=async projectId=>{
    try{
        const project=
            await projectModel.findById(
                projectId
            )
            .populate(
                'users',
                '_id email'
            )
            .select('users')

        if(!project)return

        io.to(
            `project:${projectId}`
        ).emit(
            'project-members-updated',
            {
                projectId:String(projectId),
                users:project.users||[]
            }
        )
    }catch(error){
        console.error(
            'Project members emit error:',
            error.message
        )
    }
}

io.use(async(socket,next)=>{
    try{
        const token=
            socket.handshake.auth?.token

        if(!token){
            return next(
                new Error(
                    'Authentication required'
                )
            )
        }

        const decoded=
            jwt.verify(
                token,
                process.env.JWT_SECRET
            )

        const user=
            await userModel.findOne({
                email:decoded.email
            })

        if(!user){
            return next(
                new Error(
                    'User not found'
                )
            )
        }

        socket.user=user

        next()
    }catch(error){
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
})

io.on('connection',socket=>{
    console.log(
        'Socket connected:',
        socket.user.email,
        '| socket:',
        socket.id
    )

    socket.on('join-project',async projectId=>{
        try{
            if(!projectId)return

            if(
                socket.projectId&&
                String(socket.projectId)!==
                String(projectId)
            ){
                const oldProjectId=
                    String(socket.projectId)

                await removeOnlineUser(
                    oldProjectId,
                    socket.user._id,
                    socket.id
                )

                socket.leave(
                    `project:${oldProjectId}`
                )

                const oldOnlineUsers=
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

            const project=
                await projectModel.findOne({
                    _id:projectId,
                    users:socket.user._id
                })

            if(!project){
                socket.emit(
                    'project-error',
                    {
                        message:
                            'You are not a member of this project'
                    }
                )

                return
            }

            const room=
                `project:${projectId}`

            socket.join(room)

            socket.projectId=
                String(projectId)

            await addOnlineUser(
                projectId,
                socket.user._id,
                socket.id
            )

            const onlineUsers=
                await getOnlineUsers(
                    projectId
                )

            io.to(room).emit(
                'online-users',
                onlineUsers
            )

            await emitDocumentState(
                projectId
            )

            await emitProjectMembers(
                projectId
            )

            console.log(
                'Project joined:',
                socket.user.email,
                '| project:',
                projectId,
                '| socket:',
                socket.id
            )
        }catch(error){
            console.error(
                'Join project error:',
                error.message
            )
        }
    })

    socket.on(
        'request-project-members',
        async projectId=>{
            try{
                if(
                    !projectId||
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                const project=
                    await projectModel.findOne({
                        _id:projectId,
                        users:socket.user._id
                    })

                if(!project)return

                await emitProjectMembers(
                    projectId
                )
            }catch(error){
                console.error(
                    'Request project members error:',
                    error.message
                )
            }
        }
    )

    socket.on(
        'project-members-updated',
        async data=>{
            try{
                const projectId=
                    data?.projectId

                if(
                    !projectId||
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                const project=
                    await projectModel.findOne({
                        _id:projectId,
                        users:socket.user._id
                    })

                if(!project)return

                await emitProjectMembers(
                    projectId
                )
            }catch(error){
                console.error(
                    'Project members update error:',
                    error.message
                )
            }
        }
    )

    socket.on(
        'request-project-document',
        async projectId=>{
            try{
                if(
                    !projectId||
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                const project=
                    await projectModel.findOne({
                        _id:projectId,
                        users:socket.user._id
                    }).select('ragDocument')

                if(!project)return

                const operation=
                    await getDocumentOperation(
                        projectId
                    )

                socket.emit(
                    'project-document-state',
                    {
                        projectId:String(projectId),
                        document:
                            project.ragDocument||
                            null,
                        operation
                    }
                )
            }catch(error){
                console.error(
                    'Request document error:',
                    error.message
                )
            }
        }
    )

    socket.on(
    'project-document-upload-started',
    async(data,ack)=>{
        const projectId=
            data?.projectId

        try{

            if(
                !projectId||
                !socket.projectId||
                String(projectId)!==
                String(socket.projectId)
            ){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            'Project connection is not ready.'
                    })
                }

                return
            }

            const project=
                await projectModel.findOne({
                    _id:projectId,
                    users:socket.user._id
                })

            if(!project){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            'You are not a member of this project.'
                    })
                }

                return
            }

            const existing=
                await getDocumentOperation(
                    projectId
                )

            if(
                existing.status&&
                existing.status!=='idle'
            ){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            existing.status==='removing'
                                ?'Another collaborator is removing the PDF.'
                                :existing.status==='replacing'
                                    ?'Another collaborator is already replacing the PDF.'
                                    :'Another collaborator is currently processing the PDF.'
                    })
                }

                return
            }

            const replacing=
                data?.status==='replacing'

            /*
             * If this is a normal upload, a PDF must
             * not already exist.
             */

            if(
                !replacing&&
                project.ragDocument
            ){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            `A PDF is already uploaded for this project: ${project.ragDocument.fileName||'Project PDF'}. Use Replace PDF instead.`
                    })
                }

                return
            }

            /*
             * A replacement is only valid when an
             * existing PDF actually exists.
             */

            if(
                replacing&&
                !project.ragDocument
            ){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            'There is no existing PDF to replace. Upload a PDF instead.'
                    })
                }

                return
            }

            const lockKey=
                documentLockKey(projectId)

            const operationKey=
                documentOperationKey(projectId)

            const lockValue=
                `${socket.id}:${String(socket.user._id)}`

            const acquired=
                await redisClient.set(
                    lockKey,
                    lockValue,
                    'NX',
                    'EX',
                    1800
                )

            if(!acquired){

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            'Another collaborator is currently changing the PDF.'
                    })
                }

                return
            }

            const operation={
                status:
                    replacing
                        ?'replacing'
                        :'uploading',

                fileName:
                    data?.fileName||
                    'Project PDF',

                userId:
                    String(
                        socket.user._id
                    ),

                socketId:
                    socket.id
            }

            await redisClient.set(
                operationKey,
                JSON.stringify(operation),
                'EX',
                1800
            )

            /*
             * IMPORTANT:
             *
             * Replacement deletes ALL existing
             * vectors belonging to this project.
             *
             * Since a project is allowed to have
             * exactly one PDF, this is intentional.
             */

            if(replacing){

                console.log(
                    'Replacing project PDF:',
                    projectId,
                    '| old file:',
                    project.ragDocument?.fileName
                )

                try{

                    await deleteProjectVectors(
                        String(projectId)
                    )

                    /*
                     * Clear the old persistent document
                     * before the new PDF is indexed.
                     */

                    project.ragDocument=null

                    await project.save()

                    console.log(
                        'Old project PDF vectors deleted:',
                        projectId
                    )

                }catch(replaceError){

                    console.error(
                        'Project PDF replacement cleanup failed:',
                        replaceError.message
                    )

                    await releaseDocumentLock(
                        projectId
                    )

                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                'Failed to remove the current PDF knowledge before replacement.'
                        })
                    }

                    return
                }
            }

            io.to(
                `project:${projectId}`
            ).emit(
                'project-document-upload-started',
                {
                    projectId:
                        String(projectId),

                    fileName:
                        operation.fileName,

                    status:
                        operation.status,

                    userId:
                        operation.userId
                }
            )

            if(typeof ack==='function'){
                ack({
                    ok:true
                })
            }

        }catch(error){

            console.error(
                'Project document upload-start error:',
                error.message
            )

            if(projectId){
                await releaseDocumentLock(
                    projectId
                )
            }

            if(typeof ack==='function'){
                ack({
                    ok:false,
                    message:
                        error.message||
                        'Failed to start PDF operation.'
                })
            }
        }
    }
)

  socket.on(
    'project-document-updated',
    async data=>{
        try{
            const projectId=
                data?.projectId

            if(
                !projectId||
                !socket.projectId||
                String(projectId)!==
                String(socket.projectId)
            ){
                return
            }

            const project=
                await projectModel.findOne({
                    _id:projectId,
                    users:socket.user._id
                })

            if(!project)return

            const documentInfo=
                data?.document

            if(
                !documentInfo||
                !documentInfo.fileName
            ){
                await releaseDocumentLock(
                    projectId
                )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'project-document-operation-failed',
                    {
                        projectId:
                            String(projectId),
                        message:
                            'Uploaded PDF information is missing.'
                    }
                )

                return
            }

            /*
             * IMPORTANT:
             *
             * Save the final PDF information in MongoDB.
             *
             * MongoDB is the persistent source of truth.
             * Qdrant stores the actual document vectors.
             * Socket.IO synchronizes the UI.
             */

            project.ragDocument={
                docId:
                    documentInfo.docId||
                    null,

                fileName:
                    documentInfo.fileName,

                pages:
                    Number(
                        documentInfo.pages
                    )||0,

                chunks:
                    Number(
                        documentInfo.chunks
                    )||0,

                vectors:
                    Number(
                        documentInfo.vectors
                    )||0,

                visualPages:
                    Number(
                        documentInfo.visualPages
                    )||0,

                uploadedBy:
                    String(
                        socket.user._id
                    ),

                uploadedAt:
                    new Date()
            }

            await project.save()

            console.log(
                'Project PDF state saved:',
                projectId,
                '| file:',
                project.ragDocument.fileName,
                '| by:',
                socket.user.email
            )

            /*
             * Release the Redis operation lock
             * only AFTER MongoDB has successfully
             * stored the document.
             */

           await releaseDocumentLock(
    projectId
)

io.to(
    `project:${projectId}`
).emit(
    'project-document-updated',
    {
        projectId:
            String(projectId),

        document:
            project.ragDocument,

        message:
            data?.message||
            `${project.ragDocument.fileName} indexed successfully`
    }
)

await emitDocumentState(
    projectId
)

        }catch(error){
            console.error(
                'Project document update error:',
                error.message
            )

            if(data?.projectId){

                await releaseDocumentLock(
                    data.projectId
                )

                io.to(
                    `project:${data.projectId}`
                ).emit(
                    'project-document-operation-failed',
                    {
                        projectId:
                            String(
                                data.projectId
                            ),
                        message:
                            'Failed to save project PDF state.'
                    }
                )
            }
        }
    }
)

    socket.on(
        'project-document-operation-failed',
        async data=>{
            try{
                const projectId=
                    data?.projectId

                if(!projectId)return

                const operation=
                    await getDocumentOperation(
                        projectId
                    )

                if(
                    operation.socketId===
                    socket.id
                ){
                    await releaseDocumentLock(
                        projectId
                    )
                }

                io.to(
                    `project:${projectId}`
                ).emit(
                    'project-document-operation-failed',
                    {
                        projectId:
                            String(projectId),
                        message:
                            data?.message||
                            'PDF operation failed.'
                    }
                )
            }catch(error){
                console.error(
                    'PDF operation failure error:',
                    error.message
                )
            }
        }
    )

    socket.on(
        'project-document-remove',
        async(data,ack)=>{
            const projectId=
                data?.projectId

            try{
                if(
                    !projectId||
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                'Project connection is not ready.'
                        })
                    }

                    return
                }

                const project=
                    await projectModel.findOne({
                        _id:projectId,
                        users:socket.user._id
                    }).select('ragDocument')

                if(!project){
                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                'You are not a member of this project.'
                        })
                    }

                    return
                }

                if(!project.ragDocument){
                    await releaseDocumentLock(
                        projectId
                    )

                    io.to(
                        `project:${projectId}`
                    ).emit(
                        'project-document-removed',
                        {
                            projectId:
                                String(projectId),
                            document:null,
                            message:
                                'No PDF is currently uploaded.'
                        }
                    )

                    if(typeof ack==='function'){
                        ack({
                            ok:true
                        })
                    }

                    return
                }

                const existing=
                    await getDocumentOperation(
                        projectId
                    )

                if(
                    existing.status&&
                    existing.status!=='idle'
                ){
                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                existing.status==='removing'
                                    ?'The PDF is already being removed.'
                                    :'Another collaborator is currently processing the PDF.'
                        })
                    }

                    return
                }

                const lockKey=
                    documentLockKey(projectId)

                const operationKey=
                    documentOperationKey(projectId)

                const lockValue=
                    `${socket.id}:${String(socket.user._id)}`

                // const acquired=
                   const acquired=
    await redisClient.set(
        lockKey,
        lockValue,
        'NX',
        'EX',
        1800
    )

                if(!acquired){
                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                'Another collaborator is currently changing the PDF.'
                        })
                    }

                    return
                }

                const fileName=
                    project.ragDocument.fileName||
                    project.ragDocument.filename||
                    'Project PDF'

                const operation={
                    status:'removing',
                    fileName,
                    userId:
                        String(socket.user._id),
                    socketId:
                        socket.id
                }

                await redisClient.set(
                    operationKey,
                    JSON.stringify(operation),
                    {
                        EX:1800
                    }
                )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'project-document-remove-started',
                    {
                        projectId:
                            String(projectId),
                        fileName,
                        status:'removing',
                        userId:
                            String(socket.user._id)
                    }
                )

                try{
                    await deleteProjectVectors(
                        String(projectId)
                    )
                }catch(vectorError){
                    console.error(
                        'Qdrant PDF deletion error:',
                        vectorError.message
                    )

                    await releaseDocumentLock(
                        projectId
                    )

                    io.to(
                        `project:${projectId}`
                    ).emit(
                        'project-document-operation-failed',
                        {
                            projectId:
                                String(projectId),
                            message:
                                'Failed to remove PDF knowledge.'
                        }
                    )

                    if(typeof ack==='function'){
                        ack({
                            ok:false,
                            message:
                                'Failed to remove PDF knowledge.'
                        })
                    }

                    return
                }

                project.ragDocument=null

                await project.save()

                await releaseDocumentLock(
                    projectId
                )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'project-document-removed',
                    {
                        projectId:
                            String(projectId),
                        document:null,
                        message:
                            'PDF removed from project knowledge.'
                    }
                )

                if(typeof ack==='function'){
                    ack({
                        ok:true
                    })
                }

                console.log(
                    'Project PDF removed:',
                    projectId,
                    '| by:',
                    socket.user.email
                )
            }catch(error){
                console.error(
                    'Project document remove error:',
                    error.message
                )

                if(projectId){
                    await releaseDocumentLock(
                        projectId
                    )

                    io.to(
                        `project:${projectId}`
                    ).emit(
                        'project-document-operation-failed',
                        {
                            projectId:
                                String(projectId),
                            message:
                                'Failed to remove the PDF.'
                        }
                    )
                }

                if(typeof ack==='function'){
                    ack({
                        ok:false,
                        message:
                            'Failed to remove the PDF.'
                    })
                }
            }
        }
    )

    socket.on(
        'presence-heartbeat',
        async projectId=>{
            try{
                if(
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                await heartbeatOnlineUser(
                    projectId,
                    socket.user._id,
                    socket.id
                )

                const onlineUsers=
                    await getOnlineUsers(
                        projectId
                    )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'online-users',
                    onlineUsers
                )
            }catch(error){
                console.error(
                    'Presence heartbeat error:',
                    error.message
                )
            }
        }
    )

    socket.on(
        'project-message',
        async({
            projectId,
            message
        })=>{
            try{
                if(!message?.trim())return

                if(
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                const project=
                    await projectModel.findOne({
                        _id:projectId,
                        users:socket.user._id
                    })

                if(!project)return

                const cleanMessage=
                    message.trim()

                const mentionsAI=
                    /@ai\b/i.test(
                        cleanMessage
                    )

                const savedMessage=
                    await createMessage({
                        projectId,
                        senderId:
                            socket.user._id,
                        senderEmail:
                            socket.user.email,
                        content:
                            cleanMessage,
                        role:'user',
                        mentionsAI
                    })

                const room=
                    `project:${projectId}`

                io.to(room).emit(
                    'project-message',
                    savedMessage
                )

                if(!mentionsAI)return

                const aiQuestion=
                    cleanMessage
                        .replace(
                            /@ai\b/i,
                            ''
                        )
                        .trim()

                if(!aiQuestion)return

                io.to(room).emit(
                    'ai-status',
                    {
                        status:'thinking'
                    }
                )

                const aiReply=
                    await generateProjectAIReply({
                        projectId,
                        userMessage:
                            aiQuestion
                    })

                const aiMessage=
                    await createMessage({
                        projectId,
                        senderEmail:
                            'AI Assistant',
                        content:
                            aiReply,
                        role:'assistant',
                        mentionsAI:false
                    })

                io.to(room).emit(
                    'project-message',
                    aiMessage
                )

                io.to(room).emit(
                    'ai-status',
                    {
                        status:'idle'
                    }
                )

                createProjectMemory(
                    projectId
                ).catch(error=>{
                    console.error(
                        'Memory update failed:',
                        error.message
                    )
                })
            }catch(error){
                console.error(
                    'Project message error:',
                    error.message
                )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'ai-status',
                    {
                        status:'idle'
                    }
                )

                socket.emit(
                    'project-error',
                    {
                        message:
                            error?.message||
                            'Failed to process message.'
                    }
                )
            }
        }
    )

    socket.on(
        'leave-project',
        async projectId=>{
            try{
                if(
                    !socket.projectId||
                    String(projectId)!==
                    String(socket.projectId)
                ){
                    return
                }

                const currentProjectId=
                    String(socket.projectId)

                await removeOnlineUser(
                    currentProjectId,
                    socket.user._id,
                    socket.id
                )

                socket.leave(
                    `project:${currentProjectId}`
                )

                socket.projectId=null

                const onlineUsers=
                    await getOnlineUsers(
                        currentProjectId
                    )

                io.to(
                    `project:${currentProjectId}`
                ).emit(
                    'online-users',
                    onlineUsers
                )
            }catch(error){
                console.error(
                    'Leave project error:',
                    error.message
                )
            }
        }
    )

    socket.on(
        'disconnect',
        async reason=>{
            console.log(
                'Socket disconnected:',
                socket.user.email,
                '| socket:',
                socket.id,
                '| reason:',
                reason
            )

            if(!socket.projectId)return

            const projectId=
                String(socket.projectId)

            try{
                const operation=
                    await getDocumentOperation(
                        projectId
                    )

                if(
                    operation.socketId===
                    socket.id
                ){
                    await releaseDocumentLock(
                        projectId
                    )

                    await emitDocumentState(
                        projectId
                    )
                }

                await removeOnlineUser(
                    projectId,
                    socket.user._id,
                    socket.id
                )

                const onlineUsers=
                    await getOnlineUsers(
                        projectId
                    )

                io.to(
                    `project:${projectId}`
                ).emit(
                    'online-users',
                    onlineUsers
                )
            }catch(error){
                console.error(
                    'Disconnect cleanup error:',
                    error.message
                )
            }
        }
    )
})

if(!process.env.VERCEL){
    const PORT=
        process.env.PORT||3000

    server.listen(
        PORT,
        ()=>{
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            )
        }
    )
}