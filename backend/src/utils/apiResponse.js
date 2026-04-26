const apiResponse = (res, statusCode, data, message) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

module.exports = apiResponse;
