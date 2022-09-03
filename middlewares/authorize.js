const jwt = require('jsonwebtoken');
const client = require('../utils/initRedis');
const { promisify } = require("util");
jwt.verifyAsync = promisify(jwt.verify);

// can i make it a asyc function? and sign function 
const authorizeAccess = async (req, res, next) => {
    // Storing token from the header And check it is valid or not
    let tokenHeader = req.header('Authorization');
    if (!tokenHeader) res.status(401).send('Access denied.No token provided');
    const token = tokenHeader.split(" ")[1].trim()

    // Decoding the token
    try {
        const decoded = await jwt.verifyAsync(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).send('Invalid Token');
    }
};

const authorizeRefresh = async (req, res, next) => {
    // Storing token from the header And check it is valid or not
    let tokenHeader = req.header('Authorization');
    if (!tokenHeader) res.status(401).send('Access denied.No token provided');
    const token = tokenHeader.split(" ")[1].trim();

    // Decoding the token
    try {
        const decoded = await jwt.verifyAsync(token, process.env.REFRESH_SECRET);
        const oldRefreshToken =  await client.get(decoded.email);
        req.user = decoded;

        if (oldRefreshToken === token) {
            next(); 
        } else {
            throw new Error
        }
    } catch (err) {
        return res.status(400).send('Invalid Token');
    }
};

module.exports = {
    authorizeAccess,
    authorizeRefresh
};


// OLD
// module.exports = function (req, res, next) {
//     // Storing token from the header And check it is valid or not
//     let token = req.header('Authorization');
//     if (!token) res.status(401).send('Access denied.No token provided');

//     // Decoding the token
//     try {
//         const decoded = jwt.verify(token.split(" ")[1].trim(), process.env.JWT_SECRET_KEY);
//         req.user = decoded;
//         next();
//     } catch (err) {
//         return res.status(400).send('Invalid Token');
//     }
// };


