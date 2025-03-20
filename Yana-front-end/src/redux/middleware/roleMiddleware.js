import { apiDelete, apiGet, apiPost, apiPut } from '../../config/axiosIntance';
import { showErrorAlert, showSuccessAlert } from '../actions/alertActions';

const roleMiddleware = {
  // Get All Roles
  GetAllRoles: () => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiGet('roles/get');

          // Check if response is valid and contains 'success' and 'data'
          if (response && response.success && response.data) {
            resolve(response);
          } else {
            // Reject if response does not have the expected structure
            reject('Failed to fetch roles, invalid response structure');
          }
        } catch (e) {
          console.log('Error fetching roles:', e);
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
          const response = await apiPost('roles/create', roleData);

          if (response && response.success) {
            dispatch(showSuccessAlert("Role created successfully"));
            resolve(response);
          } else {
            dispatch(showErrorAlert("Error: Role not created"));
            reject(response || 'Failed to create role');
          }
        } catch (e) {
          dispatch(showErrorAlert("Error: Role not created"));
          reject(e);
        }
      });
    };
  },

  // Update an Existing Role
  UpdateRole: (roleId, roleData) => {
    return async (dispatch, getState) => {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await apiPut(`roles/update/${roleId}`, roleData);

          if (response && response.success) {
            dispatch(showSuccessAlert("Role updated successfully"));
            resolve(response);
          } else {
            dispatch(showErrorAlert("Error: Role not updated"));
            reject(response || 'Failed to update role');
          }
        } catch (e) {
          dispatch(showErrorAlert("Error: Role not updated"));
          reject(e);
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
  }

};

export default roleMiddleware;
