const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = path.join(
  __dirname,
  "../database/electronic_store.db"
);

function businessError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      DB_PATH,
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) return reject(err);

        db.configure("busyTimeout", 5000);
        resolve(db);
      }
    );
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// Mỗi thao tác ghi sử dụng kết nối và transaction riêng
async function withDatabase(work, transaction = false) {
  const db = await openDatabase();
  let inTransaction = false;

  try {
    await run(db, "PRAGMA foreign_keys = ON");

    if (transaction) {
      await run(db, "BEGIN IMMEDIATE TRANSACTION");
      inTransaction = true;
    }

    const result = await work(db);

    if (inTransaction) {
      await run(db, "COMMIT");
      inTransaction = false;
    }

    return result;
  } catch (err) {
    if (inTransaction) {
      try {
        await run(db, "ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "Lỗi rollback giỏ hàng:",
          rollbackError.message
        );
      }
    }

    throw err;
  } finally {
    await closeDatabase(db);
  }
}

async function getCartId(db, userId, create = false) {
  let cart = await get(
    db,
    "SELECT cart_id FROM carts WHERE user_id = ?",
    [userId]
  );

  if (!cart && create) {
    await run(
      db,
      "INSERT OR IGNORE INTO carts (user_id) VALUES (?)",
      [userId]
    );

    cart = await get(
      db,
      "SELECT cart_id FROM carts WHERE user_id = ?",
      [userId]
    );
  }

  return cart?.cart_id || null;
}

const Cart = {
  // 1. Xem giỏ hàng
  getCart(userId) {
    return withDatabase(async (db) => {
      const cartId = await getCartId(db, userId);

      if (!cartId) {
        return {
          items: [],
          total_quantity: 0,
          total_amount: 0,
        };
      }

      const rows = await all(
        db,
        `
        SELECT
          ci.cart_item_id,
          ci.product_id,
          ci.quantity,
          p.product_name,
          p.brand,
          p.price,
          p.image,
          p.stock_quantity,
          p.status
        FROM cart_items ci
        JOIN products p
          ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.cart_item_id DESC
        `,
        [cartId]
      );

      const items = rows.map((item) => ({
        ...item,
        subtotal: item.quantity * item.price,
      }));

      return {
        items,
        total_quantity: items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        total_amount: items.reduce(
          (sum, item) => sum + item.subtotal,
          0
        ),
      };
    });
  },

  // 2. Thêm sản phẩm
  addItem(userId, productId, quantity) {
    return withDatabase(async (db) => {
      const product = await get(
        db,
        `
        SELECT
          product_id,
          product_name,
          stock_quantity,
          status
        FROM products
        WHERE product_id = ?
        `,
        [productId]
      );

      if (!product || product.status !== "active") {
        throw businessError(
          "Sản phẩm không tồn tại hoặc ngừng bán",
          404
        );
      }

      const cartId = await getCartId(
        db,
        userId,
        true
      );

      const existing = await get(
        db,
        `
        SELECT cart_item_id, quantity
        FROM cart_items
        WHERE cart_id = ? AND product_id = ?
        `,
        [cartId, productId]
      );

      const newQuantity =
        (existing?.quantity || 0) + quantity;

      if (
        !Number.isSafeInteger(newQuantity) ||
        newQuantity > 1000
      ) {
        throw businessError(
          "Số lượng mỗi sản phẩm tối đa 1000"
        );
      }

      if (newQuantity > product.stock_quantity) {
        throw businessError(
          `${product.product_name} chỉ còn ${product.stock_quantity} sản phẩm`,
          409
        );
      }

      if (existing) {
        await run(
          db,
          `
          UPDATE cart_items
          SET quantity = ?
          WHERE cart_item_id = ?
          `,
          [newQuantity, existing.cart_item_id]
        );
      } else {
        const count = await get(
          db,
          `
          SELECT COUNT(*) AS total
          FROM cart_items
          WHERE cart_id = ?
          `,
          [cartId]
        );

        if (count.total >= 30) {
          throw businessError(
            "Giỏ hàng tối đa 30 loại sản phẩm"
          );
        }

        await run(
          db,
          `
          INSERT INTO cart_items
            (cart_id, product_id, quantity)
          VALUES (?, ?, ?)
          `,
          [cartId, productId, quantity]
        );
      }

      return { product_id: productId, quantity: newQuantity };
    }, true);
  },

  // 3. Sửa số lượng
  updateItem(userId, cartItemId, quantity) {
    return withDatabase(async (db) => {
      const item = await get(
        db,
        `
        SELECT
          ci.cart_item_id,
          p.product_name,
          p.stock_quantity,
          p.status
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.cart_id
        JOIN products p ON ci.product_id = p.product_id
        WHERE ci.cart_item_id = ?
          AND c.user_id = ?
        `,
        [cartItemId, userId]
      );

      if (!item) {
        throw businessError(
          "Không tìm thấy sản phẩm trong giỏ",
          404
        );
      }

      if (item.status !== "active") {
        throw businessError(
          "Sản phẩm đã ngừng bán",
          409
        );
      }

      if (quantity > item.stock_quantity) {
        throw businessError(
          `${item.product_name} chỉ còn ${item.stock_quantity} sản phẩm`,
          409
        );
      }

      await run(
        db,
        `
        UPDATE cart_items
        SET quantity = ?
        WHERE cart_item_id = ?
        `,
        [quantity, cartItemId]
      );

      return { cart_item_id: cartItemId, quantity };
    }, true);
  },

  // 4. Xóa sản phẩm khỏi giỏ
  removeItem(userId, cartItemId) {
    return withDatabase(async (db) => {
      const result = await run(
        db,
        `
        DELETE FROM cart_items
        WHERE cart_item_id = ?
          AND cart_id IN (
            SELECT cart_id
            FROM carts
            WHERE user_id = ?
          )
        `,
        [cartItemId, userId]
      );

      if (result.changes !== 1) {
        throw businessError(
          "Không tìm thấy sản phẩm trong giỏ",
          404
        );
      }

      return { removed: true };
    }, true);
  },

  // 5. Đặt hàng từ giỏ và trừ tồn kho
  checkout(userId, shipping) {
    return withDatabase(async (db) => {
      const cartId = await getCartId(db, userId);

      if (!cartId) {
        throw businessError("Giỏ hàng đang trống");
      }

      const items = await all(
        db,
        `
        SELECT
          ci.product_id,
          ci.quantity,
          p.product_name,
          p.price,
          p.stock_quantity,
          p.status
        FROM cart_items ci
        JOIN products p
          ON ci.product_id = p.product_id
        WHERE ci.cart_id = ?
        ORDER BY ci.cart_item_id
        `,
        [cartId]
      );

      if (items.length === 0 || items.length > 30) {
        throw businessError(
          "Danh sách sản phẩm không hợp lệ"
        );
      }

      let totalAmount = 0;

      for (const item of items) {
        if (item.status !== "active") {
          throw businessError(
            `${item.product_name} đã ngừng bán`,
            409
          );
        }

        if (item.stock_quantity < item.quantity) {
          throw businessError(
            `${item.product_name} chỉ còn ${item.stock_quantity} sản phẩm`,
            409
          );
        }

        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;

        if (
          !Number.isFinite(subtotal) ||
          !Number.isSafeInteger(totalAmount)
        ) {
          throw businessError(
            "Tổng tiền đơn hàng không hợp lệ"
          );
        }
      }

      const result = await run(
        db,
        `
        INSERT INTO orders (
          user_id,
          total_amount,
          receiver_name,
          receiver_phone,
          shipping_address,
          payment_method,
          status
        )
        VALUES (?, ?, ?, ?, ?, 'cod', 'confirmed')
        `,
        [
          userId,
          totalAmount,
          shipping.receiver_name,
          shipping.receiver_phone,
          shipping.shipping_address,
        ]
      );

      const orderId = result.lastID;

      for (const item of items) {
        await run(
          db,
          `
          INSERT INTO order_details (
            order_id,
            product_id,
            quantity,
            price
          )
          VALUES (?, ?, ?, ?)
          `,
          [
            orderId,
            item.product_id,
            item.quantity,
            item.price,
          ]
        );

        const updateResult = await run(
          db,
          `
          UPDATE products
          SET stock_quantity = stock_quantity - ?
          WHERE product_id = ?
            AND status = 'active'
            AND stock_quantity >= ?
          `,
          [
            item.quantity,
            item.product_id,
            item.quantity,
          ]
        );

        if (updateResult.changes !== 1) {
          throw businessError(
            `Không đủ tồn kho: ${item.product_name}`,
            409
          );
        }
      }

      // Chỉ xóa giỏ sau khi đã tạo đơn và trừ kho
      await run(
        db,
        "DELETE FROM cart_items WHERE cart_id = ?",
        [cartId]
      );

      return {
        order_id: orderId,
        total_amount: totalAmount,
        status: "confirmed",
        payment_method: "cod",
      };
    }, true);
  },
};

module.exports = Cart;