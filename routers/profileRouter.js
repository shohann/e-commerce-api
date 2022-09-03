const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const { authorizeAccess } = require('../middlewares/authorize')


// Only a authorize user can access this routes.update and delete operation will be done with authorize middleware.because payload has the userId 

// admin can see all the profiles

// i will also put validation here


const setProfile = async (req, res) => {
    const userId = req.user.id;
    const { phone, address } = req.body;

    try {
        const profile = await prisma.profile.create({
            data: {
                phone: phone,
                address: address,
                userId: userId,
            }
        });
        res.status(200).json({ profile });
    } catch (error) { 
        res.status(500).json({
            error: error
        });
    };
};

const getProfile = async (req, res) => {
    const userId = req.user.id
    try {
        const profile = await prisma.profile.findUnique({ where: { userId: userId } });
        if (!profile) return res.status(400).json({ message : "Profile does not exist" });
        res.status(200).json(profile)
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

const updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { phone, address } = req.body;

    console.log({ userId, phone, address });
    
    try {
        const profile = await prisma.profile.findUnique({ where: { userId: userId } });
        if (!profile) return res.status(400).json({ message : "Profile does not exist" });

        const updatedProfile = await prisma.profile.update({
            where: {
              userId: userId,
            },
            data: {
                phone: phone,
                address: address,
                userId: userId,
            },
          })
        
        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
};

router.route('/')
    .post(authorizeAccess ,setProfile)
    .get(authorizeAccess, getProfile)
    .put(authorizeAccess, updateProfile);

module.exports = router;