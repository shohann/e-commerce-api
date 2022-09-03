const express = require('express');
const cors = require('cors');
const app = express();
const userRouter = require('./routers/userRouter');
const productRouter = require('./routers/productRouter');
const categoryRouter = require('./routers/categoryRouter');
const cartRouter = require('./routers/cartRouter');
const profileRouter = require('./routers/profileRouter');
const paymentRouter = require('./routers/paymentRouter');
const reviewRouter = require('./routers/reviewRouter');
const orderRouter = require('./routers/orderRouter');
const orderDetailsRouter = require('./routers/orderDetailsRouter');
const trackRouter = require('./routers/trackRouter');



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', userRouter);
app.use('/api/products', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/review', reviewRouter);
app.use('/api/carts', cartRouter);
app.use('/api/profile', profileRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/order', orderDetailsRouter);
app.use('/api/orders', orderRouter);
app.use('/api/track', trackRouter);


module.exports = app;