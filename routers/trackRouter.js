const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;

const getTrackById = async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const order = await prisma.track_Order.findUnique({
            where: {
                orderId: orderId,
            },
        })
        res.status(200).json(order);

    } catch (error) {
        console.log(error);
        res.send(error);
    }
};

const updateTrack = async (req, res) => {
    const orderId = req.params.orderId;
    const status = req.body.status;
    try {
        const order = await prisma.track_Order.update({
            where: {
                orderId: orderId,
            },
            data: {
                status: status,
            },
        })
        res.status(200).json(order)
    } catch(error) {
        console.log(error);
        res.send(error);
    }
    
};

router.route('/:orderId')
    .get(getTrackById)
    .patch(updateTrack);


// in the track table we will have deivery time


module.exports = router;