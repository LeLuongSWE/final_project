# Frontend Wireframe Skeletons

Thư mục này chứa các skeleton/wireframe components đơn giản hóa từ frontend project chính, dùng cho mục đích demo và documentation.

## 📁 Cấu trúc

```
wireframes/
├── App.jsx                     # Main routing
├── modules/
│   ├── customer/               # 👤 Customer Module
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Trang chủ với banner, danh mục, grid sản phẩm
│   │   │   ├── CartPage.jsx        # Giỏ hàng với chọn địa chỉ giao hàng
│   │   │   ├── LoginPage.jsx       # Đăng nhập khách hàng
│   │   │   ├── ProfilePage.jsx     # Thông tin cá nhân, đổi mật khẩu, địa chỉ
│   │   │   └── OrderStatusPage.jsx # Trạng thái đơn hàng với progress steps
│   │   └── components/
│   ├── staff/                  # 👨‍💼 Staff Module
│   │   ├── pages/
│   │   │   ├── StaffLoginPage.jsx    # Đăng nhập nhân viên
│   │   │   ├── CashierPOSPage.jsx    # Giao diện POS thu ngân
│   │   │   └── OnlineOrdersPage.jsx  # Quản lý đơn online (Kanban)
│   │   └── components/
│   └── admin/                  # 👨‍💼 Admin Module
│       ├── pages/
│       │   ├── AdminLoginPage.jsx     # Đăng nhập admin
│       │   ├── AdminDashboard.jsx     # Dashboard với thống kê
│       │   ├── AdminMenuPage.jsx      # CRUD thực đơn
│       │   ├── AdminInventoryPage.jsx # Quản lý kho
│       │   ├── AdminReportsPage.jsx   # Báo cáo thống kê
│       │   └── AdminStaffPage.jsx     # Quản lý nhân viên
│       └── components/
└── shared/                     # 🔧 Shared Resources
    ├── context/
    └── services/
```

## 🎨 Đặc điểm Wireframe

Các skeleton này được thiết kế với:

1. **UI Structure rõ ràng** - Thể hiện layout chính của từng trang
2. **Placeholder content** - Dùng emoji và text mô tả thay vì data thực
3. **No logic/API calls** - Loại bỏ toàn bộ business logic
4. **Tailwind CSS** - Sử dụng cùng styling framework với project chính
5. **Comments** - Đánh dấu các section chính trong code

## 📱 Các trang chính

### Customer Module
| Trang | Mô tả |
|-------|-------|
| HomePage | Banner, tabs danh mục, grid sản phẩm, floating cart button |
| CartPage | Danh sách item, chọn địa chỉ, tổng đơn hàng, thanh toán |
| LoginPage | Form đăng nhập, đăng ký, social login |
| ProfilePage | 3 tabs: Thông tin, Đổi mật khẩu, Địa chỉ |
| OrderStatusPage | Progress steps, chi tiết đơn, địa chỉ giao |

### Staff Module
| Trang | Mô tả |
|-------|-------|
| StaffLoginPage | Đăng nhập nhân viên với role badges |
| CashierPOSPage | 2 panel: Grid sản phẩm + Chi tiết đơn hàng |
| OnlineOrdersPage | 4 cột Kanban: Chờ → Chuẩn bị → Sẵn sàng → Hoàn thành |

### Admin Module
| Trang | Mô tả |
|-------|-------|
| AdminDashboard | Stats cards, biểu đồ, đơn gần đây, cảnh báo tồn kho |
| AdminMenuPage | CRUD table với filter, pagination |
| AdminInventoryPage | Bảng tồn kho, nhập/xuất, lịch sử |
| AdminReportsPage | Thống kê doanh thu, biểu đồ, top sản phẩm |
| AdminStaffPage | CRUD nhân viên, form thêm mới |

## 🎯 Mục đích sử dụng

- **Documentation**: Minh họa cấu trúc UI cho báo cáo
- **Demo**: Trình bày flow người dùng
- **Wireframing**: Làm nền tảng cho thiết kế chi tiết
- **Training**: Hướng dẫn cấu trúc code frontend

## 🔗 Link đến source chính

Project frontend đầy đủ: `/home/luongld/final_project/source_code/frontend/`
