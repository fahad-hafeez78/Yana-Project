export const Created = (message, data = null) => {
    return {
        success: true,
        status: 201,
        message: message || 'Created successfully',
        data: data || null
    };
};

export const Updated = (message, data = null) => {
    return {
        success: true,
        status: 200,
        message: message || 'Updated successfully',
        data: data || null
    };
};

export const Deleted = (message) => {
    return {
        success: true,
        status: 200,
        message: message || 'Deleted successfully'
    };
};

export const Retrieved = (message, data = null) => {
    return {
        success: true,
        status: 200,
        message: message || 'Retrieved successfully',
        data: data || null
    };
};

// export const ListRetrieved = (message, data = []) => {
//     return {
//         success: true,
//         status: 200,
//         message: message || 'List retrieved successfully',
//         data: data || []
//     };
// };

export const NoContent = (message) => {
    return {
        success: true,
        status: 204,
        message: message || 'No content available'
    };
};
