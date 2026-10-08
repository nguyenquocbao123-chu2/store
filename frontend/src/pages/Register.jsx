import {
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import {
    register
} from "../services/api";


function Register() {

    const [fullName, setFullName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState(false);


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess(false);


        // Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {

            setError(
                "Mật khẩu nhập lại không khớp"
            );

            return;

        }


        // Backend yêu cầu ít nhất 8 ký tự
        if (password.length < 8) {

            setError(
                "Mật khẩu phải có ít nhất 8 ký tự"
            );

            return;

        }


        try {

            setLoading(true);


            await register(
                fullName,
                email,
                password,
                phone,
                address
            );


            setSuccess(true);


            // Xóa dữ liệu form
            setFullName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setPhone("");
            setAddress("");


        } catch (err) {

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
                Đăng ký tài khoản
            </h1>


            {
                !success && (

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* HỌ TÊN */}

                        <div>

                            <label>
                                Họ và tên
                            </label>

                            <br />

                            <input
                                type="text"
                                value={fullName}
                                onChange={
                                    (event) =>
                                        setFullName(
                                            event.target.value
                                        )
                                }
                                required
                            />

                        </div>


                        <br />


                        {/* EMAIL */}

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


                        {/* SỐ ĐIỆN THOẠI */}

                        <div>

                            <label>
                                Số điện thoại
                            </label>

                            <br />

                            <input
                                type="tel"
                                value={phone}
                                onChange={
                                    (event) =>
                                        setPhone(
                                            event.target.value
                                        )
                                }
                                maxLength="20"
                            />

                        </div>


                        <br />


                        {/* ĐỊA CHỈ */}

                        <div>

                            <label>
                                Địa chỉ
                            </label>

                            <br />

                            <input
                                type="text"
                                value={address}
                                onChange={
                                    (event) =>
                                        setAddress(
                                            event.target.value
                                        )
                                }
                                maxLength="255"
                            />

                        </div>


                        <br />


                        {/* MẬT KHẨU */}

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
                                minLength="8"
                                required
                            />

                        </div>


                        <br />


                        {/* NHẬP LẠI MẬT KHẨU */}

                        <div>

                            <label>
                                Nhập lại mật khẩu
                            </label>

                            <br />

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={
                                    (event) =>
                                        setConfirmPassword(
                                            event.target.value
                                        )
                                }
                                minLength="8"
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
                                    ? "Đang đăng ký..."
                                    : "Đăng ký"
                            }

                        </button>

                    </form>

                )
            }


            {/* THÔNG BÁO LỖI */}

            {
                error && (

                    <p>
                        Lỗi: {error}
                    </p>

                )
            }


            {/* ĐĂNG KÝ THÀNH CÔNG */}

            {
                success && (

                    <div>

                        <h2>
                            Đăng ký thành công
                        </h2>

                        <p>
                            Tài khoản của bạn đã
                            được tạo.
                        </p>

                        <Link to="/login">
                            Đi đến đăng nhập
                        </Link>

                    </div>

                )
            }


            {
                !success && (

                    <p>

                        Đã có tài khoản?

                        {" "}

                        <Link to="/login">
                            Đăng nhập
                        </Link>

                    </p>

                )
            }

        </div>
    );

}


export default Register;