const jwt = require('jsonwebtoken');
const { promisify } = require("util");
jwt.signAsync = promisify(jwt.sign);
const client = require('./initRedis');


const generateAccessToken = async (email, id, role) => {
    const payload = { email: email, id: id, role: role };
    const secret = process.env.JWT_SECRET_KEY;
    const options = { expiresIn: "72h" };

    try {
        const token = await jwt.signAsync(payload, secret, options);
        await client.set(email, token, { EX: 2000 });

        return token;
    } catch(err) {
        console.log(err)
    }
};

const generateRefreshToken = async(email, id, role) => {
    const payload = { email: email, id: id, role: role };
    const secret = process.env.REFRESH_SECRET;
    const options = { expiresIn: "72h" };
    try {
        const token = await jwt.signAsync(payload, secret, options);
        await client.set(email, token, { EX: 2000 });

        return token;
    } catch(err) {
        console.log(err)
    }
};

module.exports = {
    generateAccessToken,
    generateRefreshToken
}




//JWT has both sync and async version.The async version is based on call backs.but for our convinience we have promisify the function using utill library of node.js.And thse applies also for node redis function.node redis functions are also callback based

// for using promis we must use try catch here..

// async await is just sytactic suger over promise

// learn the promise architecture in javascript

// Learn how to work with these call back based library.And whats the best practice of using these.

// learn rdis best practce 

// better error handle with status code ..better structure



// try catch er vitore jkono ekta kaj na korle err dibe ...r baki op gulo cancel hobe



// Sync
// const generateAccessToken = (email) => {
//     const token = jwt.sign(
//         {
//             email: email,
//         },
//         process.env.JWT_SECRET_KEY,
//         {
//             expiresIn: "72h"
//         }
//     )

//     return token;
// };

// const generateRefreshToken = (email) => {
//     const token = jwt.sign(
//         {
//             email: email,
//         },
//         process.env.REFRESH_SECRET,
//         {
//             expiresIn: "72h"
//         }
//     )

//     return token;
// };


//JWT async 


// const generateAccessToken = async (email) => {
//     const payload = { email: email };
//     const secret = process.env.JWT_SECRET_KEY;
//     const options = { expiresIn: "72h" };

//     try {
//         const token = await jwt.signAsync(payload, secret, options);

//         JWT.sign(payload, secret, options, (err, token) => {
//             if (err) {
//               console.log(err.message)
//               reject(createError.InternalServerError())
//               return
//             }
//             resolve(token)
//         })

//         client.set('janoar', 'wswsw', function(err) {
//             throw new Error(err)
//         });

//         console.log(`These are tokens ${token}`);
//         return token;
//     } catch(err) {
//         console.log(err)
//     }
// };