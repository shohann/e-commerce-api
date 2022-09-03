const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_KEY_TEST)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const admin = require('../middlewares/admin');
const { authorizeAccess } = require('../middlewares/authorize')


// {
//     "userId": "dsggsgdgsgds8382y8",
//     "amount": 5000,
//     "number": "4242424242424242",
//     "exp_month": 8,
//     "exp_year": 2023,
//     "cvc": "314",
//     "currency": "usd"
// }


const testOrder = async(req, res) => {
    const userId = req.user.id;

    try {
        const userCartItems = await prisma.cart.findMany({
            where: {
                userId: userId,
            }
        });

        const orderDetailsFilter = userCartItems.map( (product) => {
            return {
                productId: product.productId,
                userId: product.userId,
                cost: product.cost,
                quantity: product.quantity
            };
        });

        const orderDetail = await prisma.order_Detail.createMany({
            data: orderDetailsFilter,
        });

        const sum = await prisma.cart.aggregate({
            _sum: {
              cost: true,
            },
            where: {
                userId: userId,

            },
            
        });

        // Fnd the user profile
        const userProfile = await prisma.profile.findUnique({
            where: {
              userId: userId,
            },
        })

        // cretate an order with with sum an user id 
        const orderCreate = await prisma.orders.create({
            data: {
              userId: userId,
              address : userProfile.address,
              totalCost:  sum._sum.cost,
            },
        })

        // create a track user Id and status only 
        const trackCreate = await prisma.track_Order.create({
            data: {
                orderId: orderCreate.uuid,
                address: userProfile.address,
            }
        })
        // delete all the cart of thee user

          
        console.log('Average age:' + sum._sum.cost)

        

    // res.send( orderDetailsFilter )
    res.send( trackCreate )

    } catch(error) {    
        console.log(error)
        res.send(error)
    }

}




const charge = async (req, res) => {
    const userId = req.user.id;

    const {  amount, number, exp_month, exp_year, cvc, currency } = req.body;

    console.log(userId);

    try {
        const paymentMethod = await stripe.paymentMethods.create({
            type: 'card',
            card: {
              number: number,
              exp_month: exp_month,
              exp_year: exp_year,
              cvc: cvc,
            },
        });
    
        const paymentIntent = await stripe.paymentIntents.create({
            payment_method: paymentMethod.id,
            amount: amount,
            currency: currency,
            confirm: true,
            payment_method_types: ['card'],
        });
    
        if(paymentIntent) {
            const userCartItems = await prisma.cart.findMany({
                where: {
                    userId: userId,
                }
            });
    
            const orderDetailsFilter = userCartItems.map( (product) => {
                return {
                    productId: product.productId,
                    userId: product.userId,
                    cost: product.cost,
                    quantity: product.quantity
                };
            });
    
            const orderDetail = await prisma.order_Detail.createMany({
                data: orderDetailsFilter,
            });
    
            const sum = await prisma.cart.aggregate({
                _sum: {
                  cost: true,
                },
                where: {
                    userId: userId,
    
                },
                
            });
    
            // Fnd the user profile
            const userProfile = await prisma.profile.findUnique({
                where: {
                  userId: userId,
                },
            })
    
            // cretate an order with with sum an user id 
            const orderCreate = await prisma.orders.create({
                data: {
                  userId: userId,
                  address : userProfile.address,
                  totalCost:  sum._sum.cost,
                },
            })
    
            // create a track user Id and status only 
            const trackCreate = await prisma.track_Order.create({
                data: {
                    orderId: orderCreate.uuid,
                    address: userProfile.address,
                }
            })
            // delete all the cart of thee user
    
              
            console.log('Average age:' + sum._sum.cost)
            // create order
            // create order details from carts
            // create track table
        }
    
        
    
        res.send('Order has been placed')
    } catch(err) {
        console.log(err);
        res.send(err);
    }
}


// const charge = async (req, res) => {
//     const paymentMethod = await stripe.paymentMethods.create({
//         type: 'card',
//         card: {
//           number: '4242424242424242',
//           exp_month: 8,
//           exp_year: 2023,
//           cvc: '314',
//         },
//     });

//     const paymentIntent = await stripe.paymentIntents.create({
//         payment_method: paymentMethod.id,
//         amount: 2000,
//         currency: 'usd',
//         confirm: true,
//         payment_method_types: ['card'],
//     });

//     res.send(paymentIntent)
// }

router.route('/')
    .post(authorizeAccess, charge);

router.route('/order')
    .get(authorizeAccess, testOrder)
    
module.exports = router;