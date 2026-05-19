# Hướng dẫn test luồng gRPC và RabbitMQ với Postman

Dự án này sử dụng một endpoint HTTP trong Spring Boot làm Gateway để gọi sang gRPC và đẩy dữ liệu lên RabbitMQ. Do đó, bạn có thể dễ dàng test hệ thống theo 2 cách dưới đây.

---

## Cách 1: Test toàn bộ luồng qua Spring Boot (HTTP API)
Trong file `DemoController.java`, đã có sẵn endpoint `POST /api/test`. Khi gọi API này, Spring Boot sẽ đẩy message lên RabbitMQ và đồng thời gọi gRPC sang NestJS.

**Cấu hình Postman:**
1. **Method:** `POST`
2. **URL:** `http://localhost:8080/api/test` (Port `8080` là port của Spring Boot).
3. **Tab Body:** Chọn `raw` và `JSON`.
4. **Nội dung Body:**
   ```json
   {
       "name": "Kito"
   }
   ```
5. Bấm **Send**.

**Kết quả mong đợi:**
- **Trên màn hình Postman** sẽ trả về chuỗi phản hồi có nội dung dạng:
  ```text
  Kết quả trả về cho Postman:
  - Trạng thái RabbitMQ: Đã push thành công!
  - Phản hồi từ NestJS gRPC: Hello Kito...
  ```
- **Console log của Spring Boot**: Sẽ in ra `[Spring] Đang đẩy message lên RabbitMQ...` và `[Spring] Đang gọi NestJS qua gRPC...`.
- **Console log của NestJS**: Sẽ in ra log xác nhận đã nhận được message từ RabbitMQ và request từ gRPC.

---

## Cách 2: Test gRPC trực tiếp qua NestJS
Postman hiện tại hỗ trợ gọi thẳng vào server gRPC. Cách này giúp bạn kiểm tra tính độc lập của NestJS gRPC Server mà không đi qua Spring Boot.

**Cấu hình Postman:**
1. Mở Postman, chọn **New** -> **gRPC Request**.
2. **URL:** `localhost:50051` (Port của NestJS gRPC Server).
3. **Cấu hình file Proto:** 
   - Chuyển sang tab **Service definition** (nằm bên cạnh tab Message).
   - Bấm vào mục chọn API và chọn **Import a .proto file**.
   - Tải lên file `demo.proto` của dự án (nằm trong thư mục `src/main/proto` của Spring Boot hoặc thư mục `src` của NestJS). Postman sẽ tự động phân tích file này.
4. **Chọn Method:** Bấm vào danh sách xổ xuống bên cạnh nút URL, chọn `DemoService` / `GetGreeting` (dựa trên các method định nghĩa trong file proto).
5. **Tab Message:** Dùng định dạng JSON để gửi request:
   ```json
   {
       "name": "Kito Testing gRPC"
   }
   ```
6. Bấm **Invoke**.

**Kết quả mong đợi:**
Postman sẽ trả về phản hồi chuẩn gRPC trực tiếp từ NestJS. Ví dụ:
```json
{
  "message": "Hello Kito Testing gRPC"
}
```
