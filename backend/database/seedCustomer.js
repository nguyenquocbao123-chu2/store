
const db = require("../config/database");
const bcrypt = require("bcryptjs");

async function seedCustomer() {
    const passwordHash = await bcrypt.hash("Demo@12345", 10);

    db.run(
        `
        INSERT OR IGNORE INTO users
        (full_name, email, password, phone, address, role)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            "Khách hàng Demo",
            "demo.customer@example.com",
            passwordHash,
            "0900000000",
            "Địa chỉ thử nghiệm",
            "customer"
        ],
        function (err) {
            if (err) {
                console.error("Lỗi tạo tài khoản:", err.message);
                db.close();
                return;
            }

            db.get(
                `
                SELECT user_id, full_name, email, role
                FROM users
                WHERE email = ?
                `,
                ["demo.customer@example.com"],
                (err, user) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("Tài khoản thử nghiệm:", user);
                    }

                    db.close();
                }
            );
        }
    );
}

seedCustomer().catch(console.error);