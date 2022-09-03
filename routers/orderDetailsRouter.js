const exprees = require('express');
const router = exprees.Router();

let testOrderDetail = {
    id: "djsdjsgjd",
    orderid: "dwhdwhwd",
    userId: "jdwsjhdhs",
    price: 888,
    quantity: 1
};

const getOrderDetail = async (req, res) => {
    try {
        console.log(testOrderDetail);
        console.log(req.params.orderId)
        res.status(200).json(testOrderDetail);
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

router.route('/:orderId').get(getOrderDetail);

module.exports = router;