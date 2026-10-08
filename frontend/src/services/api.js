const API_URL = "http://localhost:5000/api";


async function request(endpoint, options = {}) {

    // Lấy JWT đã lưu sau khi đăng nhập
    const token =
        localStorage.getItem("token");


    // Header mặc định
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };


    // Nếu đã đăng nhập thì gửi JWT
    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );


    const data = await response
        .json()
        .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Có lỗi xảy ra khi gọi API"
        );

    }


    return data;
}


// =========================
// SẢN PHẨM
// =========================

export function getProducts(filters = {}) {

    const params =
        new URLSearchParams();

    if (filters.keyword) {

        params.append(
            "keyword",
            filters.keyword
        );

    }

    if (filters.category_id) {

        params.append(
            "category_id",
            filters.category_id
        );

    }

    if (filters.brand) {

        params.append(
            "brand",
            filters.brand
        );

    }

    if (
        filters.min_price !== undefined &&
        filters.min_price !== ""
    ) {

        params.append(
            "min_price",
            filters.min_price
        );

    }

    if (
        filters.max_price !== undefined &&
        filters.max_price !== ""
    ) {

        params.append(
            "max_price",
            filters.max_price
        );

    }

    const queryString =
        params.toString();

    return request(
        queryString
            ? `/products?${queryString}`
            : "/products"
    );

}


export function getProductById(id) {

    return request(
        `/products/${id}`
    );

}

// =========================
// PRODUCT - OWNER
// =========================

export function createProduct(productData) {

    return request(
        "/products",
        {
            method: "POST",

            body: JSON.stringify(
                productData
            )
        }
    );

}

export function updateProduct(
    id,
    productData
) {

    return request(
        `/products/${id}`,
        {
            method: "PUT",

            body: JSON.stringify(
                productData
            )
        }
    );

}

export function deleteProduct(id) {

    return request(
        `/products/${id}`,
        {
            method: "DELETE"
        }
    );

}


// =========================
// AUTH
// =========================
export function register(
    full_name,
    email,
    password,
    phone,
    address
) {

    return request(
        "/auth/register",
        {
            method: "POST",

            body: JSON.stringify({
                full_name,
                email,
                password,
                phone,
                address
            })
        }
    );

}

export function login(
    email,
    password
) {

    return request(
        "/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password
            })
        }
    );

}



// =========================
// THÔNG TIN TÀI KHOẢN
// =========================

export function getMe() {

    return request(
        "/auth/me"
    );

}
// =========================
// ORDER
// =========================

export function createOrder(orderData) {

    return request(
        "/orders",
        {
            method: "POST",

            body: JSON.stringify(
                orderData
            )
        }
    );

}

export function getInventoryAlerts() {
  return request("/inventory/alerts");
}
// Lấy danh sách nhà cung cấp
export function getSuppliers() {
  return request("/suppliers");
}

// Thêm nhà cung cấp mới
export function createSupplier(data) {
  return request("/suppliers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
// Lấy danh sách phiếu nhập
export function getImports() {
  return request("/imports");
}

// Tạo phiếu nhập mới
export function createImport(data) {
  return request("/imports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
// Danh sách tồn kho
export function getInventory() {
  return request("/inventory");
}

// Lịch sử biến động tồn kho
export function getInventoryMovements() {
  return request("/inventory/movements");
}

// Cập nhật ngưỡng cảnh báo
export function updateInventoryThreshold(id, threshold) {
  return request(`/inventory/${id}/threshold`, {
    method: "PATCH",
    body: JSON.stringify({
      low_stock_threshold: threshold,
    }),
  });
}
// Owner - danh sách đơn hàng
export function getAdminOrders() {
  return request("/orders/admin");
}

// Owner - chi tiết đơn hàng
export function getAdminOrderDetail(id) {
  return request(`/orders/admin/${id}`);
}

// Owner - cập nhật trạng thái đơn hàng
export function updateAdminOrderStatus(id, status) {
  return request(`/orders/admin/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
// Khách hàng - xem lịch sử đơn hàng
export function getMyOrders() {
  return request("/orders/my");
}

// Khách hàng - xem chi tiết đơn hàng
export function getMyOrderDetail(id) {
  return request(`/orders/my/${id}`);
}
// Xem giỏ hàng
export function getCart() {
  return request("/cart");
}

// Thêm sản phẩm vào giỏ
export function addToCart(productId, quantity = 1) {
  return request("/cart/items", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  });
}

// Cập nhật số lượng
export function updateCartItem(itemId, quantity) {
  return request(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

// Xóa sản phẩm
export function removeCartItem(itemId) {
  return request(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

// Đặt hàng từ giỏ
export function checkoutCart(data) {
  return request("/cart/checkout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
// Lấy đánh giá của sản phẩm
export function getProductReviews(productId) {
  return request(`/reviews/product/${productId}`);
}

// Kiểm tra quyền và đánh giá của khách hàng
export function getMyReviewStatus(productId) {
  return request(`/reviews/my/${productId}`);
}

// Thêm đánh giá
export function createReview(data) {
  return request("/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Chỉnh sửa đánh giá
export function updateReview(reviewId, data) {
  return request(`/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}