
const db = require("../config/database");

const Supplier = {

    getAll: (callback) => {
        db.all(
            `
            SELECT *
            FROM suppliers
            ORDER BY supplier_id DESC
            `,
            [],
            callback
        );
    },

    create: (data, callback) => {
        db.run(
            `
            INSERT INTO suppliers
            (supplier_name, phone, email, address)
            VALUES (?, ?, ?, ?)
            `,
            [
                data.supplier_name,
                data.phone,
                data.email,
                data.address
            ],
            function (err) {
                callback(err, this?.lastID);
            }
        );
    }

};

module.exports = Supplier;