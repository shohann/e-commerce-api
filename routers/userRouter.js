const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const bcrypt = require('bcrypt');
const client = require('../utils/initRedis');
const admin = require('../middlewares/admin');
const { generateAccessToken, generateRefreshToken }= require('../utils/jwtHelper');
const { authorizeAccess, authorizeRefresh } = require('../middlewares/authorize')
const { loginValidationRules, signupValidationRules, validate } = require('../middlewares/validator');

const signUp = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: hashedPassword,
            }
        });
        const userId = user.id;
        const role = user.role;
        const accessToken =  await generateAccessToken(email, userId, role);
        const refreshToken = await generateRefreshToken(email, userId, role);

        // console.log(hashedPassword);
    
        res.status(200).json({
            user: user.id,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    } catch(err) {
        res.send(err)
    };
};


const logIn = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Find the user exists or not
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) return res.status(400).json({ message : "Invalid email or password" });

        // Checking is the password valid or not with database hashed password
        const validUser = await bcrypt.compare(password, user.password);
        if (!validUser)  return res.status(400).json({ message : "Invalid email or password" });
        
        // Token generation
        const userId = user.uuid; // getting the user id from db
        const role = user.role; // getting the user role from db
        const accessToken = await generateAccessToken(email, userId, role);
        const refreshToken = await generateRefreshToken(email, userId, role);

        // Resopnse
        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.uuid,
                email: email,
                role: role
            }
        });
    } catch(err) {
        res.send(err.messge);
    };
};

const refresh = async (req, res) => {
    // Decoded info from token
    const email = req.user.email;
    const id = req.user.id;
    const role = req.user.role;

    try {
        // Find the user exists or not
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) return res.status(400).json({ message : "user does not exist" });
        const accessToken = await generateAccessToken(email, id, role);
        const refreshToken = await generateRefreshToken(email, id, role);
        
        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken,
            user: {
                id: user.uuid,
                email: email,
                role: role
            }
        });
    } catch(err) {
        res.send(err)
    };
};

const logOut = async (req, res) => {
    const key = req.user.email;
    try {
        client.del(key)
        res.status(200).json( { email: email })
    } catch(err) {
        res.send(err)
    }
};

const testAuth = async (req, res) => {
    // localhost:3001/api/auth/test
    res.status(200).json({ message: req.user });
};

router.route('/test')
    .get(authorizeAccess, admin, testAuth); // requesting a resource

router.route('/signup')
    .post(signupValidationRules(), validate, signUp);

router.route('/login')
    .post(loginValidationRules(), validate, logIn);

router.route('/refresh')
    .get(authorizeRefresh, refresh);

router.route('/logout')
    .delete(authorizeRefresh, logOut);

module.exports = router;


// const signUp = async (req, res) => {
//     const accessToken = generateAccessToken(req.body.email);
//     const refreshToken = generateRefreshToken(req.body.email);
//     console.log(req.body.email)
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt)

//     console.log(hashedPassword);
  
//     res.status(200).json({
//         accessToken: accessToken,
//         refreshToken: refreshToken
//     });
// };