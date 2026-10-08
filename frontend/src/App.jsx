import {
    Routes,
    Route
} from "react-router-dom";

import Header from "./components/Header";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Cart from "./pages/Cart";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSuppliers from "./pages/AdminSuppliers";
import AdminImports from "./pages/AdminImports";
import AdminInventory from "./pages/AdminInventory";
import AdminOrders from "./pages/AdminOrders";
import MyOrders from "./pages/MyOrders";
function App() {

    return (
        <>

            <Header />

            <main>

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/products/:id"
                        element={<ProductDetail />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/checkout/:id"
                        element={<Checkout />}
                    />

                    <Route
                        path="/order-success"
                        element={<OrderSuccess />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/admin/products"
                        element={<AdminProducts />}
                    />

                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="/admin/suppliers"
                        element={<AdminSuppliers />}
                    />

                    <Route
                        path="/admin/imports"
                        element={<AdminImports />}
                    />

                    <Route
                        path="/admin/inventory"
                        element={<AdminInventory />}
                    />

                    <Route
                        path="/admin/orders"
                        element={<AdminOrders />}
                    />

                    <Route
                        path="/my-orders"
                        element={<MyOrders />}
                    />

                </Routes>

            </main>

        </>
    );

}


export default App;