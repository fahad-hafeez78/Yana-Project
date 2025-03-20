import * as participantsService from '../services/participantsService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createParticipant = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {

            if (err) return next({ status: 400, message: err.message });

            const data = await participantsService.createParticipant(req);
            res.status(201).send(Created('Participant created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllParticipants = async (req, res, next) => {
    try {
        const data = await participantsService.getAllParticipants();
        res.status(200).send(Retrieved('Participants retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};
export const getActiveParticipants = async (req, res, next) => {
    try {
        const data = await participantsService.getActiveParticipants();
        res.status(200).send(Retrieved('Participants retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};



export const updateParticipant = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await participantsService.updateParticipant(req);
            res.status(200).send(Updated('Participant updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};

export const generateParticipantCredentials = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await participantsService.generateParticipantCredentials(req);
            res.status(200).send(Updated('Participant credentials generated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};

export const deleteParticipant = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await participantsService.deleteParticipant(participantId);
        res.status(200).send(Deleted('Participant deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getParticipantById = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const data = await participantsService.getParticipantById(participantId);
        res.status(200).send(Retrieved('Participant retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};

export const importParticipants = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            if (err) return next({ status: 400, message: err.message });
            const data = await participantsService.importParticipants(req);
            res.status(201).send(Created('Participants Imported successfully', data));

        } catch (error) {
            next(error);
        }
    });
};

// Participant Requests Methods
export const createParticipantRequest = async (req, res, next) => {

    try {
        if (err) return next({ status: 400, message: err.message });

        const data = await participantsService.createParticipantRequest(req);
        res.status(201).send(Created('Participant Request created successfully', data));

    } catch (error) {
        next(error);
    }
};


export const getAllParticipantsRequests = async (req, res, next) => {
    try {
        const data = await participantsService.getAllParticipantsRequests();
        res.status(200).send(Retrieved('Participants Requests retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const updateParticipantRequest = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await participantsService.updateParticipantRequest(req);
            res.status(200).send(Updated('Participant Request updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};