const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const client = require('../utils/initRedis');
const admin = require('../middlewares/admin');
const { generateAccessToken, generateRefreshToken, generateVerificationToken, generateResetToken }= require('../utils/jwtHelper');
const { authorizeAccess, authorizeRefresh } = require('../middlewares/authorize')
const { loginValidationRules, signupValidationRules, validate } = require('../middlewares/validator');
const { promisify } = require("util");
jwt.verifyAsync = promisify(jwt.verify);
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;  
const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
oAuth2Client.setCredentials({refresh_token: refreshToken});

const signUp = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = await generateVerificationToken(email)
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: 'cse.170201013@gmail.com',
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: 'Verification <cse.170201013@gmail.com>',
            to: email,
            subject: "Verification Link",
            text: verificationToken,
            html: `<h1>Hello the code is 72778 ${verificationToken}</h1>`

        };
        await transporter.sendMail(mailOptions);
        const user = JSON.stringify({ name: name, email: email, password: hashedPassword })
        await client.set(email, user, { EX: 2000 });

        res.status(200).json({'message': 'Verification email has been sent'})
    } catch (error) {
        res.send(error)
    } 
}

const resendVerificationEmail = async (req, res) => {
    const email = req.body.email;

    try {
        const validUser = client.get(email)
        if (!validUser) res.send('User Does not exist')
        const verificationToken = await generateVerificationToken(email)
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: 'cse.170201013@gmail.com',
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: 'Verification <cse.170201013@gmail.com>',
            to: email,
            subject: "Verification Link",
            text: verificationToken,
            html: `<h1>Hello the code is 72778 ${verificationToken}</h1>`

        };
        await transporter.sendMail(mailOptions);

        res.send('email has been sent')
    } catch(error) {
        console.log(error);
        res.send(error)
    }

}

const verifyEmail = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = await jwt.verifyAsync(token, process.env.VERIFICATION_SECRET);
        const userEmail = decoded.email;
        const validUserJSON = await client.get(userEmail);
        const { name, email, password } = JSON.parse(validUserJSON);
        const user = await prisma.user.create({
            data: {
                name: name,
                email: email,
                password: password,
            }
        });
        const userId = user.uuid;
        const role = user.role;
        const accessToken =  await generateAccessToken(email, userId, role);
        const refreshToken = await generateRefreshToken(email, userId, role);
        await client.del(email);

        res.status(200).json({
            userId: userId,
            message: 'User Has been verified',
            accessToken: accessToken,
            refreshToken: refreshToken
        });

    } catch(error) {
        res.send('invalid token') 
    }
}

// Forget Password
const forgetPassword = async (req, res) => {
    const email = req.body.email;
    try {
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) return res.status(400).json({ message : "Invalid User" });
        const secret = user.password;
        const userId = user.uuid;
        // console.log(secret);
        const token = await generateResetToken(email, secret);
        const resetLink = `localhost:3001/api/auth/reset/${userId}/${token}`;

        //send email
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: 'cse.170201013@gmail.com',
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: 'Verification <cse.170201013@gmail.com>',
            to: email,
            subject: "Verification Link",
            text: resetLink,
            html: `<h1>Hello ${resetLink}</h1>`

        };
        await transporter.sendMail(mailOptions);

        res.send(`Email has been sent to ${email}`);
    } catch(error) {
        console.log(error);
        res.send(error);
    }
    
}

// Change Password
const changePassword = async (req, res) => {
    const email = req.body.email;
    const currentPassword = req.body.password;

    try {
        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            res.status(400).json({ message : "Invalid User" });
        }
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (validPassword) {
            res.status(400).json({ message : "Invalid Email or Password" });
        }
        const secret = user.password;
        const userId = user.uuid;
        const token = await generateResetToken(email, secret);
        const resetLink = `localhost:3001/api/auth/reset/${userId}/${token}`;

        //send email
        const accessToken = await oAuth2Client.getAccessToken();
        const transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: 'cse.170201013@gmail.com',
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const mailOptions = {
            from: 'Verification <cse.170201013@gmail.com>',
            to: email,
            subject: "Verification Link",
            text: resetLink,
            html: `<h1>Hello ${resetLink}</h1>`

        };
        await transporter.sendMail(mailOptions);

        res.send(`Email has been sent to ${email}`);
    } catch(error) {
        console.log(error);
        res.send(error);
    }
}

// Reset Password
const resetPassword = async (req, res) => {
    // if token is valid then allow to update password in the database
    const { userId, token } = req.params;
    const newPassword = req.body.password;

    try {
        const user = await prisma.user.findUnique({ where: { uuid: userId } });
        if (!user) return res.status(400).json({ message : "Invalid User" });
        const secret = process.env.PASSWORD_RESET + user.password;
        const decoded = await jwt.verifyAsync(token, secret);
        const updatedUser = await prisma.user.update({
            where: {
              uuid: userId,
            },
            data: {
              password: newPassword,
            },
        })

        const email = updatedUser.email;
        const role = updatedUser.role;
        const accessToken =  await generateAccessToken(email, userId, role);
        const refreshToken = await generateRefreshToken(email, userId, role);

        // return email, access token, refresh token, newPass will not return but email
        res.status(200).json({
            accessToken: accessToken,
            refreshToken: refreshToken,
            updatedUser: updatedUser
        })
    } catch(error) {
        console.log('Invalid Token');
        res.send('Invalid Token');
    }
}


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
    res.status(200).json({ message: req.user });
};

router.route('/test')
    .get(authorizeAccess, admin, testAuth); 

router.route('/signup')
    .post(signupValidationRules(), validate, signUp);

router.route('/verify/:token')
    .get(verifyEmail)

router.route('/resend')
    .post(resendVerificationEmail)

router.route('/forget')
    .post(forgetPassword);

router.route('/change')
    .post(changePassword)

router.route('/reset/:userId/:token')
    .put(resetPassword)

router.route('/login')
    .post(loginValidationRules(), validate, logIn);

router.route('/refresh')
    .get(authorizeRefresh, refresh);

router.route('/logout')
    .delete(authorizeRefresh, logOut);

module.exports = router;

