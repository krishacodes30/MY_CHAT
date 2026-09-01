import mongoose from 'mongoose'


const messageSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },

        senderEmail: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        mentionsAI: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
)


messageSchema.index({
    project: 1,
    createdAt: 1
})


const messageModel =
    mongoose.model(
        'ProjectMessage',
        messageSchema
    )


export default messageModel