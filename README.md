# Ecommerce Backend API

A production-style Ecommerce REST API built with Node.js, Express, MongoDB and Mongoose.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Stripe
- Winston
- Helmet
- Express Rate Limit
- Express Validator

## Features

- User Authentication
- JWT Authorization
- Product CRUD
- Category Management
- Product Search
- Filtering
- Sorting
- Pagination
- Shopping Cart
- Orders
- Order Cancellation
- Wishlist
- Reviews & Ratings
- Admin Dashboard
- Stripe Payment Integration
- Error Handling
- Logging
- Security Middleware

## API

Base URL:

https://your-backend.vercel.app

## Main Endpoints

### Auth

POST /api/auth/register

POST /api/auth/login

### Products

GET /api/products

GET /api/products/:id

POST /api/products

PUT /api/products/:id

DELETE /api/products/:id

### Cart

GET /api/cart

POST /api/cart

PUT /api/cart/:productId

DELETE /api/cart/:productId

### Orders

GET /api/orders/my-orders

POST /api/orders

GET /api/orders/:id

PUT /api/orders/:id/cancel

### Wishlist

GET /api/wishlist

POST /api/wishlist

DELETE /api/wishlist/:productId

### Reviews

POST /api/reviews

GET /api/reviews/product/:productId

## Environment Variables

MONGO_URI=
JWT_SECRET=
FRONTEND_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NODE_ENV=