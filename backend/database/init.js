const db = require("../config/database");

db.serialize(() => {

    // =========================
    // USERS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            role TEXT NOT NULL DEFAULT 'customer'
                CHECK(role IN ('customer', 'owner')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // =========================
    // CATEGORIES
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name TEXT UNIQUE NOT NULL,
            description TEXT
        )
    `);

    // =========================
    // PRODUCTS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            product_name TEXT NOT NULL,
            brand TEXT,
            price REAL NOT NULL CHECK(price >= 0),
            stock_quantity INTEGER NOT NULL DEFAULT 0
                CHECK(stock_quantity >= 0),
            low_stock_threshold INTEGER DEFAULT 5,
            description TEXT,
            specifications TEXT,
            image TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (category_id)
                REFERENCES categories(category_id)
                ON DELETE SET NULL
        )
    `);

    // =========================
    // CARTS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS carts (
            cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
                ON DELETE CASCADE
        )
    `);

    // =========================
    // CART ITEMS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS cart_items (
            cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            cart_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1
                CHECK(quantity > 0),

            UNIQUE(cart_id, product_id),

            FOREIGN KEY (cart_id)
                REFERENCES carts(cart_id)
                ON DELETE CASCADE,

            FOREIGN KEY (product_id)
                REFERENCES products(product_id)
                ON DELETE CASCADE
        )
    `);

    // =========================
    // ORDERS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_amount REAL NOT NULL CHECK(total_amount >= 0),
            receiver_name TEXT NOT NULL,
            receiver_phone TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(user_id)
        )
    `);

    // =========================
    // ORDER DETAILS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS order_details (
            order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            price REAL NOT NULL CHECK(price >= 0),

            FOREIGN KEY (order_id)
                REFERENCES orders(order_id)
                ON DELETE CASCADE,

            FOREIGN KEY (product_id)
                REFERENCES products(product_id)
        )
    `);

    // =========================
    // REVIEWS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            order_id INTEGER NOT NULL,
            rating INTEGER NOT NULL
                CHECK(rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            UNIQUE(user_id, product_id, order_id),

            FOREIGN KEY (user_id)
                REFERENCES users(user_id),

            FOREIGN KEY (product_id)
                REFERENCES products(product_id),

            FOREIGN KEY (order_id)
                REFERENCES orders(order_id)
        )
    `);

    // =========================
    // SUPPLIERS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS suppliers (
            supplier_id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            address TEXT
        )
    `);

    // =========================
    // IMPORTS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS imports (
            import_id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER NOT NULL,
            total_amount REAL NOT NULL DEFAULT 0,
            note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (supplier_id)
                REFERENCES suppliers(supplier_id)
        )
    `);

    // =========================
    // IMPORT DETAILS
    // =========================
    db.run(`
        CREATE TABLE IF NOT EXISTS import_details (
            import_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
            import_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL CHECK(quantity > 0),
            import_price REAL NOT NULL CHECK(import_price >= 0),

            FOREIGN KEY (import_id)
                REFERENCES imports(import_id)
                ON DELETE CASCADE,

            FOREIGN KEY (product_id)
                REFERENCES products(product_id)
        )
    `);

    console.log("Đã tạo toàn bộ bảng SQLite.");
});