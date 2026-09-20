// import { GoogleGenAI } from '@google/genai'
// import { QdrantClient } from '@qdrant/js-client-rest'
// import crypto from 'crypto'

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// const qdrant = new QdrantClient({
//   url: process.env.QDRANT_URL,
//   apiKey: process.env.QDRANT_API_KEY
// })

// const COLLECTION = process.env.QDRANT_COLLECTION || 'project_vectors'
// const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001'
// const DIMENSIONS = 768

// export async function initVectorStore() {
//   try {
//     const exists = await qdrant.collectionExists(COLLECTION)
//     if (!exists) {
//       await qdrant.createCollection(COLLECTION, {
//         vectors: { size: DIMENSIONS, distance: 'Cosine' }
//       })
//       console.log(`Qdrant collection created: ${COLLECTION}`)
//     }

//     try {
//       await qdrant.createPayloadIndex(COLLECTION, { field_name: 'projectId', field_schema: 'keyword' })
//     } catch (error) {
//       console.log('projectId index already exists')
//     }

//     try {
//       await qdrant.createPayloadIndex(COLLECTION, { field_name: 'type', field_schema: 'keyword' })
//     } catch (error) {
//       console.log('type index already exists')
//     }

//     console.log(`Qdrant ready: ${COLLECTION}`)
//   } catch (error) {
//     console.error('Qdrant initialization failed:', error)
//     throw error
//   }
// }

// export async function createEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT') {
//   if (typeof text !== 'string' || !text.trim()) {
//     throw new Error('Text is required for embedding')
//   }

//   try {
//     const response = await ai.models.embedContent({
//       model: EMBEDDING_MODEL,
//       contents: text.trim(),
//       config: { taskType, outputDimensionality: DIMENSIONS }
//     })

//     const embedding = response?.embeddings?.[0]?.values

//     if (!Array.isArray(embedding) || embedding.length === 0) {
//       console.error('Invalid embedding response:', response)
//       throw new Error('Gemini returned an invalid embedding')
//     }

//     if (embedding.length !== DIMENSIONS) {
//       throw new Error(`Embedding dimension mismatch. Expected ${DIMENSIONS}, received ${embedding.length}`)
//     }

//     return embedding
//   } catch (error) {
//     console.error('Gemini embedding failed:', error)
//     throw error
//   }
// }

// export async function createEmbeddings(texts, taskType = 'RETRIEVAL_DOCUMENT') {
//   if (!Array.isArray(texts) || texts.length === 0) return []

//   const embeddings = []
//   for (let index = 0; index < texts.length; index++) {
//     const text = texts[index]
//     if (typeof text !== 'string' || !text.trim()) {
//       throw new Error(`Invalid text at chunk ${index + 1}`)
//     }
//     console.log(`Creating embedding ${index + 1}/${texts.length}`)
//     const embedding = await createEmbedding(text, taskType)
//     embeddings.push(embedding)
//   }
//   return embeddings
// }

// export async function storeVectors(points) {
//   if (!Array.isArray(points) || points.length === 0) return []

//   for (let index = 0; index < points.length; index++) {
//     const point = points[index]
//     if (!point?.projectId) {
//       throw new Error(`projectId is required for point ${index + 1}`)
//     }
//     if (typeof point.content !== 'string' || !point.content.trim()) {
//       throw new Error(`content is required for point ${index + 1}`)
//     }
//   }

//   const embeddings = await createEmbeddings(points.map(point => point.content), 'RETRIEVAL_DOCUMENT')

//   if (embeddings.length !== points.length) {
//     throw new Error(`Embedding count mismatch. Expected ${points.length}, received ${embeddings.length}`)
//   }

//   const qdrantPoints = points.map((point, index) => ({
//     id: point.id || crypto.randomUUID(),
//     vector: embeddings[index],
//     payload: {
//       projectId: String(point.projectId),
//       type: point.type || 'document',
//       content: point.content,
//       ...(point.fileName && { fileName: point.fileName }),
//       ...(point.chunkIndex !== undefined && { chunkIndex: point.chunkIndex })
//     }
//   }))

//   await qdrant.upsert(COLLECTION, { wait: true, points: qdrantPoints })
//   console.log(`Stored ${qdrantPoints.length} vectors in Qdrant`)
//   return qdrantPoints
// }

// export async function searchVectors({ projectId, query, type = 'document', limit = 5 }) {
//   if (!projectId) throw new Error('projectId is required for vector search')
//   if (typeof query !== 'string' || !query.trim()) return []

//   const queryVector = await createEmbedding(query.trim(), 'RETRIEVAL_QUERY')
//   const must = [{ key: 'projectId', match: { value: String(projectId) } }]

//   if (type) {
//     must.push({ key: 'type', match: { value: type } })
//   }

//   const result = await qdrant.query(COLLECTION, {
//     query: queryVector,
//     filter: { must },
//     limit: Number(limit) || 5,
//     with_payload: true,
//     with_vector: false
//   })

//   return result?.points || []
// }

// export async function deleteProjectVectors(projectId) {
//   if (!projectId) throw new Error('projectId is required')

//   await qdrant.delete(COLLECTION, {
//     wait: true,
//     filter: {
//       must: [{ key: 'projectId', match: { value: String(projectId) } }]
//     }
//   })

//   console.log(`Deleted vectors for project ${projectId}`)
// }


// import crypto from 'crypto';
// import { GoogleGenAI } from '@google/genai';
// import { QdrantClient } from '@qdrant/js-client-rest';

// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// });

// const qdrant = new QdrantClient({
//     url: process.env.QDRANT_URL || 'http://localhost:6333',
//     apiKey: process.env.QDRANT_API_KEY
// });

// const COLLECTION = process.env.QDRANT_COLLECTION || 'project_vectors';
// const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-2';
// const DIMENSIONS = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 3072||768);
// const MAX_SEARCH_LIMIT = 50;
// const UPSERT_BATCH_SIZE = 50;

// let initialized = false;
// let initializationPromise = null;

// export async function initVectorStore() {
//     if (initialized) return;

//     if (initializationPromise) {
//         return initializationPromise;
//     }

//     initializationPromise = initialize();

//     try {
//         await initializationPromise;
//         initialized = true;
//     } finally {
//         initializationPromise = null;
//     }
// }

// async function initialize() {
//     if (!process.env.GEMINI_API_KEY) {
//         throw new Error('GEMINI_API_KEY is missing');
//     }

//     if (!process.env.QDRANT_URL) {
//         throw new Error('QDRANT_URL is missing');
//     }

//     const exists = await qdrant.collectionExists(COLLECTION);

//     if (!exists) {
//         await qdrant.createCollection(COLLECTION, {
//             vectors: {
//                 size: DIMENSIONS,
//                 distance: 'Cosine'
//             }
//         });

//         console.log(`Qdrant collection created: ${COLLECTION}`);
//     }

//     const indexes = [
//         'projectId',
//         'type',
//         'docId',
//         'fileName',
//         'contentType',
//         'parentId'
//     ];

//     for (const field of indexes) {
//         await createPayloadIndex(field);
//     }

//     console.log(
//         `Qdrant ready: ${COLLECTION} | ${EMBEDDING_MODEL} | ${DIMENSIONS}D`
//     );
// }

// async function createPayloadIndex(fieldName) {
//     try {
//         await qdrant.createPayloadIndex(COLLECTION, {
//             field_name: fieldName,
//             field_schema: 'keyword'
//         });
//     } catch (error) {
//         const message = error?.message || '';

//         if (
//             !message.includes('already exists') &&
//             !message.includes('already indexed') &&
//             !message.includes('Index already exists')
//         ) {
//             console.error(
//                 `Qdrant index error for ${fieldName}:`,
//                 message
//             );
//             throw error;
//         }
//     }
// }

// async function ensureReady() {
//     await initVectorStore();
// }

// function validateEmbedding(embedding) {
//     if (!Array.isArray(embedding) || !embedding.length) {
//         throw new Error('Gemini returned an invalid embedding');
//     }

//     if (embedding.length !== DIMENSIONS) {
//         throw new Error(
//             `Embedding dimension mismatch. Expected ${DIMENSIONS}, received ${embedding.length}`
//         );
//     }

//     return embedding;
// }

// function addRetrievalInstruction(text, type) {
//     if (EMBEDDING_MODEL !== 'gemini-embedding-2') {
//         return text;
//     }

//     if (type === 'query') {
//         return `task: retrieval query | query: ${text}`;
//     }

//     return `task: retrieval document | document: ${text}`;
// }

// export async function createEmbedding(text, mode = 'document') {
//     if (typeof text !== 'string' || !text.trim()) {
//         throw new Error('Text is required for embedding');
//     }

//     await ensureReady();

//     const cleanText = text.trim();

//     const embeddingText =
//         addRetrievalInstruction(
//             cleanText,
//             mode === 'query' ? 'query' : 'document'
//         );

//     try {
//         const response = await ai.models.embedContent({
//             model: EMBEDDING_MODEL,
//             contents: embeddingText,
//             config: {
//                 outputDimensionality: DIMENSIONS
//             }
//         });

//         const embedding =
//             response?.embeddings?.[0]?.values;

//         return validateEmbedding(embedding);
//     } catch (error) {
//         console.error(
//             'Gemini embedding failed:',
//             error?.message || error
//         );

//         throw new Error(
//             `Embedding generation failed: ${error?.message || 'Unknown error'}`
//         );
//     }
// }

// export async function createEmbeddings(
//     texts,
//     mode = 'document'
// ) {
//     if (!Array.isArray(texts) || !texts.length) {
//         return [];
//     }

//     const embeddings = [];

//     for (let index = 0; index < texts.length; index++) {
//         const text = texts[index];

//         if (
//             typeof text !== 'string' ||
//             !text.trim()
//         ) {
//             throw new Error(
//                 `Invalid text at chunk ${index + 1}`
//             );
//         }

//         console.log(
//             `Embedding ${index + 1}/${texts.length}`
//         );

//         const embedding =
//             await createEmbedding(text, mode);

//         embeddings.push(embedding);
//     }

//     return embeddings;
// }

// export async function storeVectors(points) {
//     if (!Array.isArray(points) || !points.length) {
//         return [];
//     }

//     await ensureReady();

//     for (let index = 0; index < points.length; index++) {
//         const point = points[index];

//         if (!point?.projectId) {
//             throw new Error(
//                 `projectId is required for point ${index + 1}`
//             );
//         }

//         if (
//             typeof point.content !== 'string' ||
//             !point.content.trim()
//         ) {
//             throw new Error(
//                 `content is required for point ${index + 1}`
//             );
//         }
//     }

//     const embeddings = await createEmbeddings(
//         points.map(point => point.content),
//         'document'
//     );

//     if (embeddings.length !== points.length) {
//         throw new Error(
//             `Embedding count mismatch. Expected ${points.length}, received ${embeddings.length}`
//         );
//     }

//     const qdrantPoints = points.map(
//         (point, index) => ({
//             id: point.id || crypto.randomUUID(),
//             vector: embeddings[index],
//             payload: {
//                 projectId: String(point.projectId),
//                 type: String(
//                     point.type || 'document'
//                 ),
//                 content: point.content.trim(),

//                 ...(point.docId && {
//                     docId: String(point.docId)
//                 }),

//                 ...(point.fileName && {
//                     fileName: String(point.fileName)
//                 }),

//                 ...(point.pageNumber !== undefined && {
//                     pageNumber: Number(point.pageNumber)
//                 }),

//                 ...(point.sectionIndex !== undefined && {
//                     sectionIndex: Number(point.sectionIndex)
//                 }),

//                 ...(point.chunkIndex !== undefined && {
//                     chunkIndex: Number(point.chunkIndex)
//                 }),

//                 ...(point.parentId && {
//                     parentId: String(point.parentId)
//                 }),

//                 ...(point.parentContent && {
//                     parentContent: String(point.parentContent)
//                 }),

//                 ...(point.sectionTitle && {
//                     sectionTitle: String(
//                         point.sectionTitle
//                     )
//                 }),

//                 ...(point.sectionLevel !== undefined && {
//                     sectionLevel: Number(
//                         point.sectionLevel
//                     )
//                 }),

//                 ...(point.contentType && {
//                     contentType: String(
//                         point.contentType
//                     )
//                 }),

//                 ...(point.hasVisual !== undefined && {
//                     hasVisual: Boolean(
//                         point.hasVisual
//                     )
//                 }),

//                 ...(point.visionAttempted !== undefined && {
//                     visionAttempted: Boolean(
//                         point.visionAttempted
//                     )
//                 }),

//                 ...(point.visionFailed !== undefined && {
//                     visionFailed: Boolean(
//                         point.visionFailed
//                     )
//                 }),

//                 createdAt:
//                     point.createdAt ||
//                     new Date().toISOString()
//             }
//         })
//     );

//     for (
//         let start = 0;
//         start < qdrantPoints.length;
//         start += UPSERT_BATCH_SIZE
//     ) {
//         const batch = qdrantPoints.slice(
//             start,
//             start + UPSERT_BATCH_SIZE
//         );

//         await qdrant.upsert(COLLECTION, {
//             wait: true,
//             points: batch
//         });

//         console.log(
//             `Stored vectors ${start + 1}-${Math.min(
//                 start + batch.length,
//                 qdrantPoints.length
//             )}/${qdrantPoints.length}`
//         );
//     }

//     return qdrantPoints;
// }

// export async function searchVectors({
//     projectId,
//     query,
//     type = 'document',
//     limit = 5
// }) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required for vector search'
//         );
//     }

//     if (
//         typeof query !== 'string' ||
//         !query.trim()
//     ) {
//         return [];
//     }

//     await ensureReady();

//     const safeLimit = Math.min(
//         Math.max(Number(limit) || 5, 1),
//         MAX_SEARCH_LIMIT
//     );

//     const queryVector =
//         await createEmbedding(
//             query.trim(),
//             'query'
//         );

//     const must = [
//         {
//             key: 'projectId',
//             match: {
//                 value: String(projectId)
//             }
//         }
//     ];

//     if (type) {
//         must.push({
//             key: 'type',
//             match: {
//                 value: String(type)
//             }
//         });
//     }

//     const result = await qdrant.query(
//         COLLECTION,
//         {
//             query: queryVector,
//             filter: {
//                 must
//             },
//             limit: safeLimit,
//             with_payload: true,
//             with_vector: false
//         }
//     );

//     return result?.points || [];
// }

// export async function deleteProjectVectors(
//     projectId
// ) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required'
//         );
//     }

//     await ensureReady();

//     await qdrant.delete(COLLECTION, {
//         wait: true,
//         filter: {
//             must: [
//                 {
//                     key: 'projectId',
//                     match: {
//                         value: String(projectId)
//                     }
//                 }
//             ]
//         }
//     });

//     console.log(
//         `Deleted all vectors for project ${projectId}`
//     );
// }

// export async function deleteDocumentVectors({
//     projectId,
//     docId
// }) {
//     if (!projectId) {
//         throw new Error(
//             'projectId is required'
//         );
//     }

//     if (!docId) {
//         throw new Error(
//             'docId is required'
//         );
//     }

//     await ensureReady();

//     await qdrant.delete(COLLECTION, {
//         wait: true,
//         filter: {
//             must: [
//                 {
//                     key: 'projectId',
//                     match: {
//                         value: String(projectId)
//                     }
//                 },
//                 {
//                     key: 'docId',
//                     match: {
//                         value: String(docId)
//                     }
//                 }
//             ]
//         }
//     });

//     console.log(
//         `Deleted document ${docId} from project ${projectId}`
//     );
// }

// export async function getVectorStoreInfo() {
//     await ensureReady();

//     const info =
//         await qdrant.getCollection(
//             COLLECTION
//         );

//     return {
//         collection: COLLECTION,
//         embeddingModel: EMBEDDING_MODEL,
//         dimensions: DIMENSIONS,
//         vectorsCount:
//             info?.points_count ?? 0,
//         status:
//             info?.status ?? 'unknown'
//     };
// }

import crypto from 'crypto'

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { QdrantVectorStore } from '@langchain/qdrant'
import { QdrantClient } from '@qdrant/js-client-rest'


const COLLECTION =
    process.env.QDRANT_COLLECTION ||
    'project_vectors'


const EMBEDDING_MODEL =
    process.env.GEMINI_EMBEDDING_MODEL ||
    'gemini-embedding-2'


const DIMENSIONS =
    Number(
        process.env.GEMINI_EMBEDDING_DIMENSIONS ||
        3072
    )


const MAX_SEARCH_LIMIT = 50


const UPSERT_BATCH_SIZE = 50


const QDRANT_URL =
    process.env.QDRANT_URL


const QDRANT_API_KEY =
    process.env.QDRANT_API_KEY


/*
 * ============================================================
 * QDRANT CLIENT
 * ============================================================
 *
 * IMPORTANT:
 *
 * Your existing collection uses a custom flat payload:
 *
 * projectId
 * type
 * content
 * docId
 * fileName
 * pageNumber
 * chunkIndex
 * etc.
 *
 * Therefore we keep the Qdrant client only for preserving
 * your existing collection/payload structure.
 *
 * Embeddings themselves are completely LangChain based.
 *
 * ============================================================
 */

const qdrant =
    new QdrantClient({
        url:
            QDRANT_URL ||
            'http://localhost:6333',

        apiKey:
            QDRANT_API_KEY
    })


/*
 * ============================================================
 * LANGCHAIN GEMINI EMBEDDINGS
 * ============================================================
 */

let embeddings = null


function getEmbeddings() {
    if (embeddings) {
        return embeddings
    }


    if (
        !process.env.GEMINI_API_KEY
    ) {
        throw new Error(
            'GEMINI_API_KEY is missing'
        )
    }


    embeddings =
        new GoogleGenerativeAIEmbeddings({
            apiKey:
                process.env.GEMINI_API_KEY,

            model:
                EMBEDDING_MODEL,

            outputDimensionality:
                DIMENSIONS
        })


    return embeddings
}


/*
 * ============================================================
 * LANGCHAIN QDRANT VECTOR STORE
 * ============================================================
 *
 * This is connected to the SAME existing collection.
 *
 * It is used as the LangChain vector-store abstraction.
 *
 * We do NOT recreate your collection.
 *
 * ============================================================
 */

let vectorStore = null


async function getVectorStore() {
    if (vectorStore) {
        return vectorStore
    }


    vectorStore =
        await QdrantVectorStore.fromExistingCollection(
            getEmbeddings(),

            {
                url:
                    QDRANT_URL,

                apiKey:
                    QDRANT_API_KEY,

                collectionName:
                    COLLECTION,

                contentPayloadKey:
                    'content',

                metadataPayloadKey:
                    'metadata',

                validateCollectionConfig:
                    false
            }
        )


    return vectorStore
}


/*
 * ============================================================
 * STATE
 * ============================================================
 */

let initialized = false

let initializationPromise = null


/*
 * ============================================================
 * INIT VECTOR STORE
 * ============================================================
 */

export async function initVectorStore() {

    if (initialized) {
        return
    }


    if (initializationPromise) {
        return initializationPromise
    }


    initializationPromise =
        initialize()


    try {

        await initializationPromise

        initialized = true

    } finally {

        initializationPromise = null

    }
}


/*
 * ============================================================
 * INITIALIZE
 * ============================================================
 */

async function initialize() {

    if (
        !process.env.GEMINI_API_KEY
    ) {
        throw new Error(
            'GEMINI_API_KEY is missing'
        )
    }


    if (!QDRANT_URL) {
        throw new Error(
            'QDRANT_URL is missing'
        )
    }


    /*
     * Verify that the EXISTING collection exists.
     *
     * We intentionally do not create another collection.
     */

    const exists =
        await qdrant.collectionExists(
            COLLECTION
        )


    if (!exists) {
        throw new Error(
            `Qdrant collection "${COLLECTION}" does not exist. Create/configure the existing collection first.`
        )
    }


    /*
     * Verify the configured embedding dimension
     * against the existing Qdrant collection.
     */

    const info =
        await qdrant.getCollection(
            COLLECTION
        )


    const configuredSize =
        info?.config?.params?.vectors?.size


    if (
        configuredSize &&
        Number(configuredSize) !==
            DIMENSIONS
    ) {
        throw new Error(
            `Qdrant dimension mismatch. Existing collection "${COLLECTION}" is ${configuredSize}D but GEMINI_EMBEDDING_DIMENSIONS is ${DIMENSIONS}.`
        )
    }


    /*
     * Initialize LangChain QdrantVectorStore.
     */

    await getVectorStore()


    /*
     * Keep your existing payload indexes.
     */

    const indexes = [
        'projectId',
        'type',
        'docId',
        'fileName',
        'contentType',
        'parentId'
    ]


    for (
        const field of indexes
    ) {
        await createPayloadIndex(
            field
        )
    }


    console.log(
        `LangChain embeddings ready: ${COLLECTION} | ${EMBEDDING_MODEL} | ${DIMENSIONS}D`
    )
}


/*
 * ============================================================
 * PAYLOAD INDEX
 * ============================================================
 */

async function createPayloadIndex(
    fieldName
) {

    try {

        await qdrant.createPayloadIndex(
            COLLECTION,

            {
                field_name:
                    fieldName,

                field_schema:
                    'keyword'
            }
        )

    } catch (error) {

        const message =
            error?.message ||
            ''


        if (
            !message.includes(
                'already exists'
            ) &&
            !message.includes(
                'already indexed'
            ) &&
            !message.includes(
                'Index already exists'
            )
        ) {

            /*
             * Some Qdrant versions return
             * a slightly different message.
             *
             * We do not fail the whole application
             * if the index already exists.
             */

            console.error(
                `Qdrant index error for ${fieldName}:`,
                message
            )
        }
    }
}


/*
 * ============================================================
 * ENSURE READY
 * ============================================================
 */

async function ensureReady() {

    await initVectorStore()

}


/*
 * ============================================================
 * VALIDATE EMBEDDING
 * ============================================================
 */

function validateEmbedding(
    embedding
) {

    if (
        !Array.isArray(
            embedding
        ) ||
        !embedding.length
    ) {

        throw new Error(
            'LangChain returned an invalid embedding'
        )
    }


    if (
        embedding.length !==
        DIMENSIONS
    ) {

        throw new Error(
            `Embedding dimension mismatch. Expected ${DIMENSIONS}, received ${embedding.length}`
        )
    }


    return embedding
}


/*
 * ============================================================
 * GEMINI EMBEDDING RETRIEVAL INSTRUCTION
 * ============================================================
 */

function addRetrievalInstruction(
    text,
    type
) {

    if (
        EMBEDDING_MODEL !==
        'gemini-embedding-2'
    ) {
        return text
    }


    if (
        type === 'query'
    ) {

        return `task: retrieval query | query: ${text}`

    }


    return `task: retrieval document | document: ${text}`
}


/*
 * ============================================================
 * CREATE ONE EMBEDDING
 * ============================================================
 *
 * LANGCHAIN BASED
 *
 * No GoogleGenAI SDK.
 *
 * ============================================================
 */

export async function createEmbedding(
    text,
    mode = 'document'
) {

    if (
        typeof text !== 'string' ||
        !text.trim()
    ) {

        throw new Error(
            'Text is required for embedding'
        )
    }


    await ensureReady()


    const cleanText =
        text.trim()


    const embeddingText =
        addRetrievalInstruction(
            cleanText,

            mode === 'query'
                ? 'query'
                : 'document'
        )


    try {

        const embedding =
            mode === 'query'

                ? await getEmbeddings()
                    .embedQuery(
                        embeddingText
                    )

                : (
                    await getEmbeddings()
                        .embedDocuments([
                            embeddingText
                        ])
                )[0]


        return validateEmbedding(
            embedding
        )

    } catch (error) {

        console.error(
            'LangChain Gemini embedding failed:',
            error?.message ||
                error
        )


        throw new Error(
            `Embedding generation failed: ${
                error?.message ||
                'Unknown error'
            }`
        )
    }
}


/*
 * ============================================================
 * CREATE MULTIPLE EMBEDDINGS
 * ============================================================
 *
 * ONLY ONE createEmbeddings FUNCTION.
 *
 * This prevents your previous duplicate declaration error.
 *
 * ============================================================
 */

export async function createEmbeddings(
    texts,
    mode = 'document'
) {

    if (
        !Array.isArray(texts) ||
        !texts.length
    ) {

        return []
    }


    await ensureReady()


    const preparedTexts =
        texts.map(
            (
                text,
                index
            ) => {

                if (
                    typeof text !==
                        'string' ||
                    !text.trim()
                ) {

                    throw new Error(
                        `Invalid text at chunk ${index + 1}`
                    )
                }


                return addRetrievalInstruction(
                    text.trim(),

                    mode === 'query'
                        ? 'query'
                        : 'document'
                )
            }
        )


    try {

        /*
         * One LangChain batch call.
         */

        const result =
            await getEmbeddings()
                .embedDocuments(
                    preparedTexts
                )


        if (
            !Array.isArray(
                result
            )
        ) {

            throw new Error(
                'LangChain returned invalid embeddings'
            )
        }


        if (
            result.length !==
            texts.length
        ) {

            throw new Error(
                `Embedding count mismatch. Expected ${texts.length}, received ${result.length}`
            )
        }


        for (
            let index = 0;
            index < result.length;
            index++
        ) {

            validateEmbedding(
                result[index]
            )
        }


        return result

    } catch (error) {

        console.error(
            'LangChain batch embedding failed:',
            error?.message ||
                error
        )


        throw new Error(
            `Embedding generation failed: ${
                error?.message ||
                'Unknown error'
            }`
        )
    }
}


/*
 * ============================================================
 * STORE VECTORS
 * ============================================================
 *
 * IMPORTANT:
 *
 * We keep your EXISTING Qdrant payload structure.
 *
 * Therefore:
 *
 * LangChain:
 *   text -> embedding
 *
 * Qdrant client:
 *   existing payload -> existing collection
 *
 * ============================================================
 */

export async function storeVectors(
    points
) {

    if (
        !Array.isArray(points) ||
        !points.length
    ) {

        return []
    }


    await ensureReady()


    for (
        let index = 0;
        index < points.length;
        index++
    ) {

        const point =
            points[index]


        if (
            !point?.projectId
        ) {

            throw new Error(
                `projectId is required for point ${index + 1}`
            )
        }


        if (
            typeof point.content !==
                'string' ||
            !point.content.trim()
        ) {

            throw new Error(
                `content is required for point ${index + 1}`
            )
        }
    }


    /*
     * Generate embeddings through LangChain.
     */

    const generatedEmbeddings =
        await createEmbeddings(
            points.map(
                point =>
                    point.content
            ),

            'document'
        )


    if (
        generatedEmbeddings.length !==
        points.length
    ) {

        throw new Error(
            `Embedding count mismatch. Expected ${points.length}, received ${generatedEmbeddings.length}`
        )
    }


    /*
     * Build the EXACT payload structure
     * used by your old Qdrant collection.
     */

    const qdrantPoints =
        points.map(
            (
                point,
                index
            ) => {

                const id =
                    point.id ||
                    crypto.randomUUID()


                const payload = {

                    projectId:
                        String(
                            point.projectId
                        ),

                    type:
                        String(
                            point.type ||
                            'document'
                        ),

                    content:
                        point.content.trim(),


                    ...(point.docId && {
                        docId:
                            String(
                                point.docId
                            )
                    }),


                    ...(point.fileName && {
                        fileName:
                            String(
                                point.fileName
                            )
                    }),


                    ...(point.pageNumber !==
                        undefined && {
                        pageNumber:
                            Number(
                                point.pageNumber
                            )
                    }),


                    ...(point.sectionIndex !==
                        undefined && {
                        sectionIndex:
                            Number(
                                point.sectionIndex
                            )
                    }),


                    ...(point.chunkIndex !==
                        undefined && {
                        chunkIndex:
                            Number(
                                point.chunkIndex
                            )
                    }),


                    ...(point.parentId && {
                        parentId:
                            String(
                                point.parentId
                            )
                    }),


                    ...(point.parentContent && {
                        parentContent:
                            String(
                                point.parentContent
                            )
                    }),


                    ...(point.sectionTitle && {
                        sectionTitle:
                            String(
                                point.sectionTitle
                            )
                    }),


                    ...(point.sectionLevel !==
                        undefined && {
                        sectionLevel:
                            Number(
                                point.sectionLevel
                            )
                    }),


                    ...(point.contentType && {
                        contentType:
                            String(
                                point.contentType
                            )
                    }),


                    ...(point.hasVisual !==
                        undefined && {
                        hasVisual:
                            Boolean(
                                point.hasVisual
                            )
                    }),


                    ...(point.visionAttempted !==
                        undefined && {
                        visionAttempted:
                            Boolean(
                                point.visionAttempted
                            )
                    }),


                    ...(point.visionFailed !==
                        undefined && {
                        visionFailed:
                            Boolean(
                                point.visionFailed
                            )
                    }),


                    createdAt:
                        point.createdAt ||
                        new Date()
                            .toISOString()
                }


                return {

                    id,

                    vector:
                        generatedEmbeddings[
                            index
                        ],

                    payload
                }
            }
        )


    /*
     * Existing batching behavior preserved.
     */

    for (
        let start = 0;

        start <
            qdrantPoints.length;

        start +=
            UPSERT_BATCH_SIZE
    ) {

        const batch =
            qdrantPoints.slice(
                start,

                start +
                    UPSERT_BATCH_SIZE
            )


        await qdrant.upsert(
            COLLECTION,

            {
                wait:
                    true,

                points:
                    batch
            }
        )


        console.log(
            `Stored vectors ${start + 1}-${Math.min(
                start + batch.length,
                qdrantPoints.length
            )}/${qdrantPoints.length}`
        )
    }


    return qdrantPoints
}


/*
 * ============================================================
 * SEARCH VECTORS
 * ============================================================
 *
 * Embedding:
 *     LangChain
 *
 * Search:
 *     Existing Qdrant collection
 *
 * ============================================================
 */

export async function searchVectors({
    projectId,
    query,
    type = 'document',
    limit = 5
}) {

    if (!projectId) {

        throw new Error(
            'projectId is required for vector search'
        )
    }


    if (
        typeof query !== 'string' ||
        !query.trim()
    ) {

        return []
    }


    await ensureReady()


    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) ||
                    5,

                1
            ),

            MAX_SEARCH_LIMIT
        )


    /*
     * Query embedding is generated by LangChain.
     */

    const queryVector =
        await createEmbedding(
            query.trim(),

            'query'
        )


    const must = [

        {
            key:
                'projectId',

            match: {
                value:
                    String(
                        projectId
                    )
            }
        }

    ]


    if (type) {

        must.push({

            key:
                'type',

            match: {
                value:
                    String(
                        type
                    )
            }

        })
    }


    const result =
        await qdrant.query(
            COLLECTION,

            {
                query:
                    queryVector,

                filter: {
                    must
                },

                limit:
                    safeLimit,

                with_payload:
                    true,

                with_vector:
                    false
            }
        )


    return (
        result?.points ||
        []
    )
}


/*
 * ============================================================
 * DELETE PROJECT VECTORS
 * ============================================================
 */

export async function deleteProjectVectors(
    projectId
) {

    if (!projectId) {

        throw new Error(
            'projectId is required'
        )
    }


    await ensureReady()


    await qdrant.delete(
        COLLECTION,

        {
            wait:
                true,

            filter: {

                must: [

                    {
                        key:
                            'projectId',

                        match: {

                            value:
                                String(
                                    projectId
                                )
                        }
                    },

                    {
                        key:
                            'type',

                        match: {

                            value:
                                'document'
                        }
                    }

                ]
            }
        }
    )


    console.log(
        `Deleted all vectors for project ${projectId}`
    )


    return {
        success:
            true
    }
}


/*
 * ============================================================
 * DELETE DOCUMENT VECTORS
 * ============================================================
 */

export async function deleteDocumentVectors({
    projectId,
    docId
}) {

    if (!projectId) {

        throw new Error(
            'projectId is required'
        )
    }


    if (!docId) {

        throw new Error(
            'docId is required'
        )
    }


    await ensureReady()


    await qdrant.delete(
        COLLECTION,

        {
            wait:
                true,

            filter: {

                must: [

                    {
                        key:
                            'projectId',

                        match: {

                            value:
                                String(
                                    projectId
                                )
                        }
                    },

                    {
                        key:
                            'docId',

                        match: {

                            value:
                                String(
                                    docId
                                )
                        }
                    }

                ]
            }
        }
    )


    console.log(
        `Deleted document ${docId} from project ${projectId}`
    )


    return {
        success:
            true
    }
}


/*
 * ============================================================
 * VECTOR STORE INFORMATION
 * ============================================================
 */

export async function getVectorStoreInfo() {

    await ensureReady()


    const info =
        await qdrant.getCollection(
            COLLECTION
        )


    return {

        collection:
            COLLECTION,

        embeddingModel:
            EMBEDDING_MODEL,

        dimensions:
            DIMENSIONS,

        vectorsCount:
            info?.points_count ??
            0,

        status:
            info?.status ??
            'unknown'
    }
}