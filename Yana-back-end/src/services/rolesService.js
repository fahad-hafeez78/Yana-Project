import Roles from '../models/Roles.js';
import { NotCreated, NotDeleted, NotFound, NotUpdated } from '../utils/customErrors.js';

export const createRole = async (req) => {
    try {

        const newRoles = new Roles(req.body);
        const data = await newRoles.save();

        if (!data) {
            throw NotCreated('Role not created');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const getAllRoles = async () => {
    try {

        const data = await Roles.find();
        if (data.length === 0) {
            throw NotFound('Roles not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const getRoleById = async (roleId) => {
    try {
        const data = await Roles.findById(roleId);
        if (!data) {
            throw NotFound('Role not found');
        }
        return data;

    } catch (error) {
        throw error;
    }
}
export const getRoleByName = async (name) => {
    try {
        const role = await Roles.findOne({ name: name });
        return role;
    } catch (error) {
        throw new Error('Error retrieving role by name: ' + error.message);
    }
}

export const getPermissionsByRoleName = async (name) => {
    try {
        const role = await Roles.findOne({ name: name });
        return role.permissions;
    } catch (error) {
        throw new Error('Error retrieving role by name: ' + error.message);
    }
}

export const updateRole = async (req) => {
    try {
        const orderData = req.body;
        const roleId = req.params.id;

        const data = await Roles.findByIdAndUpdate(
            roleId,
            orderData,
            { new: true, runValidators: true }
        );

        if (!data) {
            throw NotUpdated('Role not updated');
        }
        return data;

    } catch (error) {
        throw error;
    }
}

export const deleteRole = async (roleId) => {
    try {

        const findRole = await getRoleById(roleId);
        const data = await Roles.findByIdAndDelete(roleId);

        if (!data) {
            throw NotDeleted("Role not deleted")
        }
        return data;

    }
    catch (error) {
        throw error;
    }
}
