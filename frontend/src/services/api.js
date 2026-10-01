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