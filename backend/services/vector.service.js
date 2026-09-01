import { GoogleGenAI } from '@google/genai'
import { QdrantClient } from '@qdrant/js-client-rest'
import crypto from 'crypto'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
})

const COLLECTION = process.env.QDRANT_COLLECTION || 'project_vectors'
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001'
const DIMENSIONS = 768

export async function initVectorStore() {
  try {
    const exists = await qdrant.collectionExists(COLLECTION)
    if (!exists) {
      await qdrant.createCollection(COLLECTION, {
        vectors: { size: DIMENSIONS, distance: 'Cosine' }
      })
      console.log(`Qdrant collection created: ${COLLECTION}`)
    }

    try {
      await qdrant.createPayloadIndex(COLLECTION, { field_name: 'projectId', field_schema: 'keyword' })
    } catch (error) {
      console.log('projectId index already exists')
    }

    try {
      await qdrant.createPayloadIndex(COLLECTION, { field_name: 'type', field_schema: 'keyword' })
    } catch (error) {
      console.log('type index already exists')
    }

    console.log(`Qdrant ready: ${COLLECTION}`)
  } catch (error) {
    console.error('Qdrant initialization failed:', error)
    throw error
  }
}

export async function createEmbedding(text, taskType = 'RETRIEVAL_DOCUMENT') {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text is required for embedding')
  }

  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text.trim(),
      config: { taskType, outputDimensionality: DIMENSIONS }
    })

    const embedding = response?.embeddings?.[0]?.values

    if (!Array.isArray(embedding) || embedding.length === 0) {
      console.error('Invalid embedding response:', response)
      throw new Error('Gemini returned an invalid embedding')
    }

    if (embedding.length !== DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch. Expected ${DIMENSIONS}, received ${embedding.length}`)
    }

    return embedding
  } catch (error) {
    console.error('Gemini embedding failed:', error)
    throw error
  }
}

export async function createEmbeddings(texts, taskType = 'RETRIEVAL_DOCUMENT') {
  if (!Array.isArray(texts) || texts.length === 0) return []

  const embeddings = []
  for (let index = 0; index < texts.length; index++) {
    const text = texts[index]
    if (typeof text !== 'string' || !text.trim()) {
      throw new Error(`Invalid text at chunk ${index + 1}`)
    }
    console.log(`Creating embedding ${index + 1}/${texts.length}`)
    const embedding = await createEmbedding(text, taskType)
    embeddings.push(embedding)
  }
  return embeddings
}

export async function storeVectors(points) {
  if (!Array.isArray(points) || points.length === 0) return []

  for (let index = 0; index < points.length; index++) {
    const point = points[index]
    if (!point?.projectId) {
      throw new Error(`projectId is required for point ${index + 1}`)
    }
    if (typeof point.content !== 'string' || !point.content.trim()) {
      throw new Error(`content is required for point ${index + 1}`)
    }
  }

  const embeddings = await createEmbeddings(points.map(point => point.content), 'RETRIEVAL_DOCUMENT')

  if (embeddings.length !== points.length) {
    throw new Error(`Embedding count mismatch. Expected ${points.length}, received ${embeddings.length}`)
  }

  const qdrantPoints = points.map((point, index) => ({
    id: point.id || crypto.randomUUID(),
    vector: embeddings[index],
    payload: {
      projectId: String(point.projectId),
      type: point.type || 'document',
      content: point.content,
      ...(point.fileName && { fileName: point.fileName }),
      ...(point.chunkIndex !== undefined && { chunkIndex: point.chunkIndex })
    }
  }))

  await qdrant.upsert(COLLECTION, { wait: true, points: qdrantPoints })
  console.log(`Stored ${qdrantPoints.length} vectors in Qdrant`)
  return qdrantPoints
}

export async function searchVectors({ projectId, query, type = 'document', limit = 5 }) {
  if (!projectId) throw new Error('projectId is required for vector search')
  if (typeof query !== 'string' || !query.trim()) return []

  const queryVector = await createEmbedding(query.trim(), 'RETRIEVAL_QUERY')
  const must = [{ key: 'projectId', match: { value: String(projectId) } }]

  if (type) {
    must.push({ key: 'type', match: { value: type } })
  }

  const result = await qdrant.query(COLLECTION, {
    query: queryVector,
    filter: { must },
    limit: Number(limit) || 5,
    with_payload: true,
    with_vector: false
  })

  return result?.points || []
}

export async function deleteProjectVectors(projectId) {
  if (!projectId) throw new Error('projectId is required')

  await qdrant.delete(COLLECTION, {
    wait: true,
    filter: {
      must: [{ key: 'projectId', match: { value: String(projectId) } }]
    }
  })

  console.log(`Deleted vectors for project ${projectId}`)
}