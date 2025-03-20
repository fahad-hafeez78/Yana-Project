import * as participantsChangesService from '../services/participantsChangesService.js'
import { Deleted, Retrieved } from '../utils/customResponses.js';


export const approveParticipantChanges = async (req, res, next) => {
    try {
        const data = await participantsChangesService.approveParticipantChanges(req);
        res.status(200).send(Retrieved('Participant Changes approvd'));
    } catch (error) {
        next(error);
    }
};


export const getAllParticipantChanges = async (req, res, next) => {
    try {
        const data = await participantsChangesService.getAllParticipantChanges();
        res.status(200).send(Retrieved('Participant Changes retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const deleteParticipantChanges = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await participantsChangesService.deleteParticipantChanges(participantId);
        res.status(200).send(Deleted('Participant Changes deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getParticipantChangesById = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await participantsChangesService.getParticipantChangesById(participantId);
        res.status(200).send(Retrieved('Participant Changes retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};
