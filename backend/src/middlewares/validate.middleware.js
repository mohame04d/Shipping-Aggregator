import AppError from "../utils/appError.js";

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query
    });

    if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
        }));

        return next(
            new AppError("Validation failed", 400, errors)
        );
    }

    req.body = result.data.body;
    req.params = result.data.params;
    req.query = result.data.query;

    return next();
};

export default validate;
