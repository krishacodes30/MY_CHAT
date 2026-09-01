// import jwt from "jsonwebtoken";
// import redisClient from "../config/redis.js";

// const authUser = async (req, res, next) => {
//     try {
//         const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

//         if (!token) {
//             return res.status(401).send({ error: 'Unauthorized User' });
//         }

//         const isBlackListed = await redisClient.get(token);

//         if (isBlackListed) {
//             res.cookie('token', '');
//             return res.status(401).send({ error: 'Unauthorized User' });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.log(error);
//         res.status(401).send({ error: 'Unauthorized User' });
//     }
// };

// export default authUser;
import jwt from 'jsonwebtoken'
import redisClient from '../config/redis.js'
import userModel from '../models/user.model.js'


const authUser = async (req, res, next) => {

    try {

        // ========================================================
        // GET TOKEN
        // ========================================================

        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(' ')[1]


        if (!token) {

            return res.status(401).json({
                error: 'Unauthorized User'
            })
        }


        // ========================================================
        // CHECK REDIS BLACKLIST
        // ========================================================

        const isBlackListed =
            await redisClient.get(token)


        if (isBlackListed) {

            return res.status(401).json({
                error: 'Unauthorized User'
            })
        }


        // ========================================================
        // VERIFY TOKEN
        // ========================================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            )


        console.log(
            'JWT PAYLOAD:',
            decoded
        )


        // ========================================================
        // FIND USER
        // ========================================================

        let user = null


        /*
         * Your JWT appears to contain email.
         *
         * Support both email and ID so this middleware
         * remains compatible if you later change your
         * login token structure.
         */

        if (decoded.email) {

            user =
                await userModel.findOne({
                    email: decoded.email
                })

        } else {

            const userId =
                decoded._id ||
                decoded.id ||
                decoded.userId


            if (userId) {

                user =
                    await userModel.findById(
                        userId
                    )
            }
        }


        // ========================================================
        // USER NOT FOUND
        // ========================================================

        if (!user) {

            console.log(
                'AUTH USER NOT FOUND:',
                decoded
            )


            return res.status(401).json({
                error: 'User not found'
            })
        }


        // ========================================================
        // ATTACH REAL USER TO REQUEST
        // ========================================================

        req.user = user


        console.log(
            'AUTHENTICATED USER:',
            user._id,
            user.email
        )


        next()

    } catch (error) {

        console.error(
            'AUTH ERROR:',
            error.message
        )


        return res.status(401).json({
            error: 'Invalid authentication token'
        })
    }
}


export default authUser