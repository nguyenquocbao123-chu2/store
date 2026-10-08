# UMA.VN — README HƯỚNG DẪN CHẠY DEMO VÀ KIỂM THỬ TUẦN 5

**Đồ án:** Website bán đồ điện tử UMA.VN  
**Giai đoạn:** Tuần 5 — Sprint 2 (hoàn thiện nghiệp vụ chính)  
**Công nghệ:** React + Vite (Frontend), Node.js + Express (Backend), SQLite (CSDL)  
**Thành viên:**
- **Nguyễn Quốc Bảo:** Backend, Database, kiểm thử API (`BE-01` → `BE-13`).
- **Huỳnh Lương Chí Dũng:** Frontend, UI/UX, kiểm thử giao diện (`FE-01` → `FE-10`).
- **Cả hai:** Kiểm thử tích hợp (`INT-01`, `INT-02`), chuẩn bị minh chứng và demo.

> README này dùng cùng file `Bo_test_case_va_du_lieu_demo_Tuan5_UMA.xlsx`. Kết quả bên dưới là **kết quả mong đợi**, không phải kết quả đã kiểm thử thành công.

---

## 1. Chuẩn bị môi trường

Máy cần có **Node.js**, **npm**, **VS Code** và trình duyệt Chrome/Edge. Để test API thuận tiện, có thể dùng **Postman** (không bắt buộc).

Cấu trúc thư mục dự kiến:

```text
electronic-store/
├── backend/
│   ├── config/database.js
│   ├── database/
│   │   ├── init.js
│   │   ├── seed.js
│   │   └── seedCustomer.js
│   ├── makeOwner.js
│   ├── server.js
│   ├── package.json
│   └── .env                 # tự tạo, KHÔNG nộp GitHub
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md               # file này
└── Bo_test_case_va_du_lieu_demo_Tuan5_UMA.xlsx
```

**Kiểm tra phiên bản:**

```powershell
node -v
npm -v
```

## 2. Cài đặt và chạy Backend

Mở **Terminal 1** trong VS Code:

```powershell
cd D:\electronic-store\backend
npm install
```

Tạo file `backend/.env` nếu chưa có, với nội dung:

```dotenv
JWT_SECRET=THAY_BANG_CHUOI_NGAU_NHIEN_IT_NHAT_32_KY_TU
```

Để tạo khóa ngẫu nhiên an toàn, chạy lệnh sau rồi sao chép kết quả vào `JWT_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Không đưa `.env`, JWT hoặc mật khẩu thật lên GitHub/Classroom.**

### Khởi tạo dữ liệu demo

Chạy lần lượt từ thư mục `backend`:

```powershell
node database/init.js
node database/seed.js
node database/seedCustomer.js
```

- `init.js`: tạo bảng SQLite nếu chưa tồn tại.
- `seed.js`: thêm 3 sản phẩm mẫu và danh mục.
- `seedCustomer.js`: tạo tài khoản Customer thử nghiệm.

**Lưu ý:** `INSERT OR IGNORE` không đặt lại số lượng tồn kho của sản phẩm đã tồn tại. Nếu đã test mua hàng trước đó, dữ liệu thực tế có thể khác dữ liệu seed. Hãy sao lưu database trước khi cần tạo môi trường test sạch.

### Khởi động Backend

```powershell
node server.js
```

Backend mặc định chạy ở `http://localhost:5000`.

Kiểm tra nhanh trên trình duyệt:

- `http://localhost:5000/`
- `http://localhost:5000/api/test-db`
- `http://localhost:5000/api/products`

Kết quả mong đợi: API hoạt động, `/api/test-db` trả về `"Kết nối SQLite thành công"`.

## 3. Cài đặt và chạy Frontend

Mở **Terminal 2** (giữ Terminal 1 đang chạy):

```powershell
cd D:\electronic-store\frontend
npm install
npm run dev
```

Truy cập địa chỉ do Vite in ra, thông thường:

**http://localhost:5173**

Các trang dùng khi demo:

| Trang | Đường dẫn |
|---|---|
| Trang chủ | `/` |
| Danh sách sản phẩm | `/products` |
| Chi tiết sản phẩm ID 1 | `/products/1` |
| Đăng ký | `/register` |
| Đăng nhập | `/login` |
| Giỏ hàng | `/cart` |
| Đơn hàng của tôi | `/my-orders` |
| Dashboard Owner | `/admin` |
| Quản lý sản phẩm | `/admin/products` |
| Quản lý đơn hàng | `/admin/orders` |
| Tồn kho | `/admin/inventory` |

**Lưu ý:** Các trang hoặc chức năng mới chỉnh sửa ở máy nhưng chưa được commit có thể khác bản GitHub.

## 4. Dữ liệu thử nghiệm

### 4.1. Tài khoản Customer mẫu

| Trường | Giá trị |
|---|---|
| Email | `demo.customer@example.com` |
| Mật khẩu demo | `Demo@12345` |
| Vai trò | `customer` |

Tài khoản này chỉ dùng để test trên máy local.

### 4.2. Tài khoản Owner mẫu

1. Mở `/register`, đăng ký tài khoản với email `owner-demo@example.com` và **tự đặt mật khẩu thử nghiệm**.
2. Tại Terminal Backend, chạy:

   ```powershell
   cd D:\electronic-store\backend
   node makeOwner.js owner-demo@example.com
   ```

3. Đăng xuất (nếu đang đăng nhập), đăng nhập lại bằng tài khoản vừa tạo.
4. Mở `/admin` để kiểm tra quyền Owner.

**Không dùng tài khoản cá nhân hoặc mật khẩu thật khi demo.**

### 4.3. Sản phẩm mẫu khi database còn mới

| ID | Tên sản phẩm | Giá | Tồn kho ban đầu |
|---|---|---:|---:|
| 1 | Samsung Galaxy S25 | 19.990.000 đ | 10 |
| 2 | ASUS TUF Gaming | 24.990.000 đ | 5 |
| 3 | Chuột Logitech G502 | 1.290.000 đ | 2 |

Dữ liệu giao hàng thử nghiệm:

```json
{
  "receiver_name": "Khách Hàng Demo",
  "receiver_phone": "0900000000",
  "shipping_address": "123 Đường Mẫu, TP.HCM",
  "payment_method": "cod"
}
```

## 5. Hướng dẫn Bảo test Backend bằng Postman

### 5.1. Lấy JWT Customer

Tạo request trong Postman:

- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Body → raw → JSON:**

```json
{
  "email": "demo.customer@example.com",
  "password": "Demo@12345"
}
```

Kết quả mong đợi: **HTTP 200**, JSON chứa `token` và `user.role = "customer"`.

Với API yêu cầu đăng nhập, vào **Authorization → Type: Bearer Token**, dán JWT vừa nhận. Làm tương tự với tài khoản Owner để test quyền quản trị.

**Không chụp ảnh màn hình làm lộ JWT, mật khẩu hay khóa bí mật.**

### 5.2. Danh sách test Backend (`BE-01` → `BE-13`)

| ID | Cách chạy | Kết quả mong đợi |
|---|---|---|
| **BE-01** | Đăng nhập Customer bằng email/mật khẩu demo. | HTTP 200, nhận JWT. |
| **BE-02** | `POST /api/auth/login`, nhập mật khẩu sai. | HTTP 401, thông báo lỗi. |
| **BE-03** | `POST /api/auth/register`, dùng email đã tồn tại với các trường hợp lệ khác. | HTTP 409, không tạo tài khoản trùng. |
| **BE-04** | `POST /api/auth/register`, mật khẩu chỉ có 6 ký tự. | HTTP 400. |
| **BE-05** | `GET /api/cart` **không** gửi JWT. | HTTP 401. |
| **BE-06** | `GET /api/orders/admin` với JWT Customer. | HTTP 403. |
| **BE-07** | `POST /api/cart/items`, body `{"product_id":3,"quantity":999}` với JWT Customer. | HTTP 409 nếu tồn kho sản phẩm ID 3 thấp hơn 999; giỏ không thay đổi. |
| **BE-08** | `POST /api/cart/items`, body `{"product_id":1,"quantity":0}`. | HTTP 400. |
| **BE-09** | Thêm sản phẩm còn hàng vào giỏ, sau đó `POST /api/cart/checkout` với JSON giao hàng mẫu. | HTTP 201; có đơn mới, giảm tồn kho, giỏ được làm trống. |
| **BE-10** | Khi giỏ có hàng, checkout với `"payment_method":"bank"`. | HTTP 400, chỉ hỗ trợ COD. |
| **BE-11** | `POST /api/reviews`, body `{"product_id":1,"rating":6,"comment":"Test"}`. | HTTP 400, vì rating ngoài 1–5. |
| **BE-12** | Với một đơn đang `confirmed`, Owner gọi `PATCH /api/orders/admin/{id}/status`, body `{"status":"completed"}`. | HTTP 409, không được nhảy trạng thái. |
| **BE-13** | Owner gọi `POST /api/products`, nhập `price:-100` cùng các trường hợp lệ khác. | Bị từ chối; không lưu giá âm vào SQLite. |

**Ví dụ request để thêm hàng:**

```http
POST http://localhost:5000/api/cart/items
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 1
}
```

**Ví dụ checkout:**

```http
POST http://localhost:5000/api/cart/checkout
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "receiver_name": "Khách Hàng Demo",
  "receiver_phone": "0900000000",
  "shipping_address": "123 Đường Mẫu, TP.HCM",
  "payment_method": "cod"
}
```

**Ví dụ Owner đổi trạng thái:**

```http
PATCH http://localhost:5000/api/orders/admin/1/status
Authorization: Bearer <OWNER_TOKEN>
Content-Type: application/json

{
  "status": "processing"
}
```

Thay `1` bằng **ID đơn hàng thực tế**. Đừng giả định đơn hàng demo luôn có ID 1.

## 6. Hướng dẫn Dũng test Frontend

| ID | Thao tác trên trình duyệt | Kết quả mong đợi |
|---|---|---|
| **FE-01** | Mở `/login`, đăng nhập Customer đúng. | Đăng nhập thành công, Header cập nhật. |
| **FE-02** | Đăng nhập với mật khẩu sai. | Hiện lỗi, không vào trang cần xác thực. |
| **FE-03** | Mở `/register`, nhập mật khẩu xác nhận khác mật khẩu chính. | Báo không khớp; không gửi đăng ký. |
| **FE-04** | Mở `/products`, tìm `Samsung`. | Có Samsung Galaxy S25. |
| **FE-05** | Mở `/products/1`. | Hiện tên, giá, tồn kho, nút mua/thêm giỏ. |
| **FE-06** | Đăng nhập Customer, thêm 1 Samsung Galaxy S25 vào giỏ. | `/cart` hiển thị đúng sản phẩm, số lượng và giá. |
| **FE-07** | Tăng/giảm số lượng trong giỏ. | Thành tiền cập nhật đúng. |
| **FE-08** | Điền tên, điện thoại, địa chỉ; chọn COD; xác nhận đặt hàng. | Có thông báo thành công và đơn mới. |
| **FE-09** | Nhấn `F12` → chế độ thiết bị → chọn kích thước **390 × 844**; mở `/login` và `/register`. | Form không tràn ngang; nhập liệu và nút hoạt động. |
| **FE-10** | Đăng nhập Customer rồi truy cập `/admin`. | Hiển thị thông báo không có quyền. |

Với **FE-09**, chụp ảnh giao diện ở kích thước 390 × 844. Với các bài test còn lại, chụp trạng thái trước/sau hoặc thông báo lỗi phù hợp.

## 7. Kiểm thử tích hợp (Bảo + Dũng)

### INT-01 — Luồng mua hàng từ Customer đến Owner

1. Đăng nhập Customer mẫu.
2. Vào `/products/1`, thêm **1 Samsung Galaxy S25** vào giỏ.
3. Vào `/cart`, kiểm tra tên, số lượng, giá.
4. Đặt hàng bằng COD, ghi lại **ID đơn hàng**.
5. Kiểm tra `/my-orders` thấy đơn mới.
6. Đăng xuất, đăng nhập Owner.
7. Vào `/admin/orders`, tìm đúng đơn vừa tạo.
8. Cập nhật trạng thái đúng thứ tự:

   ```text
   confirmed → processing → shipping → completed
   ```

9. Kiểm tra đơn ở trạng thái `completed` và tồn kho đã giảm đúng 1 sản phẩm.

**Kết quả mong đợi:** Dữ liệu Frontend, API và SQLite thống nhất. Nếu website có trang báo cáo doanh thu trên máy, có thể kiểm tra thêm doanh thu từ đơn `completed`.

### INT-02 — Đánh giá sau khi mua

1. Dùng Customer có đơn mua sản phẩm ID 1.
2. Khi đơn **chưa completed**, thử đánh giá sản phẩm: phải bị từ chối.
3. Owner chuyển đơn qua đúng các trạng thái đến `completed`.
4. Customer mở trang chi tiết sản phẩm và gửi đánh giá từ **1–5 sao**.
5. Tải lại trang, kiểm tra đánh giá hiển thị.
6. Thử gửi đánh giá trùng cho cùng sản phẩm: hệ thống phải ngăn tạo đánh giá thứ hai.

**Kết quả mong đợi:** Chỉ khách hàng đã có đơn hoàn thành chứa sản phẩm mới đánh giá được.

## 8. Ghi kết quả vào Excel

Mở file **`Bo_test_case_va_du_lieu_demo_Tuan5_UMA.xlsx`**.

### Sheet `Test_cases`

- **Cột H — Kết quả thực tế:** ghi kết quả thật sau khi chạy, ví dụ `HTTP 401, nhận message "Bạn chưa đăng nhập"`.
- **Cột I — Trạng thái:** chọn `Đạt`, `Không đạt`, `Chưa chạy` hoặc `Bỏ qua`.
- **Cột J — Minh chứng:** ghi tên file ảnh/log, ví dụ `BE-05_401.png`.

### Sheet `Tong_quan`

- Bảng tổng hợp đếm trạng thái từ sheet `Test_cases`.
- **Ô A9** có nhãn `Bỏ qua`, **ô B9** là số lượng test case đã chọn trạng thái `Bỏ qua`.
- Nếu chưa chạy test, để trạng thái `Chưa chạy`; không điền `Đạt` trước khi kiểm chứng.

### Sheet `Du_lieu_demo`

Dùng để đối chiếu tài khoản, sản phẩm và dữ liệu giao hàng mẫu.

### Sheet `Checklist_nop`

Đánh dấu những tài liệu và minh chứng đã chuẩn bị trước khi nộp.

## 9. Kiểm tra dữ liệu SQLite (tùy chọn)

Dùng **DB Browser for SQLite** hoặc công cụ SQLite phù hợp để mở:

```text
backend/database/electronic_store.db
```

Các bảng cần đối chiếu: `users`, `products`, `carts`, `cart_items`, `orders`, `order_details`, `reviews`, `suppliers`, `imports`, `import_details`.

Ví dụ SQL chỉ đọc:

```sql
SELECT product_id, product_name, stock_quantity
FROM products
ORDER BY product_id;

SELECT order_id, user_id, total_amount, status, created_at
FROM orders
ORDER BY order_id DESC;

SELECT review_id, user_id, product_id, rating
FROM reviews
ORDER BY review_id DESC;
```

**Không sửa trực tiếp bảng SQLite để giả lập kết quả kiểm thử**; nên thao tác qua giao diện hoặc API rồi dùng SQL đối chiếu.

## 10. Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
|---|---|
| `Failed to fetch` | Kiểm tra Backend còn chạy ở port 5000, URL trong `frontend/src/services/api.js` và CORS. |
| Giỏ hàng báo CORS | Trong `backend/server.js`, `app.use(cors())` và `app.use(express.json())` phải đặt **trước** `app.use("/api/cart", cartRoutes)`. |
| `no such table: carts` | Sao lưu DB; chạy `node database/init.js`, kiểm tra đúng file DB đang dùng. |
| `JWT_SECRET chưa được cấu hình` | Kiểm tra `backend/.env`, giá trị dài tối thiểu 32 ký tự. |
| HTTP 401 | Chưa đăng nhập, thiếu Bearer Token hoặc JWT hết hạn. |
| HTTP 403 | Tài khoản không có quyền truy cập chức năng. |
| `Failed to resolve import "./Auth.css"` | Tạo đúng file `frontend/src/pages/Auth.css` và lưu lại. |
| Test tồn kho khác dữ liệu mẫu | DB đã từng phát sinh đơn/nhập hàng; dùng bản DB test sạch hoặc ghi nhận tồn kho thực tế. |
| `npm test` ở Backend báo lỗi | `backend/package.json` chưa cấu hình bộ kiểm thử tự động; Tuần 5 hiện kiểm thử thủ công bằng Postman và trình duyệt. |

### Kiểm tra riêng thứ tự CORS

Trong `backend/server.js`, phần khai báo cần có thứ tự:

```javascript
const app = express();

app.use(cors());
app.use(express.json());

// Đăng ký các route sau middleware
app.use("/api/cart", cartRoutes);
```

Giữ nguyên các route khác của dự án, không khai báo trùng `/api/cart`.

## 11. Lưu ý về trigger và ràng buộc dữ liệu

Đề bài Tuần 5 có nhắc đến **trigger**. Trong bản mã nguồn GitHub được đối chiếu khi viết README, file `backend/database/init.js` đã có `CHECK`, `UNIQUE` và `FOREIGN KEY`, nhưng **chưa thấy `CREATE TRIGGER`**. Vì vậy:

- Không ghi “đã xây dựng trigger” trong báo cáo nếu nhóm chưa bổ sung.
- Nếu giảng viên yêu cầu bắt buộc trigger, nhóm cần thiết kế, triển khai và kiểm thử trigger riêng.
- Luồng đặt hàng/trừ tồn kho hiện do Backend xử lý; không được tự nhận đây là trigger SQLite.

## 12. Checklist nộp Classroom

```text
[ ] Source code Backend và Frontend (không kèm node_modules)
[ ] README.md hướng dẫn chạy và test (file này)
[ ] Bộ test case Excel đã điền kết quả thực tế
[ ] Dữ liệu demo hoặc script init.js / seed.js / seedCustomer.js
[ ] Ảnh hoặc log minh chứng các test case
[ ] Báo cáo cá nhân Nguyễn Quốc Bảo
[ ] Báo cáo cá nhân Huỳnh Lương Chí Dũng
[ ] Báo cáo nhóm có phân công công việc
[ ] Bảng đánh giá chéo đúng mẫu giảng viên
[ ] Thư mục nộp mang họ và tên nhóm trưởng
```

**Đề xuất cấu trúc thư mục nộp:**

```text
Ho_Ten_Nhom_Truong/
├── SourceCode/
│   └── electronic-store/
├── README.md
├── Bo_test_case_va_du_lieu_demo_Tuan5_UMA.xlsx
├── Bao_cao_nhom_Tuan5_Sprint2_UMA.docx
├── Bao_cao_ca_nhan_Nguyen_Quoc_Bao_Tuan5.docx
├── Bao_cao_ca_nhan_Huynh_Luong_Chi_Dung_Tuan5.docx
└── MinhChung/
    ├── Backend/
    ├── Frontend/
    └── TichHop/
```

**Bảo mật khi nộp:** Không kèm `node_modules`, `.env`, JWT thật, dữ liệu cá nhân hoặc database đang chứa thông tin thật. Dùng script seed để tạo dữ liệu demo trên máy chấm.

---

**Repository dự án:** https://github.com/nguyenquocbao123-chu2/store

**Trạng thái kiểm thử:** Chưa xác nhận trên máy nhóm; cập nhật kết quả thực tế trong Excel trước khi nộp.
