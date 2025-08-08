import axios from "axios";
import { apiDelete, apiGet, apiPatch, apiPost } from "../../../config/axiosIntance";
import { showErrorAlert, showSuccessAlert } from "../../actions/alertActions";

const MAP_KEY = import.meta.env.VITE_GOOGLE_MAP_KEY;

const zonesMiddleware = {
    CreateNewZone: (payload) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPost("/v2/admin/zone/create", payload)

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    GetAllZones: () => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiGet("/v2/admin/zone/all");
                    if (response.success) {
                        resolve(response);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        };
    },

    GetZoneByZipCode: (zipCode) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.get(
                        `https://maps.googleapis.com/maps/api/geocode/json`,
                        {
                            params: {
                                address: zipCode,
                                key: MAP_KEY,
                                components: "country:pk",
                            },
                        }
                    );
                    if (response.data.status === "OK") {
                        resolve(response);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        };
    },

    UpdateZone: (zoneId, payload) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiPatch(`v2/admin/zone/${zoneId}`, payload)

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

    DeleteZone: (zoneId) => {
        return async (dispatch, getState) => {
            return new Promise(async (resolve, reject) => {
                try {
                    const response = await apiDelete(`/v2/admin/zone/${zoneId}`)

                    if (response.success) {
                        dispatch(showSuccessAlert(response?.message));
                        resolve(response);
                    }
                } catch (error) {
                    dispatch(showErrorAlert(error));
                    reject(error);
                }
            });
        };
    },

}

export default zonesMiddleware;