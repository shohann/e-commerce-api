const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient;
const uploadFile = require('../middlewares/upload')
const cloudinary = require('../utils/cloudinary');
const { promisify } = require("util");
const fs = require("fs");
const unlink = promisify(fs.unlink);
const baseUrl = "http://localhost:3001/files/";
const { authorizeAccess } = require('../middlewares/authorize')
const admin = require('../middlewares/admin');

const setProduct = async (req, res) => {
  try {
    await uploadFile(req, res);
    const { name, stock, desc, categoryId } = req.body // because we called multer later..multer handles the from data
    // check already exist or not
    const stockInt = parseInt(stock)
    if (req.file === undefined) {
        return res.status(400).send({ message: "Please upload a file!" });
    }
    const originalName = req.file.originalname;;
    const localFilePath = req.file.path;
    const cloudFileInfo = await cloudinary.uploader.upload(localFilePath);
    const image = cloudFileInfo.secure_url;
    const cloudId = cloudFileInfo.public_id;
    const product = await prisma.product.create({
      data: {
          name: name,
          stock: stockInt,
          image: image,
          desc: desc,
          cloudId: cloudId,
          categoryId: categoryId,
      },
    });

    if (product) {
      await unlink(localFilePath);
    }

    console.log(originalName)

    res.status(200).json({
        message: "Uploaded the file successfully",
        product,
    });

  } catch (error) {
    console.log(error);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${originalName}. ${error}`,
    });

  };
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    if(!products) {
      res.send("Not Found");
    }
    res.status(200).json({ products: products });
  } catch(error) {
    res.send(error);
  };
};


const getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await prisma.product.findUnique({ where: { uuid: productId } });
    if (!product) {
      res.send("Not found");
    }
    res.status(200).json({ product: product });
  } catch(error) {
    console.log(error);
    res.send(error);
  }
};


const updateSingleProduct = async (req, res) => {
  const productId = req.params.productId;
  try {
    // fetch the old product
    const validProduct = await prisma.product.findUnique( { where: { uuid: productId }});
    if (!validProduct) {
      res.send("Product does not exist"); // check already exist or not
    }
    
   // Uppoad a new image for product
    await uploadFile(req, res);
    const { name, stock, desc, categoryId } = req.body // because we called multer later..multer handles the from data
    const oldCloudId = validProduct.cloudId; // getting old cloud from fetched product
    const stockInt = parseInt(stock) // convert the string into a integer
    if (req.file === undefined) {
        return res.status(400).send({ message: "Please upload a file!" }); // check new file
    }
    const originalName = req.file.originalname;
    const localFilePath = req.file.path;

    // Upload new image to the cloud
    const newCloudFileInfo = await cloudinary.uploader.upload(localFilePath);
    const newImage = newCloudFileInfo.secure_url;
    const newCloudId = newCloudFileInfo.public_id;

    // delete old file from cloud
    await cloudinary.uploader.destroy(oldCloudId); 

    // update in db 
    const updatedProduct = await prisma.product.update({
      where: {
        uuid: productId,
      },
      data: {
          name: name,
          stock: stockInt,
          image: newImage,
          desc: desc,
          cloudId: newCloudId,
          categoryId: categoryId,
      },
    });

    res.status(200).json({ upadatedProduct: updatedProduct})

  } catch(error) {
    console.log(error)
    res.send(error)
  };
};

const deleteSingleProduct = async (req, res) => {
  //Getting the product id for deletion
  const productId = req.params.productId;
  try {
    // Checking if the product exist or not
    const validProduct = await prisma.product.findUnique( { where: { uuid: productId }});
    if (!validProduct) {
      res.send("Product does not exist");
    }
    const cloudId = validProduct.cloudId; // Getting the cloud id if the product exist
    await cloudinary.uploader.destroy(cloudId); // delete the product image with cloud from cloud
    
    // delete the product from database
    const deleteProduct = await prisma.product.delete({
      where: {
        uuid: productId,
      },
    })

    // response 
    res.status(200).json({ id : productId, product: deleteProduct});
  } catch(error) {
    console.log(error);
    res.send(error);
  };
};

// const searchProducts = async (req, res) => {

// };



// const getListFiles = async (req, res) => {
//     const directoryPath = __basedir + "/resources/static/assets/uploads/";
  
//     fs.readdir(directoryPath, function (err, files) {
//       if (err) {
//         res.status(500).send({
//           message: "Unable to scan files!",
//         });
//       }
  
//       let fileInfos = [];
  
//       files.forEach((file) => {
//         fileInfos.push({
//           name: file,
//           url: baseUrl + file,
//         });
//       });
  
//       res.status(200).send(fileInfos);
//     });
//   };
  
  // const download = async (req, res) => {
  //   const fileName = req.params.name;
  //   const directoryPath = __basedir + "/resources/static/assets/uploads/";
  
  //   res.download(directoryPath + fileName, fileName, (err) => {
  //     if (err) {
  //       res.status(500).send({
  //         message: "Could not download the file. " + err,
  //       });
  //     }
  //   });
  // };


router.route('/')
    .post(authorizeAccess, admin, setProduct)
    .get(getAllProducts)

router.route('/:productId')
  .get(getSingleProduct)
  .put(authorizeAccess, admin, updateSingleProduct)
  .delete(authorizeAccess, admin, deleteSingleProduct)




// router.route('/files')
//     .get(getListFiles);
    
// router.route('/files/:name')
//     .get(download);


module.exports = router;