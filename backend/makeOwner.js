const db = require("./config/database");


const email = process.argv[2];


if (!email) {

    console.log(
        "Vui lòng nhập email tài khoản."
    );

    console.log(
        "Ví dụ: node makeOwner.js owner@uma.vn"
    );

    process.exit(1);

}


db.run(
    `
        UPDATE users
        SET role = 'owner'
        WHERE email = ?
    `,
    [email],
    function (err) {

        if (err) {

            console.error(
                "Lỗi cập nhật role:",
                err.message
            );

            db.close();

            return;

        }


        if (this.changes === 0) {

            console.log(
                "Không tìm thấy tài khoản:",
                email
            );

        } else {

            console.log(
                "Đã chuyển tài khoản thành OWNER:"
            );

            console.log(email);

        }


        db.close();

    }
);