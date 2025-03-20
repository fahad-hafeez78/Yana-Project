import bcrypt from 'bcrypt';
import { deleteFromS3, uploadToS3 } from './s3BucketService.js';
import { DuplicateKey, NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import Users from '../models/Users.js';
import * as userServices from '../services/rolesService.js';
import generateRandomPassword from '../utils/passwordGenerator.js';

export const createUser = async (req) => {
    try {
        const userName = req.body.email.split('@')[0];
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            ...req.body,
            Address: req.body?.Address ? JSON.parse(req.body.Address) : undefined,
            userName : userName,
            password : hashedPassword
        }
        
        const newUser = new Users(userData);
        const data = await newUser.save();
        if (!data) {
            throw NotCreated('User not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllUsers = async () => {
    try {
        const data = await Users.find();

        if (data.length === 0) {
            throw NotFound('Users not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const data = await Users.findById(userId);
        if (!data) {
            throw NotFound('User not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateUser = async (req) => {

    try {
        const userData = {
            ...req.body,
            Address: req.body?.Address ? JSON.parse(req.body.Address) : undefined,
        }
        // const userData = req.body;
        const userId = req.params.id;
        let imageUrl = '';

        //delete old image from s3 and add new image
        const oldUser = await getUserById(userId);
        if (req.file) {
            const imageKey = oldUser?.image?.split(`.amazonaws.com/`)[1] || null;
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
            if (req.file && oldUser)
                imageUrl = await uploadToS3(req.file, 'users')
            userData.image = imageUrl;
        }
        const permissions = await userServices.getPermissionsByRoleName(userData.Role);

        const data = await Users.findByIdAndUpdate(
            userId,
            userData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('User not updated');
        }
        return { ...data.toObject(), permissions: permissions || [] }

    } catch (error) {
        throw error;
    }
};

export const updatePassword = async (req) => {

    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.id;

        const user = await getUserById(userId);
        if (!user) {
            return { success: false, message: 'Admin not found' };
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return { success: false, message: 'Old password is incorrect' };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const data = await Users.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('User password not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const user = await getUserById(userId);
        if (user?.image) {
            const imageKey = user.image?.split(`.amazonaws.com/`)[1];
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
        }
        const data = await Users.findByIdAndDelete(userId);
        if (!data) {
            throw NotDeleted('User not deletd');
        }
        return data;

    } catch (error) {
        throw error;
    }
};
