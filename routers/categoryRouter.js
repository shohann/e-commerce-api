const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const admin = require('../middlewares/admin');
const { authorizeAccess } = require('../middlewares/authorize')

// let testCategory = {};
// let testCategory2 = {
//     id: "gdgdgdgagdfifd",
//     categoryName: "Mobile"
// }

// Only an admin can use these routes

const setCategory = async (req, res) => {
    const { name } = req.body;

    try {
        // Check if the category already exist or not (can be use redis)

        // Creating a new category if it does not exist
        const category = await prisma.category.create({
            data: {
                name: name,
            }
        });
        res.status(200).json(category);
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

const getCategories = async (req, res) => {
    try {
        const category = await prisma.category.findMany(); // can be used redis
        if (!category) return res.status(400).json({ message : "user does not exist" });

        res.status(200).json(category);
    } catch(error) {
        res.status(500).json({
            error: error
        });
    };
};

// const getAllProductsByCategory = async (req, res) => {
//     const categoryId = req.params.categoryId;
//     console.log(categoryId)
//     try {
//       const users = await prisma.user.findMany({
//         where: {
//           categoryId: categoryId,
//         },
//       });
//     } catch(error) {
//       console.log(error)
//       res.send(error)
//     }
//   };

// get quantity

router.route('/')
    .get(getCategories) // all type of user can see the categoris
    .post(authorizeAccess, admin, setCategory);


// router.route('/categoryId')
// .get(getAllProductsByCategory);

module.exports = router;