const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const admin = require('../middlewares/admin');
const { authorizeAccess } = require('../middlewares/authorize')



// Create a cart item -User Id Product id needed
const setCartItem = async (req, res) => {
    const {  productId, price } = req.body;
    const userId = req.user.id;

    try {
        const cartItem = await prisma.cart.create({
            data: {
              userId: userId,
              productId: productId,
              cost: price,
            },
        });

        res.status(200).json(cartItem);
    } catch(error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    };
};

// Get all the cart item.Only Authorize admin user can see all of his cart items

const getAllCartItem = async (req, res) => {
    // Authorize user can see all of his cart items
    try {
        const allCarts = await prisma.cart.findMany()
        res.status(200).json(allCarts);
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

// cart items for individual userID -> only authorze user can do it
// price er bapar ta thik korte hobe ..eta kaj korse na
// Update cart item for individual userID -> only authorze user can do it
// its  complicated with frontend
const updateCartItem = async (req, res) => {
    const cartId = req.params.cartId;
    const quantity = req.body.quantity;
    try {
        const cart = await prisma.cart.findUnique({ where: { uuid: cartId } });
        if (!cart) {
            res.send("Not found");
        }

        const updatedCartItem = await prisma.cart.update({
            where: {
              uuid: cartId,
            },
            data: {
              quantity: quantity,
            },
          })
        res.status(200).json(updatedCartItem);
    } catch(error) {
        console.log(error);
        res.status(500).json({
            error: error
        });
    }
};

// delete cart item for individual userID -> only authorze user can do it
const deleteCartItem = async (req, res) => {
    const cartId = req.params.cartId;
    try {
        const deletedCartItem = await prisma.cart.delete({
            where: {
              uuid: cartId,
            },
          })
        res.status(200).json(deletedCartItem);
    } catch(error) {
        console.log(error)
        res.status(500).json({
            error: error
        });
    }
};


router.route('/')
    .post(authorizeAccess,setCartItem)
    .get(authorizeAccess, getAllCartItem)

router.route('/:cartId')
    .patch(authorizeAccess, updateCartItem)
    .delete(authorizeAccess, deleteCartItem);


module.exports = router;