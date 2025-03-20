import mongoose from "mongoose";

const participantsChangesSchema = new mongoose.Schema({
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Participants',
    },
    fields: [{
        field: {
            type: String,
            required: true,
        },
        previousValue: {
            type: String,
            maxlength: 255,
        },
        newValue: {
            type: String,
            maxlength: 255,
        },
    }],
    Status: {
        type: String,
        maxlength: 45,
        default: 'Pending',
    },
}, {
    collection: 'ParticipantsChanges',
    timestamps: true,
});

export default mongoose.model('ParticipantsChanges', participantsChangesSchema);
