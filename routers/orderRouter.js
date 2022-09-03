const express = require('express');
const router = express.Router();

// Authorized user or admin or employee can see the orders

let testorder = {
    id: "hdshdhs",
    paymentId: "iwdibjdb",
    orderId: "bdjwsbdjwbjd",
    address: "Gaibandha",
    total:400,
    track: "On the way",
    deliveryVarificatin: "true"
};

const getOrders = async (req, res) => {
    try {
        console.log(testorder);
        res.status(200).json(testorder);
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

// get all orders of the customers (admin or employee)

// get single order of a user by his id 

// get unverified delivery order

// get 

// add order placed time

// in the track table we will have deivery time

router.route('/')
    .get(getOrders);


module.exports = router;