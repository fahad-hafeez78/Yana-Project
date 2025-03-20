export const NotFound = (message) => {
    const error = new Error(message || 'Not found');
    error.status = 404;
    return error;
};

export const NotCreated = (message) => {
    const error = new Error(message || 'Not created');
    error.status = 400;
    return error;
};

export const NotUpdated = (message) => {
    const error = new Error(message || 'Not updated');
    error.status = 400;
    return error;
};

export const NotDeleted = (message) => {
    const error = new Error(message || 'Not deleted');
    error.status = 400;
    return error;
};

export const Unauthorized = (message) => {
    const error = new Error(message || 'Unauthorized');
    error.status = 401;
    return error;
};

export const Forbidden = (message) => {
    const error = new Error(message || 'Forbidden');
    error.status = 403;
    return error;
};

export const InternalServerError = (message) => {
    const error = new Error(message || 'Internal server error');
    error.status = 500;
    return error;
};

export const BadRequest = (message) => {
    const error = new Error(message || 'Bad request');
    error.status = 400;
    return error;
};

export const DuplicateKey = (keyPattern) => {
    const duplicateField = Object.keys(keyPattern)[0];
    const error = new Error(`Duplicate field '${duplicateField}'.`);
    error.status = 409;
    return error;
};

export const Invalid = (message) => {
    const error = new Error(message || 'Invalid');
    error.status = 401;
    return error;
};