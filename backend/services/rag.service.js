import { PDFParse } from 'pdf-parse'

import {
    storeVectors,
    searchVectors
} from './vector.service.js'


function chunkText(
    text,
    chunkSize = 1200,
    overlap = 200
) {

    const cleanText =
        text
            .replace(/\s+/g, ' ')
            .trim()


    if (!cleanText) {
        return []
    }


    const chunks = []

    let start = 0


    while (start < cleanText.length) {

        const end =
            Math.min(
                start + chunkSize,
                cleanText.length
            )


        const chunk =
            cleanText
                .slice(start, end)
                .trim()


        if (chunk) {
            chunks.push(chunk)
        }


        if (end >= cleanText.length) {
            break
        }


        start =
            Math.max(
                0,
                end - overlap
            )
    }


    return chunks
}


/*
============================================================
INGEST PDF
============================================================
*/

export async function ingestPdf({
    projectId,
    file
}) {

    if (!projectId) {
        throw new Error(
            'projectId is required'
        )
    }


    if (!file) {
        throw new Error(
            'PDF file is required'
        )
    }


    if (
        file.mimetype !==
        'application/pdf'
    ) {

        throw new Error(
            'Only PDF files are supported'
        )
    }


    if (!file.buffer?.length) {

        throw new Error(
            'Uploaded PDF is empty'
        )
    }


    const parser =
        new PDFParse({
            data: file.buffer
        })


    let result

    try {

        result =
            await parser.getText()

    } finally {

        await parser.destroy()
    }


    const chunks =
        chunkText(
            result?.text || ''
        )


    if (!chunks.length) {

        throw new Error(
            'No readable text found in PDF. Scanned/image-only PDFs need OCR.'
        )
    }


    const points =
        chunks.map(
            (content, index) => ({

                projectId,

                type: 'document',

                fileName:
                    file.originalname,

                chunkIndex:
                    index,

                content
            })
        )


    const stored =
        await storeVectors(points)


    return {

        fileName:
            file.originalname,

        chunks:
            chunks.length,

        vectors:
            stored.length
    }
}


/*
============================================================
SEARCH DOCUMENTS
============================================================
*/

export async function searchDocuments({
    projectId,
    query,
    limit = 5
}) {

    return searchVectors({

        projectId,

        query,

        type: 'document',

        limit
    })
}