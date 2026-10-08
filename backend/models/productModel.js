const db = require("../config/database");


const productModel = {

    // =========================
    // GET ALL
    // =========================

    getAll(filters, callback) {

        let sql = `
            SELECT
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE p.status = 'active'
        `;

        const params = [];


        if (filters.keyword) {

            sql += `
                AND (
                    p.product_name LIKE ?
                    OR p.brand LIKE ?
                    OR p.description LIKE ?
                    OR p.specifications LIKE ?
                )
            `;

            const keyword =
                `%${filters.keyword}%`;

            params.push(
                keyword,
                keyword,
                keyword,
                keyword
            );
        }


        if (filters.brand) {

            sql += `
                AND p.brand LIKE ?
            `;

            params.push(
                `%${filters.brand}%`
            );
        }


        if (filters.category_id) {

            sql += `
                AND p.category_id = ?
            `;

            params.push(
                filters.category_id
            );
        }


        if (
            filters.min_price !== undefined &&
            filters.min_price !== null
        ) {

            sql += `
                AND p.price >= ?
            `;

            params.push(
                filters.min_price
            );
        }


        if (
            filters.max_price !== undefined &&
            filters.max_price !== null
        ) {

            sql += `
                AND p.price <= ?
            `;

            params.push(
                filters.max_price
            );
        }


        sql += `
            ORDER BY p.product_id DESC
        `;


        db.all(
            sql,
            params,
            callback
        );

    },


    // =========================
    // GET BY ID
    // =========================

    getById(id, callback) {

        const sql = `
            SELECT
                p.*,
                c.category_name
            FROM products p
            LEFT JOIN categories c
                ON p.category_id = c.category_id
            WHERE
                p.product_id = ?
                AND p.status = 'active'
        `;


        db.get(
            sql,
            [id],
            callback
        );

    },


    // =========================
    // CREATE
    // =========================

    create(product, callback) {

        const sql = `
            INSERT INTO products (
                category_id,
                product_name,
                brand,
                price,
                stock_quantity,
                low_stock_threshold,
                description,
                specifications,
                image,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `;


        const params = [

            product.category_id,

            product.product_name,

            product.brand,

            product.price,

            product.stock_quantity,

            product.low_stock_threshold,

            product.description,

            product.specifications,

            product.image

        ];


        db.run(
            sql,
            params,
            function (err) {

                if (err) {

                    return callback(
                        err
                    );

                }


                callback(
                    null,
                    this.lastID
                );

            }
        );

    },


    // =========================
    // UPDATE
    // =========================

    update(id, product, callback) {

        const sql = `
            UPDATE products

            SET
                category_id = ?,
                product_name = ?,
                brand = ?,
                price = ?,
                stock_quantity = ?,
                low_stock_threshold = ?,
                description = ?,
                specifications = ?,
                image = ?

            WHERE
                product_id = ?
                AND status = 'active'
        `;


        const params = [

            product.category_id,

            product.product_name,

            product.brand,

            product.price,

            product.stock_quantity,

            product.low_stock_threshold,

            product.description,

            product.specifications,

            product.image,

            id

        ];


        db.run(
            sql,
            params,
            function (err) {

                if (err) {

                    return callback(
                        err
                    );

                }


                callback(
                    null,
                    this.changes
                );

            }
        );

    },


    // =========================
    // SOFT DELETE
    // =========================

    deactivate(id, callback) {

        const sql = `
            UPDATE products

            SET status = 'inactive'

            WHERE
                product_id = ?
                AND status = 'active'
        `;


        db.run(
            sql,
            [id],
            function (err) {

                if (err) {

                    return callback(
                        err
                    );

                }


                callback(
                    null,
                    this.changes
                );

            }
        );

    },


    // =========================
    // LOW STOCK
    // =========================

    getLowStock(callback) {

        const sql = `
            SELECT
                p.product_id,
                p.product_name,
                p.brand,
                p.stock_quantity,
                p.low_stock_threshold,
                c.category_name

            FROM products p

            LEFT JOIN categories c
                ON p.category_id = c.category_id

            WHERE
                p.status = 'active'
                AND p.stock_quantity
                    <= p.low_stock_threshold

            ORDER BY
                p.stock_quantity ASC
        `;


        db.all(
            sql,
            [],
            callback
        );

    }

};


module.exports =
    productModel;