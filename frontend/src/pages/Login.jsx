import {
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    login,
    getMe
} from "../services/api";


function Login() {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [user, setUser] =
        useState(null);


    async function handleSubmit(event) {

        event.preventDefault();

        try {

            setLoading(true);

            setError("");

            setUser(null);


            // =========================
            // 1. ĐĂNG NHẬP
            // =========================

            const data = await login(
                email,
                password
            );


            // =========================
            // 2. LƯU JWT
            // =========================

            localStorage.setItem(
                "token",
                data.token
            );


            // Lưu user để Header sử dụng sau
            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );

            window.dispatchEvent(
                new Event("auth-change")
            );

            // =========================
            // 3. KIỂM TRA JWT
            // =========================

            const meData =
                await getMe();


            setUser(
                meData.user
            );


        } catch (err) {

            // Nếu có lỗi thì không giữ token cũ
            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    }


    return (
        <div>

            <h1>
                Đăng nhập
            </h1>


            {
                !user && (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div>

                            <label>
                                Email
                            </label>

                            <br />

                            <input
                                type="email"
                                value={email}
                                onChange={
                                    (event) =>
                                        setEmail(
                                            event.target.value
                                        )
                                }
                                required
                            />

                        </div>


                        <br />


                        <div>

                            <label>
                                Mật khẩu
                            </label>

                            <br />

                            <input
                                type="password"
                                value={password}
                                onChange={
                                    (event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                }
                                required
                            />

                        </div>


                        <br />


                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {
                                loading
                                    ? "Đang đăng nhập..."
                                    : "Đăng nhập"
                            }

                        </button>

                    </form>

                )
            }


            {
                error && (

                    <div>

                        <p>
                            Lỗi: {error}
                        </p>

                    </div>

                )
            }


            {
                user && (

                    <div>

                        <h2>
                            Đăng nhập thành công
                        </h2>

                        <p>
                            JWT đã được Backend
                            xác thực.
                        </p>


                        <p>
                            <strong>
                                ID:
                            </strong>

                            {" "}

                            {user.user_id}
                        </p>


                        <p>
                            <strong>
                                Họ tên:
                            </strong>

                            {" "}

                            {user.full_name}
                        </p>


                        <p>
                            <strong>
                                Email:
                            </strong>

                            {" "}

                            {user.email}
                        </p>


                        <p>
                            <strong>
                                Vai trò:
                            </strong>

                            {" "}

                            {user.role}
                        </p>


                        <Link to="/">
                            Về trang chủ
                        </Link>

                    </div>

                )
            }

        </div>
    );

}


export default Login;