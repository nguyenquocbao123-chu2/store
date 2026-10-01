const db = require("../config/database");

db.serialize(() => {

    db.run(`
        INSERT OR IGNORE INTO categories
        (category_id, category_name, description)
        VALUES
        (1, 'Điện thoại', 'Các sản phẩm điện thoại thông minh'),
        (2, 'Laptop', 'Laptop học tập, làm việc và gaming'),
        (3, 'Phụ kiện', 'Phụ kiện công nghệ')
    `);

    db.run(`
        INSERT OR IGNORE INTO products
        (
            product_id,
            category_id,
            product_name,
            brand,
            price,
            stock_quantity,
            low_stock_threshold,
            description,
            specifications
        )
        VALUES
        (
            1,
            1,
            'Samsung Galaxy S25',
            'Samsung',
            19990000,
            10,
            3,
            'Điện thoại Samsung',
            'RAM 12GB, Bộ nhớ 256GB'
        ),
        (
            2,
            2,
            'ASUS TUF Gaming',
            'ASUS',
            24990000,
            5,
            2,
            'Laptop gaming',
            'RAM 16GB, SSD 512GB'
        ),
        (
            3,
            3,
            'Chuột Logitech G502',
            'Logitech',
            1290000,
            2,
            5,
            'Chuột gaming',
            'USB, RGB'
        )
    `);

    console.log("Đã thêm dữ liệu mẫu.");
});