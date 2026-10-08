const express =
    require("express");

const router =
    express.Router();


const productController =
    require(
        "../controllers/productController"
    );


const {
    authenticate,
    requireRole
} = require(
    "../middleware/authMiddleware"
);


// =========================
// PUBLIC
// =========================

router.get(
    "/",
    productController.getAllProducts
);


router.get(
    "/:id",
    productController.getProductById
);


// =========================
// OWNER ONLY
// =========================

router.post(
    "/",
    authenticate,
    requireRole("owner"),
    productController.createProduct
);


router.put(
    "/:id",
    authenticate,
    requireRole("owner"),
    productController.updateProduct
);


router.delete(
    "/:id",
    authenticate,
    requireRole("owner"),
    productController.deleteProduct
);


module.exports =
    router;