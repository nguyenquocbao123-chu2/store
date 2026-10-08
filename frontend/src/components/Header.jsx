import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import "./Header.css";


function Header() {

    const navigate = useNavigate();

    const [user, setUser] =
        useState(null);

    const [keyword, setKeyword] =
        useState("");


    // =========================
    // LẤY USER TỪ LOCAL STORAGE
    // =========================

    function loadUser() {

        const storedUser =
            localStorage.getItem("user");

        if (!storedUser) {

            setUser(null);
            return;

        }

        try {

            setUser(
                JSON.parse(storedUser)
            );

        } catch {

            setUser(null);

        }

    }


    useEffect(() => {

        loadUser();


        // Cập nhật Header khi Login / Logout
        window.addEventListener(
            "auth-change",
            loadUser
        );


        // Đồng bộ nếu localStorage thay đổi
        window.addEventListener(
            "storage",
            loadUser
        );


        return () => {

            window.removeEventListener(
                "auth-change",
                loadUser
            );

            window.removeEventListener(
                "storage",
                loadUser
            );

        };

    }, []);


    // =========================
    // TÌM KIẾM
    // =========================

    function handleSearch(event) {

        event.preventDefault();

        const value =
            keyword.trim();

        if (!value) {

            navigate("/products");
            return;

        }

        navigate(
            `/products?keyword=${encodeURIComponent(value)}`
        );

    }


    // =========================
    // ĐĂNG XUẤT
    // =========================

    function handleLogout() {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        setUser(null);

        window.dispatchEvent(
            new Event("auth-change")
        );

        navigate("/login");

    }


    return (
        <header className="header">

            {/* PHẦN TRÊN */}

            <div className="header-top">

                <Link
                    to="/"
                    className="logo"
                >
                    UMA.VN
                </Link>


                <form
                    className="search-box"
                    onSubmit={handleSearch}
                >

                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={keyword}
                        onChange={
                            (event) =>
                                setKeyword(
                                    event.target.value
                                )
                        }
                    />

                    <button type="submit">
                        Tìm kiếm
                    </button>

                </form>


                <div className="account">

                    {
                        user ? (

                            <>
                                <span>
                                    Xin chào,{" "}
                                    <strong>
                                        {user.full_name}
                                    </strong>
                                </span>

                                {user.role === "customer" && (
                                    <Link to="/my-orders">
                                        Đơn hàng của tôi
                                    </Link>
                                )}

                                {
                                    user.role === "owner" && (

                                        <Link
                                            to="/admin"
                                            className="admin-link"
                                        >
                                            Quản trị
                                        </Link>

                                    )
                                }

                                {user.role === "customer" && (
                                    <Link to="/cart">
                                        🛒 Giỏ hàng
                                    </Link>
                                )}

                                <button
                                    className="logout-button"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Đăng xuất
                                </button>
                            </>

                        ) : (

                            <>
                                <Link to="/login">
                                    Đăng nhập
                                </Link>

                                <span>
                                    |
                                </span>

                                <Link to="/register">
                                    Đăng ký
                                </Link>
                            </>

                        )
                    }

                </div>

            </div>


            {/* MENU */}

            <nav className="main-nav">

                <Link
                    to="/products?category_id=1"
                >
                    Điện thoại
                </Link>

                <Link
                    to="/products?category_id=2"
                >
                    Máy tính
                </Link>

                <Link
                    to="/products?category_id=3"
                >
                    Phụ kiện
                </Link>

                <span
                    className="nav-disabled"
                    title="Chức năng đang phát triển"
                >
                    Khuyến mãi
                </span>

            </nav>

        </header>
    );

}


export default Header;