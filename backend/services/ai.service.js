// import { GoogleGenAI } from '@google/genai'

// import {
//     searchDocuments
// } from './rag.service.js'


// /*
// |--------------------------------------------------------------------------
// | Gemini
// |--------------------------------------------------------------------------
// */

// const ai =
//     new GoogleGenAI({
//         apiKey:
//             process.env.GEMINI_API_KEY
//     })


// const CHAT_MODEL =
//     process.env.GEMINI_MODEL ||
//     'gemini-3.1-flash-lite'


// /*
// |--------------------------------------------------------------------------
// | RAG configuration
// |--------------------------------------------------------------------------
// */

// const MAX_CONTEXT_CHUNKS = 5

// const MAX_CONTEXT_CHARS = 18000


// /*
// |--------------------------------------------------------------------------
// | Generate project AI reply
// |--------------------------------------------------------------------------
// |
// | This is the function your server.js already expects.
// |
// | server.js:
// |
// | generateProjectAIReply({
// |     projectId,
// |     userMessage
// | })
// |
// | It returns ONLY the AI answer string.
// |
// */

// export async function generateProjectAIReply({
//     projectId,
//     userMessage
// }) {

//     if (!projectId) {

//         throw new Error(
//             'projectId is required'
//         )
//     }


//     if (
//         typeof userMessage !== 'string' ||
//         !userMessage.trim()
//     ) {

//         throw new Error(
//             'userMessage is required'
//         )
//     }


//     const question =
//         userMessage.trim()


//     /*
//     |--------------------------------------------------------------------------
//     | 1. Search Qdrant
//     |--------------------------------------------------------------------------
//     */

//     let documents = []

//     try {

//         documents =
//             await searchDocuments({

//                 projectId,

//                 query:
//                     question,

//                 limit:
//                     MAX_CONTEXT_CHUNKS
//             })

//     } catch (error) {

//         console.error(
//             'Qdrant document search failed:',
//             error
//         )

//         /*
//          * Do not silently pretend that RAG worked.
//          *
//          * We continue with an empty context so normal
//          * @AI chat can still work if Qdrant temporarily
//          * has a problem.
//          */

//         documents = []
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | 2. Build RAG context
//     |--------------------------------------------------------------------------
//     */

//     let context = ''

//     const sources = []


//     if (
//         Array.isArray(documents) &&
//         documents.length
//     ) {

//         const contextParts = []


//         for (
//             let index = 0;
//             index < documents.length;
//             index++
//         ) {

//             const point =
//                 documents[index]


//             const payload =
//                 point?.payload || {}


//             const content =
//                 typeof payload.content === 'string'
//                     ? payload.content.trim()
//                     : ''


//             if (!content) {
//                 continue
//             }


//             const fileName =
//                 payload.fileName ||
//                 'Unknown file'


//             const chunkIndex =
//                 payload.chunkIndex ??
//                 'Unknown'


//             contextParts.push(`SOURCE ${index + 1}

// File: ${fileName}

// Chunk: ${chunkIndex}

// Content:
// ${content}`)


//             sources.push({

//                 fileName,

//                 chunkIndex,

//                 score:
//                     point?.score ?? null

//             })
//         }


//         context =
//             contextParts
//                 .join('\n\n---\n\n')
//                 .slice(
//                     0,
//                     MAX_CONTEXT_CHARS
//                 )
//     }


//     /*
//     |--------------------------------------------------------------------------
//     | 3. Build RAG prompt
//     |--------------------------------------------------------------------------
//     */

//     const hasContext =
//         Boolean(context)


//     const prompt = `
// You are the AI assistant inside a collaborative project.

// The user is asking:

// ${question}


// PROJECT DOCUMENT CONTEXT
// ========================

// ${
//     hasContext
//         ? context
//         : 'No relevant project document was retrieved.'
// }


// INSTRUCTIONS
// ============

// 1. Answer the user's question clearly and directly.

// 2. If the project document context is relevant to the
//    question, prioritize that information.

// 3. Never invent facts and claim that they came from the
//    project documents.

// 4. If the project documents do not contain enough information,
//    say that the uploaded project documents do not contain
//    enough information.

// 5. You may use general knowledge when the question is clearly
//    unrelated to the uploaded project documents.

// 6. If you use information from a project document, mention
//    the relevant file name when useful.

// 7. Do not mention vector databases, embeddings, Qdrant,
//    retrieval pipelines, or internal implementation details
//    unless the user specifically asks about them.

// 8. Keep the answer concise but useful.

// 9. This is a collaborative chat, so answer naturally as
//    the project's shared AI assistant.
// `


//     /*
//     |--------------------------------------------------------------------------
//     | 4. Generate answer with Gemini
//     |--------------------------------------------------------------------------
//     */

//     try {

//         const response =
//             await ai.models.generateContent({

//                 model:
//                     CHAT_MODEL,

//                 contents:
//                     prompt
//             })


//         const answer =
//             response?.text?.trim()


//         if (!answer) {

//             throw new Error(
//                 'Gemini returned an empty response'
//             )
//         }


//         return answer

//     } catch (error) {

//         console.error(
//             'Gemini generation failed:',
//             error
//         )

//         throw new Error(
//             'AI response generation failed'
//         )
//     }
// }


// /*
// |--------------------------------------------------------------------------
// | Standalone question function
// |--------------------------------------------------------------------------
// |
// | Useful if another controller/service wants both:
// |
// | answer + sources
// |
// | Your Socket.IO server does NOT use this function.
// |
// */

// export async function answerProjectQuestion({
//     projectId,
//     question
// }) {

//     if (!projectId) {

//         throw new Error(
//             'projectId is required'
//         )
//     }


//     if (
//         typeof question !== 'string' ||
//         !question.trim()
//     ) {

//         throw new Error(
//             'Question is required'
//         )
//     }


//     let documents = []


//     try {

//         documents =
//             await searchDocuments({

//                 projectId,

//                 query:
//                     question.trim(),

//                 limit:
//                     MAX_CONTEXT_CHUNKS
//             })

//     } catch (error) {

//         console.error(
//             'Qdrant search failed:',
//             error
//         )

//         throw new Error(
//             'Unable to search project documents'
//         )
//     }


//     const context =
//         documents
//             .map(
//                 (point, index) => {

//                     const payload =
//                         point?.payload || {}


//                     return `
// SOURCE ${index + 1}

// File:
// ${payload.fileName || 'Unknown'}

// Chunk:
// ${payload.chunkIndex ?? 'Unknown'}

// Content:
// ${payload.content || ''}
// `
//                 }
//             )
//             .join('\n\n')
//             .slice(
//                 0,
//                 MAX_CONTEXT_CHARS
//             )


//     const prompt = `
// You are the AI assistant inside a collaborative project.

// User question:

// ${question}


// Project document context:

// ${
//     context ||
//     'No relevant project documents were found.'
// }


// Rules:

// - Use project documents when relevant.
// - Do not invent information from the documents.
// - If the documents do not contain enough information,
//   clearly say so.
// - General knowledge may be used for questions unrelated
//   to the project documents.
// - Keep the response concise and useful.
// - Mention the source file when appropriate.
// `


//     try {

//         const response =
//             await ai.models.generateContent({

//                 model:
//                     CHAT_MODEL,

//                 contents:
//                     prompt
//             })


//         const answer =
//             response?.text?.trim()


//         if (!answer) {

//             throw new Error(
//                 'Gemini returned an empty response'
//             )
//         }


//         return {

//             answer,

//             sources:
//                 documents.map(
//                     point => {

//                         const payload =
//                             point?.payload || {}


//                         return {

//                             fileName:
//                                 payload.fileName ||
//                                 null,

//                             chunkIndex:
//                                 payload.chunkIndex ??
//                                 null,

//                             score:
//                                 point?.score ??
//                                 null

//                         }
//                     }
//                 )

//         }

//     } catch (error) {

//         console.error(
//             'Gemini question answering failed:',
//             error
//         )

//         throw new Error(
//             'AI response generation failed'
//         )
//     }
// }


// /*
// |--------------------------------------------------------------------------
// | Project memory
// |--------------------------------------------------------------------------
// |
// | Your current server.js calls:
// |
// | createProjectMemory(projectId)
// |
// | after sending the AI response.
// |
// | IMPORTANT:
// |
// | We do NOT need to generate another embedding here.
// |
// | Your PDF knowledge is already stored in Qdrant as:
// |
// |     type: "document"
// |
// | Conversation messages can remain in MongoDB.
// |
// | Keeping this function exported prevents the server from
// | crashing and avoids unnecessary duplicate vector writes.
// |
// | Later, if you want semantic conversation memory, this is
// | the correct place to add it.
// |
// */

// export async function createProjectMemory(
//     projectId
// ) {

//     if (!projectId) {

//         throw new Error(
//             'projectId is required'
//         )
//     }


//     /*
//      * Intentionally lightweight for now.
//      *
//      * Chat messages are already persisted through
//      * createMessage() in server.js.
//      *
//      * PDF RAG is handled by rag.service.js +
//      * vector.service.js.
//      */

//     return {
//         projectId,
//         stored: false
//     }
// }


// /*
// |--------------------------------------------------------------------------
// | Optional compatibility alias
// |--------------------------------------------------------------------------
// |
// | If an older controller imports generateResult,
// | it can still use the same AI service.
// |
// */

// export async function generateResult(
//     question
// ) {

//     if (
//         typeof question !== 'string' ||
//         !question.trim()
//     ) {

//         throw new Error(
//             'Question is required'
//         )
//     }


//     const response =
//         await ai.models.generateContent({

//             model:
//                 CHAT_MODEL,

//             contents:
//                 question.trim()
//         })


//     const answer =
//         response?.text?.trim()


//     if (!answer) {

//         throw new Error(
//             'Gemini returned an empty response'
//         )
//     }


//     return answer
// }

import { GoogleGenAI } from '@google/genai';
import { searchVectors } from './vector.service.js';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const CHAT_MODEL =
    process.env.GEMINI_MODEL ||
    'gemini-3.1-flash-lite';

const MAX_CONTEXT_CHUNKS = 6;
const MAX_CONTEXT_CHARS = 24000;

function buildContext(documents) {
    if (!Array.isArray(documents)) {
        return {
            context: '',
            sources: []
        };
    }

    const parts = [];
    const sources = [];
    let totalChars = 0;

    for (
        let index = 0;
        index < documents.length;
        index++
    ) {
        const point = documents[index];
        const payload = point?.payload || {};

        const content =
            typeof payload.content === 'string'
                ? payload.content.trim()
                : '';

        if (!content) {
            continue;
        }

        if (
            totalChars + content.length >
            MAX_CONTEXT_CHARS
        ) {
            break;
        }

        const fileName =
            payload.fileName ||
            'Unknown file';

        const chunkIndex =
            payload.chunkIndex ??
            'Unknown';

        const pageNumber =
            payload.pageNumber ??
            null;

        const sectionTitle =
            payload.sectionTitle ||
            null;

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
        );

        sources.push({
            fileName,
            chunkIndex,
            pageNumber,
            sectionTitle,
            score: point?.score ?? null
        });

        totalChars += content.length;
    }

    return {
        context: parts.join(
            '\n\n---\n\n'
        ),
        sources
    };
}

function buildPrompt({
    question,
    context
}) {
    const hasContext =
        Boolean(context);

    return `You are the AI assistant inside a collaborative project.

You answer questions from the project team and can use uploaded project documents as private project knowledge.

USER MESSAGE:
${question}

PROJECT DOCUMENT CONTEXT:
${
    hasContext
        ? context
        : 'No relevant project document was found.'
}

RULES:
1. Answer the user's actual question directly.
2. When project document context is relevant, use it as the primary source.
3. Never claim that a fact came from a project document unless it is actually present in the provided context.
4. If the user asks about the uploaded documents and the retrieved context does not contain enough information, clearly say that the available project documents do not contain enough information.
5. For general questions unrelated to project documents, you may answer using your general knowledge.
6. Never invent project-specific facts.
7. If useful, mention the source file name.
8. Do not mention Qdrant, embeddings, vector search, retrieval, prompts, or internal implementation unless the user asks about the technical implementation.
9. Keep responses natural, clear and appropriately detailed.
10. Treat this as a collaborative project chat, not a generic chatbot.`;
}

async function generateAnswer(prompt) {
    const response =
        await ai.models.generateContent({
            model: CHAT_MODEL,
            contents: prompt
        });

    const answer =
        response?.text?.trim();

    if (!answer) {
        throw new Error(
            'Gemini returned an empty response'
        );
    }

    return answer;
}

export async function generateProjectAIReply({
    projectId,
    userMessage
}) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        );
    }

    if (
        typeof userMessage !== 'string' ||
        !userMessage.trim()
    ) {
        throw new Error(
            'userMessage is required'
        );
    }

    const question =
        userMessage.trim();

    let documents;

    try {
        documents =
            await searchVectors({
                projectId,
                query: question,
                type: 'document',
                limit: MAX_CONTEXT_CHUNKS
            });
    } catch (error) {
        console.error(
            'Project document search failed:',
            error
        );

        throw new Error(
            'Unable to search project documents'
        );
    }

    const {
        context
    } = buildContext(documents);

    const prompt =
        buildPrompt({
            question,
            context
        });

    try {
        return await generateAnswer(
            prompt
        );
    } catch (error) {
        console.error(
            'Gemini generation failed:',
            error
        );

        throw new Error(
            'AI response generation failed'
        );
    }
}

export async function answerProjectQuestion({
    projectId,
    question
}) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        );
    }

    if (
        typeof question !== 'string' ||
        !question.trim()
    ) {
        throw new Error(
            'Question is required'
        );
    }

    const documents =
        await searchVectors({
            projectId,
            query: question.trim(),
            type: 'document',
            limit: MAX_CONTEXT_CHUNKS
        });

    const {
        context,
        sources
    } = buildContext(documents);

    const prompt =
        buildPrompt({
            question: question.trim(),
            context
        });

    try {
        const answer =
            await generateAnswer(
                prompt
            );

        return {
            answer,
            sources
        };
    } catch (error) {
        console.error(
            'Project question answering failed:',
            error
        );

        throw new Error(
            'AI response generation failed'
        );
    }
}

export async function createProjectMemory(
    projectId
) {
    if (!projectId) {
        throw new Error(
            'projectId is required'
        );
    }

    return {
        projectId: String(projectId),
        stored: false
    };
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
        );
    }

    try {
        return await generateAnswer(
            question.trim()
        );
    } catch (error) {
        console.error(
            'Gemini generation failed:',
            error
        );

        throw new Error(
            'AI response generation failed'
        );
    }
}