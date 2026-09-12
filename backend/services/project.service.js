// import projectModel from '../models/project.model.js';
// import mongoose from 'mongoose';

// export const createProject = async ({
//     name, userId
// }) => {
//     if (!name) {
//         throw new Error('Name is required')
//     }
//     if (!userId) {
//         throw new Error('UserId is required')
//     }

//     let project;
//     try {
//         project = await projectModel.create({
//             name,
//             users: [ userId ]
//         });
//     } catch (error) {
//         if (error.code === 11000) {
//             throw new Error('Project name already exists');
//         }
//         throw error;
//     }

//     return project;

// }


// export const getAllProjectByUserId = async ({ userId }) => {
//     if (!userId) {
//         throw new Error('UserId is required')
//     }

//     const allUserProjects = await projectModel.find({
//         users: userId
//     })

//     return allUserProjects
// }

// export const addUsersToProject = async ({ projectId, users, userId }) => {

//     if (!projectId) {
//         throw new Error("projectId is required")
//     }

//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         throw new Error("Invalid projectId")
//     }

//     if (!users) {
//         throw new Error("users are required")
//     }

//     if (!Array.isArray(users) || users.some(userId => !mongoose.Types.ObjectId.isValid(userId))) {
//         throw new Error("Invalid userId(s) in users array")
//     }

//     if (!userId) {
//         throw new Error("userId is required")
//     }

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         throw new Error("Invalid userId")
//     }


//     const project = await projectModel.findOne({
//         _id: projectId,
//         users: userId
//     })

//     console.log(project)

//     if (!project) {
//         throw new Error("User not belong to this project")
//     }

//     const updatedProject = await projectModel.findOneAndUpdate({
//         _id: projectId
//     }, {
//         $addToSet: {
//             users: {
//                 $each: users
//             }
//         }
//     }, {
//         new: true
//     })

//     return updatedProject



// }

// export const getProjectById = async ({ projectId }) => {
//     if (!projectId) {
//         throw new Error("projectId is required")
//     }

//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         throw new Error("Invalid projectId")
//     }

//     const project = await projectModel.findOne({
//         _id: projectId
//     }).populate('users')

//     return project;
// }

// export const updateFileTree = async ({ projectId, fileTree }) => {
//     if (!projectId) {
//         throw new Error("projectId is required")
//     }

//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//         throw new Error("Invalid projectId")
//     }

//     if (!fileTree) {
//         throw new Error("fileTree is required")
//     }

//     const project = await projectModel.findOneAndUpdate({
//         _id: projectId
//     }, {
//         fileTree
//     }, {
//         new: true
//     })

//     return project;
// }


import projectModel from '../models/project.model.js'
import userModel from '../models/user.model.js'
import mongoose from 'mongoose'

export const createProject = async ({
    name,
    userId
}) => {
    if (!name) {
        throw new Error(
            'Name is required'
        )
    }

    if (!userId) {
        throw new Error(
            'UserId is required'
        )
    }

    let project

    try {
        project =
            await projectModel.create({
                name,
                users: [
                    userId
                ]
            })
    } catch (error) {
        if (error.code === 11000) {
            throw new Error(
                'Project name already exists'
            )
        }

        throw error
    }

    return project
}

export const getAllProjectByUserId =
    async ({
        userId
    }) => {
        if (!userId) {
            throw new Error(
                'UserId is required'
            )
        }

        return projectModel.find({
            users: userId
        })
    }

export const addUsersToProject =
    async ({
        projectId,
        users,
        userId
    }) => {
        if (!projectId) {
            throw new Error(
                'projectId is required'
            )
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {
            throw new Error(
                'Invalid projectId'
            )
        }

        if (!Array.isArray(users) || !users.length) {
            throw new Error(
                'users are required'
            )
        }

        if (
            users.some(
                id =>
                    !mongoose.Types.ObjectId.isValid(
                        id
                    )
            )
        ) {
            throw new Error(
                'Invalid userId(s) in users array'
            )
        }

        if (!userId) {
            throw new Error(
                'userId is required'
            )
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {
            throw new Error(
                'Invalid userId'
            )
        }

        const project =
            await projectModel.findOne({
                _id:
                    projectId,
                users:
                    userId
            })

        if (!project) {
            throw new Error(
                'User not belong to this project'
            )
        }

        const existingUsers =
            await userModel.find({
                _id: {
                    $in:
                        users
                }
            }).select('_id').lean()

        if (
            existingUsers.length !==
            new Set(users.map(String)).size
        ) {
            throw new Error(
                'One or more users do not exist'
            )
        }

        return projectModel.findOneAndUpdate(
            {
                _id:
                    projectId
            },
            {
                $addToSet: {
                    users: {
                        $each:
                            users
                    }
                }
            },
            {
                new:
                    true
            }
        )
    }

export const getProjectById =
    async ({
        projectId
    }) => {
        if (!projectId) {
            throw new Error(
                'projectId is required'
            )
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {
            throw new Error(
                'Invalid projectId'
            )
        }

        return projectModel.findOne({
            _id:
                projectId
        }).populate('users')
    }

export const updateFileTree =
    async ({
        projectId,
        fileTree
    }) => {
        if (!projectId) {
            throw new Error(
                'projectId is required'
            )
        }

        if (
            !mongoose.Types.ObjectId.isValid(
                projectId
            )
        ) {
            throw new Error(
                'Invalid projectId'
            )
        }

        if (
            fileTree === undefined ||
            fileTree === null
        ) {
            throw new Error(
                'fileTree is required'
            )
        }

        return projectModel.findOneAndUpdate(
            {
                _id:
                    projectId
            },
            {
                fileTree
            },
            {
                new:
                    true
            }
        )
    }
