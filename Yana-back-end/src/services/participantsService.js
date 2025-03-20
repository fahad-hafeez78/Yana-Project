import { deleteFromS3, uploadToS3 } from './s3BucketService.js';
import { DuplicateKey, NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import Participants from '../models/Participants.js';
import { combineAndSegregateRows, compareParticipantFields, formatUnionedData, saveParticipantChanges, updateExistingParticipant, updateExistingParticipantChanges } from '../utils/Participants/ImportParticipants.js';
import ParticipantsChanges from '../models/ParticipantsChanges.js';
import { generateParticipantUserName, generateParticipantPassword } from '../utils/Participants/generateParticipantCredentials.js';
import bcrypt from 'bcrypt';

import xlsx from 'xlsx';
import _ from 'lodash';
import ParticipantRequests from '../models/ParticipantRequests.js';
import { deleteOrdersByParticipantsId } from './ordersService.js';

export const createParticipant = async (req) => {
    try {
        const newParticipant = new Participants(req.body);
        const data = await newParticipant.save();
        if (!data) {
            throw NotCreated('Participant not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllParticipants = async () => {
    try {
        const data = await Participants.find();

        if (data.length === 0) {
            throw NotFound('Participants not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getActiveParticipants = async () => {
    try {
        const data = await Participants.find({ Status: "Active" });

        if (data.length === 0) {
            throw NotFound('Participants not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getParticipantById = async (participantId) => {
    try {
        const data = await Participants.findById(participantId);
        if (!data) {
            throw NotFound('Participant not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateParticipant = async (req) => {

    try {
        const participantData = req.body;
        const participantId = req.params.id;
        let imageUrl = '';

        //delete old image from s3 and add new image
        const oldParticipant = await getParticipantById(participantId);
        if (req.file) {
            const imageKey = oldParticipant?.image?.split(`.amazonaws.com/`)[1] || null;
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
            if (req.file && oldParticipant)
                imageUrl = await uploadToS3(req.file, 'meals')
            participantData.image = imageUrl;
        }

        const data = await Participants.findByIdAndUpdate(
            participantId,
            participantData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Participant not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
};


export const generateParticipantCredentials = async (req) => {

    try {
        const participantId = req.params.id;
        const participant = await getParticipantById(participantId);
        if (participant.Status === "Pending") {
            throw new Error('Fill data first');
        }

        const userName = generateParticipantUserName(participant.Name.split(' ')[0]);
        const basePassword = generateParticipantPassword(participant.Name.split(' ')[0], participant.MemberDOB.toISOString().split('T')[0])
        const hashedPassword = await bcrypt.hash(basePassword, 10);

        const participantData = {
            Status: "Active",
            Username: userName,
            Password: hashedPassword,
        }

        const data = await Participants.findByIdAndUpdate(
            participantId,
            participantData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Participant Credentials not created');
        }

        return { userName: userName, password: basePassword };

    } catch (error) {
        throw error;
    }
};


export const deleteParticipant = async (participantId) => {
    try {
        const meal = await getParticipantById(participantId);
        if (meal?.image) {
            const imageKey = meal.image?.split(`.amazonaws.com/`)[1];
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
        }
        const data = await Participants.findByIdAndDelete(participantId);
        if (!data) {
            throw NotDeleted('Participant not deletd');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

// Participants requests methods
export const createParticipantRequest = async (req) => {
    try {
        const newParticipant = new ParticipantRequests(req.body);
        const data = await newParticipant.save();
        if (!data) {
            throw NotCreated('Participant Request not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllParticipantsRequests = async () => {
    try {
        const data = await ParticipantRequests.find();

        if (data.length === 0) {
            throw NotFound('Participants Requests not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateParticipantRequest = async (RequestID, Action) => {

    try {
        const request = await ParticipantRequests.findById(RequestID);
        if (!request) {
            throw new Error('Request not found');
        }
        if (request.Status === "Approved") {
            throw new Error('Already approved.');
        }
        if (Action === "Reject") {
            const rejectedRequest = await ParticipantRequests.findByIdAndUpdate(
                RequestID,
                { Status: 'Rejected' },
                { new: true }
            );
            // if (request.participantId) {
            //     const title = "Account Deletion Rejected";
            //     const body = "Your request to delete you account was rejected by support.";
            //     const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

            //     await notificationService.sendNotificationByID(title, body, request.participantId, imgURL);
            // } else {
            //     console.log(`No FCM token found for participant ${request.participantId}`);
            // }
            return rejectedRequest;
        }

        const { participantId, Type } = request;

        if (Type === 'Status') {
            const participant = await Participants.findById(participantId);
            if (!participant) {
                throw new Error('Customer not found');
            }

            const newStatus = participant.Status === 'Active' ? 'Inactive' : 'Active';
            const updatedCustomer = await Participants.findByIdAndUpdate(
                participantId,
                { Status: newStatus },
                { new: true }
            );

        } else if (Type === 'Delete') {

            const deletedCustomer = await Participants.findByIdAndDelete(participantId);

            if (!deletedCustomer) {
                throw new Error('Customer not found');
            }

            await deleteOrdersByParticipantsId(participantId);
            // await deleteReviewsByCustoemrID(participantId);

            // if (participantId) {
            //     const title = "Account Deletion Approved";
            //     const body = "Your request to delete you account was approved by support. Connect Supper https://yana.support/";
            //     const imgURL = "https://cdn-icons-png.flaticon.com/256/1478/1478938.png";

            //     await notificationService.sendNotificationByID(title, body, participantId, imgURL);
            // } else {
            //     console.log(`No FCM token found for participant ${participantId}`);
            // }
        } else if (Type === 'Update') {
            // Skip the action for Update requests
            console.log(`Request of type 'Update' skipped.`);
        }

        // Update the request status to Approved
        const updatedRequest = await ParticipantRequests.findByIdAndUpdate(
            RequestID,
            { Status: 'Approved' },
            { new: true }
        );

        return updatedRequest;
    } catch (error) {
        throw error;
    }
};


// Import Participant Method
export const importParticipants = async (req) => {
    try {
        const file = req.file;
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        const previousParticipantsChanges = await ParticipantsChanges.find();
        const previousParticipants = await Participants.find();

        const unionedData = formatUnionedData(combineAndSegregateRows(data));

        const insertedParticipants = [];
        if (previousParticipants.length === 0) {
            const data = await Participants.insertMany(unionedData);
            if (!data || data.length === 0) {
                throw NotCreated('Participants not created');
            }
            return data;
        }

        const previousParticipantsMap = new Map(
            previousParticipants.map((participant) => [String(participant.MemberID), participant])
        );

        for (const newParticipant of unionedData) {
            const existingParticipant = previousParticipantsMap.get(String(newParticipant.MemberID));
            if (existingParticipant) {
                const changes = compareParticipantFields(existingParticipant, newParticipant);

                if (changes.length > 0) {
                    const existingChanges = previousParticipantsChanges.find((change) =>
                        String(change.participantId) === String(existingParticipant._id)
                    );

                    let shouldUpdate = false;

                    changes.forEach((change) => {
                        const existingField = existingChanges?.fields.find(fieldChange => fieldChange.field === change.field);

                        if (existingField) {
                            if (existingField.previousValue !== change.previousValue || existingField.newValue !== change.newValue) {
                                shouldUpdate = true;
                            }
                        } else {
                            shouldUpdate = true;
                        }
                    });

                    if (shouldUpdate) {

                        if (existingParticipant.Status === 'Active') {
                            await saveParticipantChanges(existingParticipant, changes);
                        }

                        else if (existingParticipant.Status === 'Pending' || existingParticipant.Status === 'Approved') {
                            await updateExistingParticipant(existingParticipant, changes);
                        }

                        else if (existingParticipant.Status === 'Inactive') {
                            await updateExistingParticipant(existingParticipant, changes);
                            await updateExistingParticipantChanges(existingParticipant, changes);
                        }
                    }
                }
            } else {
                const participantToSave = new Participants(newParticipant);
                const savedParticipant = await participantToSave.save();
                insertedParticipants.push(savedParticipant);
            }
        }

        return insertedParticipants;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern);
        }
        throw error;
    }
};
