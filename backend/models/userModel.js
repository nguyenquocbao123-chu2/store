
const db = require("../config/database");

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({
                lastID: this.lastID,
                changes: this.changes
            });
        });
    });
}

const User = {

    findByEmail(email) {
        return get(
            `
            SELECT *
            FROM users
            WHERE email = ? COLLATE NOCASE
            `,
            [email]
        );
    },

    findById(userId) {
        return get(
            `
            SELECT
                user_id,
                full_name,
                email,
                phone,
                address,
                role,
                created_at
            FROM users
            WHERE user_id = ?
            `,
            [userId]
        );
    },

    createCustomer(data) {
        return run(
            `
            INSERT INTO users (
                full_name,
                email,
                password,
                phone,
                address,
                role
            )
            VALUES (?, ?, ?, ?, ?, 'customer')
            `,
            [
                data.full_name,
                data.email,
                data.password,
                data.phone,
                data.address
            ]
        );
    }

};

module.exports = User;