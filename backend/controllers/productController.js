const productModel =
    require("../models/productModel");


// =========================
// HELPER
// =========================

function parseProductBody(body) {

    const productName =
        typeof body.product_name === "string"
            ? body.product_name.trim()
            : "";


    const brand =
        typeof body.brand === "string"
            ? body.brand.trim()
            : "";


    const description =
        typeof body.description === "string"
            ? body.description.trim()
            : "";


    const specifications =
        typeof body.specifications === "string"
            ? body.specifications.trim()
            : "";


    const image =
        typeof body.image === "string"
            ? body.image.trim()
            : "";


    // CATEGORY

    let categoryId = null;


    if (
        body.category_id !== undefined &&
        body.category_id !== null &&
        body.category_id !== ""
    ) {

        categoryId =
            Number(
                body.category_id
            );


        if (
            !Number.isSafeInteger(
                categoryId
            ) ||
            categoryId <= 0
        ) {

            return {
                error:
                    "category_id không hợp lệ"
            };

        }

    }


    // PRICE

    const price =
        Number(
            body.price
        );


    if (
        body.price === "" ||
        body.price === undefined ||
        body.price === null ||
        !Number.isFinite(price) ||
        price < 0
    ) {

        return {
            error:
                "Giá sản phẩm không hợp lệ"
        };

    }


    // STOCK

    const stockQuantity =
        body.stock_quantity === undefined ||
        body.stock_quantity === ""
            ? 0
            : Number(
                body.stock_quantity
            );


    if (
        !Number.isSafeInteger(
            stockQuantity
        ) ||
        stockQuantity < 0
    ) {

        return {
            error:
                "Số lượng tồn kho không hợp lệ"
        };

    }


    // LOW STOCK THRESHOLD

    const lowStockThreshold =
        body.low_stock_threshold === undefined ||
        body.low_stock_threshold === ""
            ? 5
            : Number(
                body.low_stock_threshold
            );


    if (
        !Number.isSafeInteger(
            lowStockThreshold
        ) ||
        lowStockThreshold < 0
    ) {

        return {
            error:
                "Ngưỡng cảnh báo tồn kho không hợp lệ"
        };

    }


    if (!productName) {

        return {
            error:
                "Tên sản phẩm không được để trống"
        };

    }


    return {

        product: {

            category_id:
                categoryId,

            product_name:
                productName,

            brand:
                brand || null,

            price:
                price,

            stock_quantity:
                stockQuantity,

            low_stock_threshold:
                lowStockThreshold,

            description:
                description || null,

            specifications:
                specifications || null,

            image:
                image || null

        }

    };

}


// =========================
// GET ALL PRODUCTS
// =========================

exports.getAllProducts =
    (req, res) => {

        const keyword =
            typeof req.query.keyword === "string"
                ? req.query.keyword.trim()
                : "";


        const brand =
            typeof req.query.brand === "string"
                ? req.query.brand.trim()
                : "";


        let categoryId = null;
        let minPrice = null;
        let maxPrice = null;


        // CATEGORY

        if (
            req.query.category_id !== undefined
        ) {

            categoryId =
                Number(
                    req.query.category_id
                );


            if (
                !Number.isSafeInteger(
                    categoryId
                ) ||
                categoryId <= 0
            ) {

                return res.status(400).json({

                    message:
                        "category_id không hợp lệ"

                });

            }

        }


        // MIN PRICE

        if (
            req.query.min_price !== undefined
        ) {

            if (
                req.query.min_price === ""
            ) {

                return res.status(400).json({

                    message:
                        "min_price không hợp lệ"

                });

            }


            minPrice =
                Number(
                    req.query.min_price
                );


            if (
                !Number.isFinite(
                    minPrice
                ) ||
                minPrice < 0
            ) {

                return res.status(400).json({

                    message:
                        "min_price không hợp lệ"

                });

            }

        }


        // MAX PRICE

        if (
            req.query.max_price !== undefined
        ) {

            if (
                req.query.max_price === ""
            ) {

                return res.status(400).json({

                    message:
                        "max_price không hợp lệ"

                });

            }


            maxPrice =
                Number(
                    req.query.max_price
                );


            if (
                !Number.isFinite(
                    maxPrice
                ) ||
                maxPrice < 0
            ) {

                return res.status(400).json({

                    message:
                        "max_price không hợp lệ"

                });

            }

        }


        if (
            minPrice !== null &&
            maxPrice !== null &&
            minPrice > maxPrice
        ) {

            return res.status(400).json({

                message:
                    "min_price không được lớn hơn max_price"

            });

        }


        const filters = {

            keyword,

            brand,

            category_id:
                categoryId,

            min_price:
                minPrice,

            max_price:
                maxPrice

        };


        productModel.getAll(
            filters,
            (err, rows) => {

                if (err) {

                    console.error(
                        err
                    );


                    return res.status(500).json({

                        message:
                            "Lỗi khi lấy danh sách sản phẩm"

                    });

                }


                res.json({

                    message:
                        "Lấy sản phẩm thành công",

                    total:
                        rows.length,

                    products:
                        rows

                });

            }
        );

    };


// =========================
// GET PRODUCT BY ID
// =========================

exports.getProductById =
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "ID sản phẩm không hợp lệ"

            });

        }


        productModel.getById(
            id,
            (err, product) => {

                if (err) {

                    console.error(
                        err
                    );


                    return res.status(500).json({

                        message:
                            "Lỗi khi lấy sản phẩm"

                    });

                }


                if (!product) {

                    return res.status(404).json({

                        message:
                            "Không tìm thấy sản phẩm"

                    });

                }


                res.json({

                    message:
                        "Lấy sản phẩm thành công",

                    product:
                        product

                });

            }
        );

    };


// =========================
// CREATE PRODUCT
// OWNER ONLY
// =========================

exports.createProduct =
    (req, res) => {

        const result =
            parseProductBody(
                req.body
            );


        if (result.error) {

            return res.status(400).json({

                message:
                    result.error

            });

        }


        productModel.create(
            result.product,
            (err, productId) => {

                if (err) {

                    console.error(
                        err
                    );


                    if (
                        err.code ===
                        "SQLITE_CONSTRAINT"
                    ) {

                        return res.status(400).json({

                            message:
                                "Danh mục không tồn tại hoặc dữ liệu sản phẩm không hợp lệ"

                        });

                    }


                    return res.status(500).json({

                        message:
                            "Không thể thêm sản phẩm"

                    });

                }


                productModel.getById(
                    productId,
                    (
                        getError,
                        product
                    ) => {

                        if (getError) {

                            console.error(
                                getError
                            );


                            return res.status(500).json({

                                message:
                                    "Đã thêm sản phẩm nhưng không thể lấy dữ liệu sản phẩm"

                            });

                        }


                        return res.status(201).json({

                            message:
                                "Thêm sản phẩm thành công",

                            product:
                                product

                        });

                    }
                );

            }
        );

    };


// =========================
// UPDATE PRODUCT
// OWNER ONLY
// =========================

exports.updateProduct =
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "ID sản phẩm không hợp lệ"

            });

        }


        const result =
            parseProductBody(
                req.body
            );


        if (result.error) {

            return res.status(400).json({

                message:
                    result.error

            });

        }


        productModel.update(
            id,
            result.product,
            (err, changes) => {

                if (err) {

                    console.error(
                        err
                    );


                    if (
                        err.code ===
                        "SQLITE_CONSTRAINT"
                    ) {

                        return res.status(400).json({

                            message:
                                "Danh mục không tồn tại hoặc dữ liệu sản phẩm không hợp lệ"

                        });

                    }


                    return res.status(500).json({

                        message:
                            "Không thể cập nhật sản phẩm"

                    });

                }


                if (changes === 0) {

                    return res.status(404).json({

                        message:
                            "Không tìm thấy sản phẩm"

                    });

                }


                productModel.getById(
                    id,
                    (
                        getError,
                        product
                    ) => {

                        if (getError) {

                            console.error(
                                getError
                            );


                            return res.status(500).json({

                                message:
                                    "Đã cập nhật nhưng không thể lấy dữ liệu sản phẩm"

                            });

                        }


                        res.json({

                            message:
                                "Cập nhật sản phẩm thành công",

                            product:
                                product

                        });

                    }
                );

            }
        );

    };


// =========================
// DELETE PRODUCT
// OWNER ONLY - SOFT DELETE
// =========================

exports.deleteProduct =
    (req, res) => {

        const id =
            Number(
                req.params.id
            );


        if (
            !Number.isSafeInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "ID sản phẩm không hợp lệ"

            });

        }


        productModel.deactivate(
            id,
            (err, changes) => {

                if (err) {

                    console.error(
                        err
                    );


                    return res.status(500).json({

                        message:
                            "Không thể xóa sản phẩm"

                    });

                }


                if (changes === 0) {

                    return res.status(404).json({

                        message:
                            "Không tìm thấy sản phẩm"

                    });

                }


                res.json({

                    message:
                        "Xóa sản phẩm thành công"

                });

            }
        );

    };