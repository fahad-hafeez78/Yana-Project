import { apiDelete, apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const roleMiddleware = {
  // Get All Roles
  GetAllRoles: () => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiGet('v2/admin/role/all');
          if (response?.success) {
            resolve(response);
          } else {
            reject('Failed to fetch roles, invalid response structure');
          }
        } catch (e) {
          console.log('Error fetching roles:', e);
          reject(e);
        }
      });
    };
  },

  GetRolesForCurrentUser: (type, ticketUserVendorId = null) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiGet(`v2/admin/role/dropdown-listing?type=${type}&ticket_vendor_userId=${ticketUserVendorId}`);
          if (response?.success) {
            resolve(response);
          }
        } catch (e) {
          dispatch(showErrorAlert(e));
          reject(e);
        }
      });
    };
  },

  // Create a New Role
  CreateNewRole: (roleData) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiPost('v2/admin/role/create', roleData);

          if (response && response.success) {
            dispatch(showSuccessAlert("Role created successfully"));
            resolve(response);
          }
        } catch (error) {
          dispatch(showErrorAlert(error));
          reject(error);
        }
      });
    };
  },

  // Update an Existing Role
  UpdateRole: (roleId, roleData) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiPut(`/v2/admin/role/${roleId}`, roleData);

          if (response && response.success) {
            dispatch(showSuccessAlert("Role updated successfully"));
            resolve(response);
          }
        } catch (error) {
          dispatch(showErrorAlert(error));
          reject(error);
        }
      });
    };
  },

  // Delete a Role
  DeleteRole: (roleId) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiDelete(`/admin/api/role/${roleId}`);

          if (response && response.success) {
            dispatch(showSuccessAlert("Role deleted successfully"));
            resolve(response);
          } else {
            dispatch(showErrorAlert("Error: Role not deleted"));
            reject(response || 'Failed to delete role');
          }
        } catch (e) {
          dispatch(showErrorAlert("Error: Role not deleted"));
          reject(e);
        }
      });
    };
  },

  GetRoleById: (roleId) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiGet(`/v2/admin/role/${roleId}`);
          if (response?.success) {
            resolve(response);
          } else {
            reject('Failed to fetch roles, invalid response structure');
          }
        } catch (error) {
          dispatch(showErrorAlert(error));
        }
      });
    };
  },

};

export default roleMiddleware;
