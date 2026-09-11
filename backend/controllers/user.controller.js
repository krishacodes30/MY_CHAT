// import redisClient from '../config/redis.js';
// import userModel from '../models/user.model.js';
// import * as userService from '../services/user.service.js';
// import { validationResult } from 'express-validator';
// // import redisClient from '../services/redis.service.js';


// export const createUserController = async (req, res) => {

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }
//     try {
//         const user = await userService.createUser(req.body);

//         const token = await user.generateJWT();//

//         delete user._doc.password;

//         res.status(201).json({ user, token });
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

// export const loginController = async (req, res) => {
//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             message: errors.array()[0].msg
//         });
//     }

//     try {
//         const { email, password } = req.body;

//         const user = await userModel
//             .findOne({ email })
//             .select('+password');

//         // USER DOES NOT EXIST
//         if (!user) {
//             return res.status(404).json({
//                 code: 'USER_NOT_FOUND',
//                 message: 'Account not found. Please sign up first.'
//             });
//         }

//         const isMatch = await user.isValidPassword(password);

//         // WRONG PASSWORD
//         if (!isMatch) {
//             return res.status(401).json({
//                 code: 'INVALID_CREDENTIALS',
//                 message: 'Invalid email or password.'
//             });
//         }

//         const token = await user.generateJWT();

//         delete user._doc.password;

//         return res.status(200).json({
//             user,
//             token
//         });

//     } catch (err) {
//         console.error('LOGIN ERROR:', err);

//         return res.status(500).json({
//             message: 'Something went wrong while logging in.'
//         });
//     }
// };
// // export const loginController = async (req, res) => {
// //     const errors = validationResult(req);

// //     if (!errors.isEmpty()) {
// //         return res.status(400).json({
// //             errors: errors.array()
// //         });
// //     }

// //     try {

// //         const { email, password } = req.body;

// //         const user = await userModel
// //             .findOne({ email })
// //             .select('+password');

// //         // USER DOES NOT EXIST
// //         if (!user) {
// //             return res.status(404).json({
// //                 code: 'USER_NOT_FOUND',
// //                 message: 'Account not found. Please sign up first.'
// //             });
// //         }

// //         const isMatch =
// //             await user.isValidPassword(password);

// //         // WRONG PASSWORD
// //         if (!isMatch) {
// //             return res.status(401).json({
// //                 code: 'INVALID_CREDENTIALS',
// //                 message: 'Invalid email or password.'
// //             });
// //         }

// //         const token =
// //             await user.generateJWT();

// //         delete user._doc.password;

// //         res.status(200).json({
// //             user,
// //             token
// //         });

// //     } catch (err) {

// //         console.log(err);

// //         res.status(400).json({
// //             message: err.message
// //         });
// //     }
// // };

// export const profileController = async (req, res) => {

//     res.status(200).json({
//         user: req.user
//     });

// }

// export const logoutController = async (req, res) => {
//     try {

//         const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ];

//         redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

//         res.status(200).json({
//             message: 'Logged out successfully'
//         });


//     } catch (err) {
//         console.log(err);
//         res.status(400).send(err.message);
//     }
// }

// export const getAllUsersController = async (req, res) => {
//     try {

//         const loggedInUser = await userModel.findOne({
//             email: req.user.email
//         })

//         const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

//         return res.status(200).json({
//             users: allUsers
//         })

//     } catch (err) {

//         console.log(err)

//         res.status(400).json({ error: err.message })

//     }
// }

import redisClient from '../config/redis.js';
import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';


// =========================
// REGISTER
// =========================
export const createUserController = async (req, res) => {

    const errors = validationResult(req);

    // Validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    try {

        const user = await userService.createUser(req.body);

        const token = user.generateJWT();

        delete user._doc.password;

        return res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user,
            token
        });

    } catch (error) {

        console.log('REGISTER ERROR:', error);

        // Duplicate email
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                code: 'EMAIL_EXISTS',
                message: 'An account with this email already exists. Please login.'
            });
        }

        return res.status(400).json({
            success: false,
            code: 'REGISTRATION_FAILED',
            message: error.message || 'Registration failed. Please try again.'
        });
    }
};


// =========================
// LOGIN
// =========================
export const loginController = async (req, res) => {

    const errors = validationResult(req);

    // Validation errors
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    try {

        let { email, password } = req.body;

        // Normalize email
        email = email.trim().toLowerCase();

        // Find user
        const user = await userModel
            .findOne({ email })
            .select('+password');

        // User doesn't exist
        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Account not found. Please sign up first.'
            });
        }

        // Check password
        const isMatch = await user.isValidPassword(password);

        // Wrong password
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                code: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT
        const token = user.generateJWT();

        delete user._doc.password;

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user,
            token
        });

    } catch (error) {

        console.log('LOGIN ERROR:', error);

        return res.status(400).json({
            success: false,
            code: 'LOGIN_FAILED',
            message: error.message || 'Login failed. Please try again.'
        });
    }
};


// =========================
// PROFILE
// =========================
export const profileController = async (req, res) => {

    return res.status(200).json({
        success: true,
        user: req.user
    });

};


// =========================
// LOGOUT
// =========================
export const logoutController = async (req, res) => {

    try {

        const authHeader = req.headers.authorization;

        const token =
            req.cookies?.token ||
            (authHeader?.startsWith('Bearer ')
                ? authHeader.split(' ')[1]
                : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                code: 'NO_TOKEN',
                message: 'No authentication token found.'
            });
        }

        await redisClient.set(
            token,
            'logout',
            'EX',
            60 * 60 * 24
        );

        res.clearCookie('token');

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {

        console.log('LOGOUT ERROR:', error);

        return res.status(400).json({
            success: false,
            code: 'LOGOUT_FAILED',
            message: error.message || 'Logout failed.'
        });
    }
};


// =========================
// GET ALL USERS
// =========================
export const getAllUsersController = async (req, res) => {

    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        });

        if (!loggedInUser) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: 'Logged-in user not found.'
            });
        }

        const allUsers = await userService.getAllUsers({
            userId: loggedInUser._id
        });

        return res.status(200).json({
            success: true,
            users: allUsers
        });

    } catch (error) {

        console.log('GET USERS ERROR:', error);

        return res.status(400).json({
            success: false,
            code: 'GET_USERS_FAILED',
            message: error.message
        });
    }
};