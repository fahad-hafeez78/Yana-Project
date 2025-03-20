import { deleteFromS3, uploadToS3 } from './s3BucketService.js';
import { DuplicateKey, NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import Vendors from '../models/Vendors.js';
import Meals from '../models/Meals.js';

export const createVendor = async (req) => {
    try {

        const imageUrl = await uploadToS3(req.file, 'vendors');
        const newData = { W9Path: imageUrl, ...req.body, Address: JSON.parse(req.body.Address) };
        const newVendor = new Vendors(newData);
        const data = await newVendor.save();
        if (!data) {
            throw NotCreated('Vendor not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllVendors = async () => {
    try {
        const data = await Vendors.find();

        if (data.length === 0) {
            throw NotFound('Vendors not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getVendorById = async (vendorId) => {
    try {
        const data = await Vendors.findById(vendorId);
        if (!data) {
            throw NotFound('Vendor not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateVendor = async (req) => {

    try {

        const vendorData = {
            ...req.body,
            Address: req.body?.Address ? JSON.parse(req.body.Address) : undefined,
        }
        const vendorId = req.params.id;
        let imageUrl = '';

        //delete old image from s3 and add new image
        const oldVendor = await getVendorById(vendorId);
        if (req.file) {
            const imageKey = oldVendor?.W9Path?.split(`.amazonaws.com/`)[1] || null;
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
            if (req.file && oldVendor)
                imageUrl = await uploadToS3(req.file, 'vendors')
            vendorData.W9Path = imageUrl;
        }

        const data = await Vendors.findByIdAndUpdate(
            vendorId,
            vendorData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Vendor not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deleteVendor = async (vendorId) => {
    try {
        const vendor = await getVendorById(vendorId);
        if (vendor?.image) {
            const imageKey = vendor.image?.split(`.amazonaws.com/`)[1];
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
        }
        const data = await Vendors.findByIdAndDelete(vendorId);
        if (!data) {
            throw NotDeleted('Vendor not deletd');
        }

        await Meals.deleteMany({ vendorId });

        return data;

    } catch (error) {
        throw error;
    }
};
