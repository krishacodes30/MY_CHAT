// import mongoose from 'mongoose'

// import {
//     ingestPdf
// } from '../services/rag.service.js'

// import projectModel from '../models/project.model.js'


// export const uploadProjectDocument =
//     async (req, res) => {

//         try {

//             const {
//                 projectId
//             } = req.params


//             if (
//                 !mongoose.Types.ObjectId.isValid(
//                     projectId
//                 )
//             ) {

//                 return res.status(400).json({

//                     success: false,

//                     message:
//                         'Invalid projectId'
//                 })
//             }


//             /*
//             ------------------------------------------------
//             CHECK PROJECT MEMBERSHIP
//             ------------------------------------------------
//             */

//             const userId =
//                 req.user?._id ||
//                 req.user?.id ||
//                 req.user?.userId


//             const project =
//                 await projectModel.findOne({

//                     _id:
//                         projectId,

//                     users:
//                         userId
//                 })


//             if (!project) {

//                 return res.status(403).json({

//                     success: false,

//                     message:
//                         'You are not a member of this project'
//                 })
//             }


//             /*
//             ------------------------------------------------
//             FILE CHECK
//             ------------------------------------------------
//             */

//             if (!req.file) {

//                 return res.status(400).json({

//                     success: false,

//                     message:
//                         'Please upload a PDF file'
//                 })
//             }


//             /*
//             ------------------------------------------------
//             INGEST
//             ------------------------------------------------
//             */

//             const result =
//                 await ingestPdf({

//                     projectId,

//                     file:
//                         req.file
//                 })


//             return res.status(201).json({

//                 success: true,

//                 message:
//                     'PDF uploaded and indexed successfully',

//                 data:
//                     result
//             })

//         } catch (error) {

//             console.error(
//                 'PDF upload/indexing error:',
//                 error
//             )


//             return res.status(500).json({

//                 success: false,

//                 message:
//                     error.message ||
//                     'Failed to upload and index PDF'
//             })
//         }
//     }
import mongoose from 'mongoose';
import { ingestPdf } from '../services/rag.service.js';
import projectModel from '../models/project.model.js';

export const uploadProjectDocument = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid projectId'
            });
        }

        const userId =
            req.user?._id ||
            req.user?.id ||
            req.user?.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const project = await projectModel.findOne({
            _id: projectId,
            users: userId
        });

        if (!project) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this project'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a PDF file'
            });
        }

        if (req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                success: false,
                message: 'Only PDF files are supported'
            });
        }

        if (!req.file.buffer?.length) {
            return res.status(400).json({
                success: false,
                message: 'Uploaded PDF is empty or invalid'
            });
        }

        console.log(
            `Starting PDF indexing: ${req.file.originalname}`
        );

        const result = await ingestPdf({
            projectId: String(projectId),
            file: req.file
        });

        return res.status(201).json({
            success: true,
            message: 'PDF uploaded and indexed successfully',
            data: result
        });
    } catch (error) {
        console.error(
            'PDF upload/indexing error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error?.message ||
                'Failed to upload and index PDF'
        });
    }
};