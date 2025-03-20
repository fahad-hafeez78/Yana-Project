import * as vendorsService from '../services/vendorsService.js';
import { uploadMiddleware } from '../services/s3BucketService.js';
import { Created, Deleted, Retrieved, Updated } from '../utils/customResponses.js';

export const createVendor = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {

            if (err) return next({ status: 400, message: err.message });
            
            const data = await vendorsService.createVendor(req);
            res.status(201).send(Created('Vendor created successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const getAllVendors = async (req, res, next) => {
    try {
        const data = await vendorsService.getAllVendors();
        res.status(200).send(Retrieved('Vendors retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};


export const updateVendor = async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
        try {
            const data = await vendorsService.updateVendor(req);
            res.status(200).send(Updated('Vendor updated successfully', data));

        } catch (error) {
            next(error);
        }
    });
};


export const deleteVendor = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const data = await vendorsService.deleteVendor(vendorId);
        res.status(200).send(Deleted('Vendor deleted successfully'));
    } catch (error) {
        next(error);
    }
};


export const getVendorById = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const data = await vendorsService.getVendorById(vendorId, next);
        res.status(200).send(Retrieved('Vendor retrieved successfully', data));

    } catch (error) {
        next(error);
    }
};

