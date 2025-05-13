# Spotify Clone

Ứng dụng phát nhạc trực tuyến đầy đủ tính năng được xây dựng bằng React và Django.

## Tổng quan

Dự án này là một bản sao của Spotify được phát triển như một phần của môn học "Phần Mềm Mã Nguồn Mở". Ứng dụng bao gồm các tính năng như:

- Xác thực người dùng (đăng nhập, đăng ký, đặt lại mật khẩu)
- Phát nhạc với trình phát đầy đủ chức năng
- Tạo và quản lý playlist
- Khám phá album và bài hát
- Tính năng yêu thích bài hát
- Trò chuyện thời gian thực giữa người dùng
- Tài khoản premium với các đặc quyền
- Bảng điều khiển quản trị viên

## Công nghệ sử dụng

### Frontend
- React 19
- Zustand cho quản lý state
- React Router 7
- Bootstrap 5
- Axios cho các yêu cầu API
- WebSockets cho tính năng chat thời gian thực

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL cho cơ sở dữ liệu
- JWT cho xác thực
- Django Channels cho WebSocket
- Zustand để tạo, sử dụng và quản lý các State
- AWS S3 (tùy chọn) cho lưu trữ media

## Yêu cầu hệ thống

- Node.js (v16+)
- npm (v8+)
- Python 3.8+
- PostgreSQL
- Redis (cho WebSocket)

## Cài đặt

### Sao chép kho lưu trữ
```bash
git clone https://github.com/DoanPLuu/spotify.git
cd spotify_clone
```

### Thiết lập Backend
1. Di chuyển đến thư mục backend:
```bash
cd backend
```

2. Tạo và kích hoạt môi trường ảo:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Cài đặt các phụ thuộc:
```bash
pip install -r requirements.txt
```

4. Tạo file .env trong thư mục backend:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=spotify_clone
DB_USER=postgres
DB_PASS=123456
DB_HOST=localhost
DB_PORT=5432
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Nếu dùng AWS S3:
USE_S3=True
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_STORAGE_BUCKET_NAME=your-aws-bucket-name
AWS_S3_REGION_NAME=your-aws-region-name
```

5. Tạo database và chạy migrations:
```bash
psql -U postgres -c "CREATE DATABASE spotify_clone;"
python manage.py makemigrations
python manage.py migrate
python manage.py seed_data
```

6. Khởi động server:
```bash
daphne spotify_clone.asgi:application
```
Máy chủ backend sẽ khởi động tại http://localhost:8000

### Thiết lập Frontend
1. Di chuyển đến thư mục frontend:
```bash
cd frontend
```

2. Cài đặt các phụ thuộc:
```bash
npm install
```

3. Khởi động máy chủ phát triển:
```bash
npm run dev
```
Ứng dụng frontend sẽ có sẵn tại http://localhost:5173

## Cấu hình

### Cấu hình Backend
Tệp cấu hình chính nằm tại `backend/spotify_clone/settings.py`. Các cài đặt quan trọng bao gồm:

- Kết nối PostgreSQL: Cấu hình trong phần `DATABASES`
- Cài đặt JWT: Cấu hình trong phần `SIMPLE_JWT`
- Cài đặt Email: Cập nhật cấu hình email cho chức năng đặt lại mật khẩu
- AWS S3 (tùy chọn): Cấu hình trong phần `AWS_*` nếu sử dụng

### Cấu hình Frontend
Frontend kết nối với API backend thông qua các biến trong các file service. Mặc định, nó trỏ đến http://localhost:8000.

## Sử dụng

1. Đăng ký tài khoản mới hoặc đăng nhập bằng thông tin đăng nhập hiện có
2. Khám phá bài hát, album và nghệ sĩ
3. Tạo và quản lý playlist cá nhân
4. Phát nhạc với các chức năng điều khiển đầy đủ
5. Kết bạn và trò chuyện với người dùng khác
6. Nâng cấp lên tài khoản premium để mở khóa các tính năng bổ sung

## Truy cập Quản trị viên

Để truy cập bảng điều khiển quản trị viên:
1. Điều hướng đến `/admin/login`
2. Đăng nhập bằng thông tin đăng nhập quản trị viên
3. Quản lý người dùng, bài hát, album và các cài đặt hệ thống khác

## Giấy phép

<div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #1DB954;">
  <p><strong>MIT License</strong></p>
  <p>Copyright (c) 2025 Spotify Clone Team</p>
  
  <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>
  
  <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>
  
  <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
</div>

## Thành viên đóng góp

| Mã số sinh viên | Họ và tên         | Email                         |Phân chia công việc               |Khối lượng công việc             |
|-----------------|-------------------|-------------------------------|----------------------------------|---------------------------------|
| 3122410420      | Dương Minh Trí    | duongminhtri722004@gmail.com  |Yêu thích, Admin                  |20%                              |
| 3122410188      | Vũ Đăng Khoa      | khoavu1831@gmail.com          |Bạn bè, Trò chuyện                |20%                              |
| 3122410227      | Đoàn Phong Lưu    | doanphongluu082@gmail.com     |Playlist, Album                   |20%                              |
| 3122410305      | Đinh Bá Phong     | dinhbaphong123@gmail.com      |Phát nhạc, Tìm kiếm               |20%                              |
| 3122410283      | Lê Thị Hồng Nhung | lethihongnhungntt@gmail.com   |Đăng nhập, Đăng kí, Viết báo cáo  |20%                              |
