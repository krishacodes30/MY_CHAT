import projectModel
    from '../models/project.model.js'

import {
    getProjectMessages
} from '../services/message.service.js'


export async function getMessages(
    req,
    res
) {

    try {

        const {
            projectId
        } = req.params


        const project =
            await projectModel.findOne({
                _id: projectId,

                users:
                    req.user._id
            })


        if (!project) {

            return res.status(403).json({
                error:
                    'You are not a member of this project'
            })
        }


        const messages =
            await getProjectMessages(
                projectId
            )


        return res.json({
            messages
        })

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            error:
                error.message
        })
    }
}