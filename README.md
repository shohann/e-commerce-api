# e-commerce-api

An API for online e-commerce system

## Features:

- Authentication
- Products listing
- Order placements
- Sending Email
- Sending SMS
- Payment
- File upload

## Technology Stack:

- Node js
- Express Js
- PostgreSQL
- Redis

## Entity Relationship Diagram:

![[diagram.svg]]

## Default urls:

- Login User : <br/>
  localhost:3001/api/auth/login
- Register User : <br/>
  localhost:3001/api/auth/signup
- Get Refresh Token : <br/>
  localhost:3001/api/auth/refresh
- Set a profile : <br/>
  localhost:3001/api/profile
- Get a profile : <br/>
  localhost:3001/api/profile
- Update a profile : <br/>
  localhost:3001/api/profile

* Set a Category
   localhost:3001/api/category
* Get all categories
   localhost:3001/api/category

* Set a  product
  localhost:3001/api/products
* Get a product
  localhost:3001/api/products/:productId
* Get all products
  localhost:3001/api/products
* Update a product
  localhost:3001/api/products/:productId
* Delete a product
 localhost:3001/api/products/:productId

* Set a cart item
 localhost:3001/api/carts
* Update a cart item
  localhost:3001/api/carts

* Make an order by payment
  localhost:3001/api/payment/order

*  Get all orders
 localhost:3001/api/orders

* Track a order by id
 localhost:3001/api/track/:orderId

* Verify a order delivery
 localhost:3001/api/track/verify/:orderId


## Usage

"/.env" update the values/settings to your own

## Install Dependencies

```
npm install
```

## Run App

```
# Run in dev mode
npm start

```


