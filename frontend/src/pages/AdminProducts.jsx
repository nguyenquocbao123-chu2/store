import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    createProduct,
    deleteProduct,
    getMe,
    getProducts,
    updateProduct
} from "../services/api";

import "./AdminProducts.css";


const initialForm = {

    category_id: "1",

    product_name: "",

    brand: "",

    price: "",

    stock_quantity: "0",

    low_stock_threshold: "5",

    description: "",

    specifications: "",

    image: ""

};


function AdminProducts() {

    const navigate =
        useNavigate();


    const [products, setProducts] =
        useState([]);

    const [form, setForm] =
        useState(initialForm);

    const [editingId, setEditingId] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [authorized, setAuthorized] =
        useState(false);


    // =========================
    // KIỂM TRA OWNER
    // =========================

    useEffect(() => {

        initializeAdmin();

    }, []);


    async function initializeAdmin() {

        const token =
            localStorage.getItem("token");


        if (!token) {

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        from:
                            "/admin/products"
                    }
                }
            );

            return;

        }


        try {

            setLoading(true);
            setError("");


            const meData =
                await getMe();


            if (
                meData.user.role !==
                "owner"
            ) {

                setAuthorized(false);

                setError(
                    "Bạn không có quyền truy cập trang quản trị."
                );

                return;

            }


            setAuthorized(true);


            await loadProducts();


        } catch (err) {

            setAuthorized(false);

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    }


    // =========================
    // LOAD PRODUCTS
    // =========================

    async function loadProducts() {

        const data =
            await getProducts();


        setProducts(
            data.products || []
        );

    }


    // =========================
    // FORM CHANGE
    // =========================

    function handleChange(event) {

        const {
            name,
            value
        } = event.target;


        setForm(
            previous => ({
                ...previous,

                [name]:
                    value
            })
        );

    }


    // =========================
    // RESET FORM
    // =========================

    function resetForm() {

        setForm(
            initialForm
        );

        setEditingId(
            null
        );

        setError("");
        setSuccess("");

    }


    // =========================
    // CREATE / UPDATE
    // =========================

    async function handleSubmit(event) {

        event.preventDefault();


        setError("");
        setSuccess("");


        const productData = {

            category_id:
                Number(
                    form.category_id
                ),

            product_name:
                form.product_name.trim(),

            brand:
                form.brand.trim(),

            price:
                Number(
                    form.price
                ),

            stock_quantity:
                Number(
                    form.stock_quantity
                ),

            low_stock_threshold:
                Number(
                    form.low_stock_threshold
                ),

            description:
                form.description.trim(),

            specifications:
                form.specifications.trim(),

            image:
                form.image.trim()

        };


        if (
            !productData.product_name
        ) {

            setError(
                "Vui lòng nhập tên sản phẩm."
            );

            return;

        }


        if (
            form.price === "" ||
            !Number.isFinite(
                productData.price
            ) ||
            productData.price < 0
        ) {

            setError(
                "Giá sản phẩm không hợp lệ."
            );

            return;

        }


        if (
            !Number.isInteger(
                productData.stock_quantity
            ) ||
            productData.stock_quantity < 0
        ) {

            setError(
                "Số lượng tồn kho không hợp lệ."
            );

            return;

        }


        if (
            !Number.isInteger(
                productData.low_stock_threshold
            ) ||
            productData.low_stock_threshold < 0
        ) {

            setError(
                "Ngưỡng cảnh báo tồn kho không hợp lệ."
            );

            return;

        }


        try {

            setSaving(true);


            if (editingId) {

                const data =
                    await updateProduct(
                        editingId,
                        productData
                    );


                setSuccess(
                    data.message ||
                    "Cập nhật sản phẩm thành công."
                );

            } else {

                const data =
                    await createProduct(
                        productData
                    );


                setSuccess(
                    data.message ||
                    "Thêm sản phẩm thành công."
                );

            }


            setForm(
                initialForm
            );

            setEditingId(
                null
            );


            await loadProducts();


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setSaving(false);

        }

    }


    // =========================
    // EDIT
    // =========================

    function handleEdit(product) {

        setEditingId(
            product.product_id
        );


        setForm({

            category_id:
                String(
                    product.category_id ||
                    1
                ),

            product_name:
                product.product_name || "",

            brand:
                product.brand || "",

            price:
                String(
                    product.price ?? ""
                ),

            stock_quantity:
                String(
                    product.stock_quantity ?? 0
                ),

            low_stock_threshold:
                String(
                    product.low_stock_threshold ?? 5
                ),

            description:
                product.description || "",

            specifications:
                product.specifications || "",

            image:
                product.image || ""

        });


        setError("");
        setSuccess("");


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    // =========================
    // DELETE
    // =========================

    async function handleDelete(product) {

        const confirmed =
            window.confirm(
                `Bạn có chắc muốn xóa sản phẩm "${product.product_name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setError("");
            setSuccess("");


            const data =
                await deleteProduct(
                    product.product_id
                );


            setSuccess(
                data.message ||
                "Xóa sản phẩm thành công."
            );


            // Nếu đang sửa chính sản phẩm vừa xóa
            if (
                editingId ===
                product.product_id
            ) {

                setEditingId(null);

                setForm(
                    initialForm
                );

            }


            await loadProducts();


        } catch (err) {

            setError(
                err.message
            );

        }

    }


    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (
            <div className="admin-status">

                Đang kiểm tra quyền truy cập...

            </div>
        );

    }


    // =========================
    // FORBIDDEN
    // =========================

    if (!authorized) {

        return (
            <div className="admin-status">

                <div className="admin-forbidden">

                    <div className="forbidden-code">
                        403
                    </div>

                    <h1>
                        Không có quyền truy cập
                    </h1>

                    <p>
                        Trang này chỉ dành cho
                        tài khoản Owner.
                    </p>


                    {
                        error && (

                            <p className="admin-forbidden-error">
                                {error}
                            </p>

                        )
                    }


                    <Link to="/">
                        Về trang chủ
                    </Link>

                </div>

            </div>
        );

    }


    return (
        <div className="admin-products-page">

            {/* =====================
                HEADER
            ====================== */}

            <div className="admin-page-heading">

                <div>

                    <p className="admin-label">
                        OWNER
                    </p>

                    <h1>
                        Quản lý sản phẩm
                    </h1>

                    <p>
                        Thêm, sửa và xóa sản phẩm
                        trong hệ thống UMA.VN.
                    </p>

                </div>


                <Link
                    to="/products"
                    className="admin-view-store"
                >
                    Xem cửa hàng →
                </Link>

            </div>


            {/* =====================
                MESSAGE
            ====================== */}

            {
                error && (

                    <div className="admin-message error">
                        {error}
                    </div>

                )
            }


            {
                success && (

                    <div className="admin-message success">
                        {success}
                    </div>

                )
            }


            {/* =====================
                PRODUCT FORM
            ====================== */}

            <section className="admin-panel">

                <div className="admin-panel-heading">

                    <div>

                        <h2>

                            {
                                editingId
                                    ? "Cập nhật sản phẩm"
                                    : "Thêm sản phẩm"
                            }

                        </h2>


                        {
                            editingId && (

                                <p>
                                    Đang sửa sản phẩm
                                    {" "}
                                    #{editingId}
                                </p>

                            )
                        }

                    </div>


                    {
                        editingId && (

                            <button
                                type="button"
                                className="cancel-edit-button"
                                onClick={
                                    resetForm
                                }
                            >
                                Hủy chỉnh sửa
                            </button>

                        )
                    }

                </div>


                <form
                    className="admin-product-form"
                    onSubmit={
                        handleSubmit
                    }
                >

                    {/* TÊN */}

                    <div className="admin-field admin-field-wide">

                        <label>
                            Tên sản phẩm *
                        </label>

                        <input
                            type="text"
                            name="product_name"
                            value={
                                form.product_name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Ví dụ: Acer Nitro V"
                            required
                        />

                    </div>


                    {/* CATEGORY */}

                    <div className="admin-field">

                        <label>
                            Danh mục *
                        </label>

                        <select
                            name="category_id"
                            value={
                                form.category_id
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="1">
                                Điện thoại
                            </option>

                            <option value="2">
                                Laptop
                            </option>

                            <option value="3">
                                Phụ kiện
                            </option>

                        </select>

                    </div>


                    {/* BRAND */}

                    <div className="admin-field">

                        <label>
                            Thương hiệu
                        </label>

                        <input
                            type="text"
                            name="brand"
                            value={
                                form.brand
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Samsung, ASUS..."
                        />

                    </div>


                    {/* PRICE */}

                    <div className="admin-field">

                        <label>
                            Giá *
                        </label>

                        <input
                            type="number"
                            name="price"
                            min="0"
                            value={
                                form.price
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="19990000"
                            required
                        />

                    </div>


                    {/* STOCK */}

                    <div className="admin-field">

                        <label>
                            Tồn kho *
                        </label>

                        <input
                            type="number"
                            name="stock_quantity"
                            min="0"
                            step="1"
                            value={
                                form.stock_quantity
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                    </div>


                    {/* THRESHOLD */}

                    <div className="admin-field">

                        <label>
                            Ngưỡng cảnh báo tồn kho
                        </label>

                        <input
                            type="number"
                            name="low_stock_threshold"
                            min="0"
                            step="1"
                            value={
                                form.low_stock_threshold
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    {/* IMAGE */}

                    <div className="admin-field">

                        <label>
                            URL hình ảnh
                        </label>

                        <input
                            type="text"
                            name="image"
                            value={
                                form.image
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="https://..."
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="admin-field admin-field-wide">

                        <label>
                            Mô tả
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            rows="4"
                            placeholder="Mô tả sản phẩm..."
                        />

                    </div>


                    {/* SPECIFICATIONS */}

                    <div className="admin-field admin-field-wide">

                        <label>
                            Thông số kỹ thuật
                        </label>

                        <textarea
                            name="specifications"
                            value={
                                form.specifications
                            }
                            onChange={
                                handleChange
                            }
                            rows="4"
                            placeholder="RAM 16GB, SSD 512GB..."
                        />

                    </div>


                    <div className="admin-form-actions">

                        <button
                            type="submit"
                            className="admin-save-button"
                            disabled={
                                saving
                            }
                        >

                            {
                                saving
                                    ? "Đang lưu..."
                                    : editingId
                                        ? "Lưu thay đổi"
                                        : "Thêm sản phẩm"
                            }

                        </button>


                        <button
                            type="button"
                            className="admin-reset-button"
                            onClick={
                                resetForm
                            }
                            disabled={
                                saving
                            }
                        >
                            Làm mới form
                        </button>

                    </div>

                </form>

            </section>


            {/* =====================
                PRODUCT TABLE
            ====================== */}

            <section className="admin-panel">

                <div className="admin-panel-heading">

                    <div>

                        <h2>
                            Danh sách sản phẩm
                        </h2>

                        <p>
                            {
                                products.length
                            }
                            {" "}
                            sản phẩm đang hoạt động
                        </p>

                    </div>

                </div>


                {
                    products.length === 0 ? (

                        <div className="admin-empty">
                            Chưa có sản phẩm.
                        </div>

                    ) : (

                        <div className="admin-table-wrapper">

                            <table className="admin-product-table">

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Sản phẩm
                                        </th>

                                        <th>
                                            Danh mục
                                        </th>

                                        <th>
                                            Giá
                                        </th>

                                        <th>
                                            Tồn kho
                                        </th>

                                        <th>
                                            Trạng thái
                                        </th>

                                        <th>
                                            Thao tác
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {
                                        products.map(
                                            product => (

                                                <tr
                                                    key={
                                                        product.product_id
                                                    }
                                                >

                                                    <td>
                                                        #
                                                        {
                                                            product.product_id
                                                        }
                                                    </td>


                                                    <td>

                                                        <div className="admin-product-name">

                                                            <strong>
                                                                {
                                                                    product.product_name
                                                                }
                                                            </strong>

                                                            <span>
                                                                {
                                                                    product.brand ||
                                                                    "Chưa có thương hiệu"
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        {
                                                            product.category_name ||
                                                            "Chưa phân loại"
                                                        }

                                                    </td>


                                                    <td className="admin-price">

                                                        {
                                                            Number(
                                                                product.price
                                                            ).toLocaleString(
                                                                "vi-VN"
                                                            )
                                                        }

                                                        {" "}VNĐ

                                                    </td>


                                                    <td>

                                                        <span
                                                            className={
                                                                Number(
                                                                    product.stock_quantity
                                                                ) <=
                                                                Number(
                                                                    product.low_stock_threshold
                                                                )
                                                                    ? "stock-badge low"
                                                                    : "stock-badge"
                                                            }
                                                        >

                                                            {
                                                                product.stock_quantity
                                                            }

                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="active-badge">
                                                            Hoạt động
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="admin-table-actions">

                                                            <button
                                                                type="button"
                                                                className="edit-button"
                                                                onClick={
                                                                    () =>
                                                                        handleEdit(
                                                                            product
                                                                        )
                                                                }
                                                            >
                                                                Sửa
                                                            </button>


                                                            <button
                                                                type="button"
                                                                className="delete-button"
                                                                onClick={
                                                                    () =>
                                                                        handleDelete(
                                                                            product
                                                                        )
                                                                }
                                                            >
                                                                Xóa
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            )
                                        )
                                    }

                                </tbody>

                            </table>

                        </div>

                    )
                }

            </section>

        </div>
    );

}


export default AdminProducts;