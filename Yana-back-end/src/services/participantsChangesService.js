import { NotDeleted, NotFound } from '../utils/customErrors.js';
import Participants from '../models/Participants.js';
import ParticipantsChanges from '../models/ParticipantsChanges.js';


export const approveParticipantChanges = async (req) => {
    try {
        const participantId = req.params.id;
        const updatedChanges = req.body;
        const updateFields = { Status: "Active", ...updatedChanges };

        const updatedParticipant = await Participants.findByIdAndUpdate(participantId, updateFields, { new: true });

        const data = await ParticipantsChanges.deleteOne({ participantId: participantId });

        if (data.length === 0) {
            throw NotFound('Participants Changes not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getAllParticipantChanges = async () => {
    try {
        const data = await ParticipantsChanges.find().populate('participantId');

        if (data.length === 0) {
            throw NotFound('Participants Changes not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getParticipantChangesById = async (participantChangesId) => {
    try {
        const data = await ParticipantsChanges.findById(participantChangesId);
        if (!data) {
            throw NotFound('Participant Changes not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deleteParticipantChanges = async (participantChangesId) => {
    try {
        const data = await ParticipantsChanges.findByIdAndDelete(participantChangesId);
        if (!data) {
            throw NotDeleted('Participant Changes not deleted');
        }
        return data;

    } catch (error) {
        throw error;
    }
};
