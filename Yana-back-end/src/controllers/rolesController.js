import { Created, Retrieved, Updated, Deleted } from '../utils/customResponses.js';
import * as rolesService from '../services/rolesService.js';

export const createRole = async (req, res, next) => {
    try {
        const data = await rolesService.createRole(req);
        res.status(201).send(Created('Role created successfully', data));
    } catch (error) {
        next(error);
    }
};

export const getAllRoles = async (req, res, next) => {
    try {
        const data = await rolesService.getAllRoles();
        res.status(200).send(Retrieved('Roles retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const getPermissionsByRoleName = async (req, res, next) => {
    try {
        const data = await rolesService.getPermissionsByRoleName();
        res.status(200).send(Retrieved('Permissions retrieved successfully', data));
    } catch (error) {
        next(error);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const data = await rolesService.updateRole(req);
        res.status(200).send(Updated('Role updated successfully', data));
    } catch (error) {
        next(error);
    }
}

export const deleteRole = async (req, res, next) => {
    try {
        const roleId = req.params.id;
        const data =await rolesService.deleteRole(roleId);
        res.status(200).send(Deleted('Role deleted successfully'));
    }
    catch (error) {
        next(error);
    }
}

export const getRoleById = async (req, res, next) => {
    try {
        const roleId = req.params.id;
        const data = await rolesService.getRoleById(roleId);
        res.status(200).send(Retrieved('Role retrieved successfully', data));
    } catch (error) {
        next(error);
    }
}

