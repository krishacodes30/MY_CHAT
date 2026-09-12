
// import { GoogleGenAI } from '@google/genai';
// import { searchVectors } from './vector.service.js';

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });

// const CHAT_MODEL =
//     process.env.GEMINI_MODEL ||
//     'gemini-3.1-flash-lite';

// const MAX_CONTEXT_CHUNKS = 6;
// const MAX_CONTEXT_CHARS = 24000;

// function buildContext(documents) {
//     if (!Array.isArray(documents)) {
//         return {
//             context: '',
//             sources: []
//         };
//     }

//     const parts = [];
//     const sources = [];
//     let totalChars = 0;

//     for (
//         let index = 0;
//         index < documents.length;
//         index++
//     ) {
//         const point = documents[index];
//         const payload = point?.payload || {};

//         const content =
//             typeof payload.content === 'string'
//                 ? payload.content.trim()
//                 : '';

//         if (!content) {
//             continue;
//         }

//         if (
//             totalChars + content.length >
//             MAX_CONTEXT_CHARS
//         ) {
//             break;
//         }

//         const fileName =
//             payload.fileName ||
//             'Unknown file';

//         const chunkIndex =
//             payload.chunkIndex ??
//             'Unknown';

//         const pageNumber =
//             payload.pageNumber ??
//             null;

//         const sectionTitle =
//             payload.sectionTitle ||
//             null;

//         parts.push(
//             [
//                 `SOURCE ${parts.length + 1}`,
//                 `File: ${fileName}`,
//                 `Chunk: ${chunkIndex}`,
//                 pageNumber !== null
//                     ? `Page: ${pageNumber}`
//                     : null,
//                 sectionTitle
//                     ? `Section: ${sectionTitle}`
//                     : null,
//                 `Content:\n${content}`
//             ]
//                 .filter(Boolean)
//                 .join('\n')
//         );

//         sources.push({
//             fileName,
//             chunkIndex,
//             pageNumber,
//             sectionTitle,
//             score: point?.score ?? null
//         });

//         totalChars += content.length;
//     }

//     return {
//         context: parts.join(
//             '\n\n---\n\n'
//         ),
//         sources
//     };
// }

// function buildPrompt({
//     question,
//     context
// }) {
//     const hasContext =
//         Boolean(context);

//     return `You are the AI assistant inside a collaborative project.

// You answer questions from the project team and can use uploaded project documents as private project knowledge.

// USER MESSAGE:
// ${question}

// PROJECT DOCUMENT CONTEXT:
// ${
//     hasContext
//         ? context
//         : 'No relevant project document was found.'
// }

// RULES:
// 1. Answer the user's actual question directly.
// 2. When project document context is relevant, use it as the primary source.
// 3. Never claim that a fact came from a project document unless it is actually present in the provided context.
// 4. If the user asks about the uploaded documents and the retrieved context does not contain enough information, clearly say that the available project documents do not contain enough information.
// 5. For general questions unrelated to project documents, you may answer using your general knowledge.
// 6. Never invent project-specific facts.
// 7. If useful, mention the source file name.
// 8. Do not mention Qdrant, embeddings, vector search, retrieval, prompts, or internal implementation unless the user asks about the technical implementation.
// 9. Keep responses natural, clear and appropriately detailed.
// 10. Treat this as a collaborative project chat, not a generic chatbot.`;
// }

// async function generateAnswer(prompt) {
//     const response =
//         await ai.models.generateContent({
//             model: CHAT_MODEL,
//             contents: prompt
//         });

//     const answer =
//         response?.text?.trim();

//     if (!answer) {
//         throw new Error(
//             'Gemini returned an empty response'
//         );
//     }

//     return answer;
// }

// export async function generateProjectAIReply({
//     projectId,
//     userMessage
// }) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required'
//         );
//     }

//     if (
//         typeof userMessage !== 'string' ||
//         !userMessage.trim()
//     ) {
//         throw new Error(
//             'userMessage is required'
//         );
//     }

//     const question =
//         userMessage.trim();

//     let documents;

//     try {
//         documents =
//             await searchVectors({
//                 projectId,
//                 query: question,
//                 type: 'document',
//                 limit: MAX_CONTEXT_CHUNKS
//             });
//     } catch (error) {
//         console.error(
//             'Project document search failed:',
//             error
//         );

//         throw new Error(
//             'Unable to search project documents'
//         );
//     }

//     const {
//         context
//     } = buildContext(documents);

//     const prompt =
//         buildPrompt({
//             question,
//             context
//         });

//     try {
//         return await generateAnswer(
//             prompt
//         );
//     } catch (error) {
//         console.error(
//             'Gemini generation failed:',
//             error
//         );

//         throw new Error(
//             'AI response generation failed'
//         );
//     }
// }

// export async function answerProjectQuestion({
//     projectId,
//     question
// }) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required'
//         );
//     }

//     if (
//         typeof question !== 'string' ||
//         !question.trim()
//     ) {
//         throw new Error(
//             'Question is required'
//         );
//     }

//     const documents =
//         await searchVectors({
//             projectId,
//             query: question.trim(),
//             type: 'document',
//             limit: MAX_CONTEXT_CHUNKS
//         });

//     const {
//         context,
//         sources
//     } = buildContext(documents);

//     const prompt =
//         buildPrompt({
//             question: question.trim(),
//             context
//         });

//     try {
//         const answer =
//             await generateAnswer(
//                 prompt
//             );

//         return {
//             answer,
//             sources
//         };
//     } catch (error) {
//         console.error(
//             'Project question answering failed:',
//             error
//         );

//         throw new Error(
//             'AI response generation failed'
//         );
//     }
// }

// export async function createProjectMemory(
//     projectId
// ) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required'
//         );
//     }

//     return {
//         projectId: String(projectId),
//         stored: false
//     };
// }

// export async function generateResult(
//     question
// ) {
//     if (
//         typeof question !== 'string' ||
//         !question.trim()
//     ) {
//         throw new Error(
//             'Question is required'
//         );
//     }

//     try {
//         return await generateAnswer(
//             question.trim()
//         );
//     } catch (error) {
//         console.error(
//             'Gemini generation failed:',
//             error
//         );

//         throw new Error(
//             'AI response generation failed'
//         );
//     }
// }


import { GoogleGenAI } from '@google/genai'

import { searchVectors } from './vector.service.js'
import { getProjectMessages } from './message.service.js'

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

const CHAT_MODEL =
    process.env.GEMINI_MODEL ||
    'gemini-3.1-flash-lite'

const MAX_CONTEXT_CHUNKS = 6
const MAX_CONTEXT_CHARS = 24000
const MAX_RECENT_MESSAGES = 10

function buildConversation(messages) {
    if (!Array.isArray(messages) || !messages.length) {
        return ''
    }

    return messages
        .slice(-MAX_RECENT_MESSAGES)
        .map(message => {
            const role =
                message?.role === 'assistant'
                    ? 'AI Assistant'
                    : message?.senderEmail || 'Project member'

            const content =
                typeof message?.content === 'string'
                    ? message.content.trim()
                    : ''

            return content
                ? `${role}: ${content}`
                : ''
        })
        .filter(Boolean)
        .join('\n')
}

function buildContext(documents) {
    if (!Array.isArray(documents)) {
        return {
            context: '',
            sources: []
        }
    }

    const parts = []
    const sources = []
    let totalChars = 0

    for (
        let index = 0;
        index < documents.length;
        index++
    ) {
        const point = documents[index]
        const payload = point?.payload || {}

        const content =
            typeof payload.content === 'string'
                ? payload.content.trim()
                : ''

        if (!content) {
            continue
        }

        if (
            totalChars + content.length >
            MAX_CONTEXT_CHARS
        ) {
            break
        }

        const fileName =
            payload.fileName ||
            'Unknown file'

        const chunkIndex =
            payload.chunkIndex ??
            'Unknown'

        const pageNumber =
            payload.pageNumber ??
            null

        const sectionTitle =
            payload.sectionTitle ||
            null

        parts.push(
            [
                `SOURCE ${parts.length + 1}`,
                `File: ${fileName}`,
                `Chunk: ${chunkIndex}`,
                pageNumber !== null
                    ? `Page: ${pageNumber}`
                    : null,
                sectionTitle
                    ? `Section: ${sectionTitle}`
                    : null,
                `Content:\n${content}`
            ]
                .filter(Boolean)
                .join('\n')
        )

        sources.push({
            fileName,
            chunkIndex,
            pageNumber,
            sectionTitle,
            score: point?.score ?? null
        })

        totalChars += content.length
    }

    return {
        context: parts.join(
            '\n\n---\n\n'
        ),
        sources
    }
}

function buildPrompt({
    question,
    context,
    conversation
}) {
    const hasContext =
        Boolean(context)

    return `You are the AI assistant inside a collaborative project.

You answer questions from the project team and can use uploaded project documents as private project knowledge.

USER MESSAGE:
${question}

RECENT PROJECT CONVERSATION:
${
    conversation ||
    'No recent project conversation is available.'
}

PROJECT DOCUMENT CONTEXT:
${
    hasContext
        ? context
        : 'No relevant project document was found.'
}

RULES:
1. Answer the user's actual question directly.
2. When project document context is relevant, use it as the primary source.
3. Use recent conversation only to understand references and continuity; do not treat it as a project document.
4. Never claim that a fact came from a project document unless it is actually present in the provided context.
5. If the user asks about uploaded documents and the retrieved context does not contain enough information, clearly say that the available project documents do not contain enough information.
6. For general questions unrelated to project documents, you may answer using general knowledge.
7. Never invent project-specific facts.
8. If useful, mention the source file name.
9. Do not mention Qdrant, embeddings, vector search, retrieval, prompts, or internal implementation unless the user asks about the technical implementation.
10. Keep responses natural, clear and appropriately detailed.
11. Treat this as a collaborative project chat, not a generic chatbot.`
}

async function generateAnswer(prompt) {
    const response =
        await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: prompt
        })

    const answer =
        response?.text?.trim()

    if (!answer) {
        throw new Error(
            'Gemini returned an empty response'
        )
    }

    return answer
}

async function retrieveProjectContext(
    projectId,
    question
) {
    try {
        return await searchVectors({
            projectId,
            query: question,
            type: 'document',
            limit: MAX_CONTEXT_CHUNKS
        })
    } catch (error) {
        console.error(
            'Project document search failed:',
            error
        )

        throw new Error(
            'Unable to search project documents'
        )
    }
}

export async function generateProjectAIReply({
    projectId,
    userMessage
}) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        )
    }

    if (
        typeof userMessage !== 'string' ||
        !userMessage.trim()
    ) {
        throw new Error(
            'userMessage is required'
        )
    }

    const question =
        userMessage.trim()

    const [
        documents,
        recentMessages
    ] = await Promise.all([
        retrieveProjectContext(
            projectId,
            question
        ),
        getProjectMessages(
            projectId
        )
    ])

    const {
        context
    } = buildContext(
        documents
    )

    const conversation =
        buildConversation(
            recentMessages
        )

    const prompt =
        buildPrompt({
            question,
            context,
            conversation
        })

    try {
        return await generateAnswer(
            prompt
        )
    } catch (error) {
        console.error(
            'Gemini generation failed:',
            error
        )

        throw new Error(
            'AI response generation failed'
        )
    }
}

export async function answerProjectQuestion({
    projectId,
    question
}) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        )
    }

    if (
        typeof question !== 'string' ||
        !question.trim()
    ) {
        throw new Error(
            'Question is required'
        )
    }

    const cleanQuestion =
        question.trim()

    const [
        documents,
        recentMessages
    ] = await Promise.all([
        retrieveProjectContext(
            projectId,
            cleanQuestion
        ),
        getProjectMessages(
            projectId
        )
    ])

    const {
        context,
        sources
    } = buildContext(
        documents
    )

    const conversation =
        buildConversation(
            recentMessages
        )

    const prompt =
        buildPrompt({
            question: cleanQuestion,
            context,
            conversation
        })

    try {
        const answer =
            await generateAnswer(
                prompt
            )

        return {
            answer,
            sources
        }
    } catch (error) {
        console.error(
            'Project question answering failed:',
            error
        )

        throw new Error(
            'AI response generation failed'
        )
    }
}

export async function createProjectMemory(
    projectId
) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        )
    }

    return {
        projectId: String(projectId),
        stored: false
    }
}

export async function generateResult(
    question
) {
    if (
        typeof question !== 'string' ||
        !question.trim()
    ) {
        throw new Error(
            'Question is required'
        )
    }

    try {
        return await generateAnswer(
            question.trim()
        )
    } catch (error) {
        console.error(
            'Gemini generation failed:',
            error
        )

        throw new Error(
            'AI response generation failed'
        )
    }
}
