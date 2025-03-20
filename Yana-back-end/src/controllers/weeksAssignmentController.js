import * as weeksAssignmentService from '../services/weeksAssignmentService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createWeeksAssignment = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            
            if (err) return next({ status: 400, message: err.message });

            const data = await weeksAssignmentService.createWeeksAssignment(req.body);
            res.status(201).send(Created('WeeksAssignment created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllWeeksAssignments = async (req, res, next) => {
    try {
        const data = await weeksAssignmentService.getAllWeeksAssignments();
        res.status(200).send(Retrieved('WeekAssignments retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const updateWeeksAssignment = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await weeksAssignmentService.updateWeeksAssignment(req.body);
            res.status(200).send(Updated('WeekAssignment updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};
