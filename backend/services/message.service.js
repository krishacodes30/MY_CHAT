// import messageModel
//     from '../models/message.model.js'

// import {
//     cacheRecentMessage
// } from './redis.service.js'


// export async function createMessage({
//     projectId,
//     senderId,
//     senderEmail,
//     content,
//     role = 'user',
//     mentionsAI = false
// }) {

//     const message =
//         await messageModel.create({
//             project: projectId,

//             sender: senderId,

//             senderEmail,

//             content,

//             role,

//             mentionsAI
//         })


//     const result =
//         message.toObject()


//     await cacheRecentMessage(
//         projectId,
//         result
//     )


//     return result
// }


// export async function getProjectMessages(
//     projectId
// ) {

//     return messageModel
//         .find({
//             project: projectId
//         })
//         .sort({
//             createdAt: 1
//         })
//         .limit(200)
//         .lean()
// }

import messageModel from '../models/message.model.js'

import {
    cacheRecentMessage,
    getCachedMessages,
    cacheMessages
} from './redis.service.js'

export async function createMessage({
    projectId,
    senderId,
    senderEmail,
    content,
    role = 'user',
    mentionsAI = false
}) {
    const message = await messageModel.create({
        project: projectId,
        sender: senderId,
        senderEmail,
        content,
        role,
        mentionsAI
    })

    const result = message.toObject()

    // Redis is a cache here, not the source of truth.
    // MongoDB write succeeds even if Redis is temporarily unavailable.
    await cacheRecentMessage(
        projectId,
        result
    )

    return result
}

export async function getProjectMessages(
    projectId
) {
    if (!projectId) {
        throw new Error('projectId is required')
    }

    const cachedMessages =
        await getCachedMessages(projectId)

    if (cachedMessages) {
        return cachedMessages
    }

    const messages =
        await messageModel
            .find({
                project: projectId
            })
            .sort({
                createdAt: 1
            })
            .limit(200)
            .lean()

    await cacheMessages(
        projectId,
        messages
    )

    return messages
}
