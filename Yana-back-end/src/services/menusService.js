import { deleteFromS3, uploadToS3 } from './s3BucketService.js';
import { DuplicateKey, NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';
import Menus from '../models/Menus.js';

export const createMenu = async (req) => {
    try {
        const imageUrl = await uploadToS3(req.file, 'menus');
        const newData = { image: imageUrl, ...req.body };

        const newMenu = new Menus(newData);
        const data = await newMenu.save();
        if (!data) {
            throw NotCreated('Menu not created');
        }
        return data;

    } catch (error) {
        if (error.code === 11000) {
            throw DuplicateKey(error.keyPattern)
        }
        throw error;
    }
}

export const getAllMenus = async () => {
    try {
        const data = await Menus.find();

        if (data.length === 0) {
            throw NotFound('Menus not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getMenuById = async (menuId) => {
    try {
        const data = await Menus.findById(menuId);
        if (!data) {
            throw NotFound('Menu not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const getMenuByIdWithMeals = async (menuId) => {
    try {
        const data = await Menus.findById(menuId).populate('meals');
        if (!data) {
            throw NotFound('Menu not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const updateMenu = async (req) => {

    try {
        const menuData = req.body;
        const menuId = req.params.id;
        let imageUrl = '';

        //delete old image from s3 and add new image
        const oldMenu = await getMenuById(menuId);
        if (req.file) {
            const imageKey = oldMenu?.image?.split(`.amazonaws.com/`)[1] || null;
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
            if (req.file && oldMenu)
                imageUrl = await uploadToS3(req.file, 'menus')
            menuData.image = imageUrl;
        }

        const data = await Menus.findByIdAndUpdate(
            menuId,
            menuData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Menu not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
};

export const deleteMenu = async (menuId) => {
    try {
        const menu = await getMenuById(menuId);
        if (menu?.image) {
            const imageKey = menu.image?.split(`.amazonaws.com/`)[1];
            if (imageKey) {
                await deleteFromS3(imageKey);
            }
        }
        const data = await Menus.findByIdAndDelete(menuId);
        if (!data) {
            throw NotDeleted('Menu not deletd');
        }
        return data;

    } catch (error) {
        throw error;
    }
};
