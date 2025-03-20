import { body, validationResult } from 'express-validator';

const validate = (method) => {
    switch (method) {
        case 'signup':
            return [
                body('name').notEmpty().withMessage('Name is required'),
                body('email').isEmail().withMessage('Invalid email'),
                body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
            ];
        case 'login':
            return [
                body('email').isEmail().withMessage('Invalid email'),
                body('password').notEmpty().withMessage('Password is required'),
            ];
        
        default:
            return [];
    }
};

const validateRequest = (method) => [
    ...validate(method),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];

export default validateRequest;