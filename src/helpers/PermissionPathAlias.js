// Trang mới dùng chung quyền (danh sách cơ sở được xem) với một trang có sẵn.
// Khi server cấp quyền riêng cho trang mới thì xoá dòng tương ứng.
const PERMISSION_PATH_ALIAS = {
  '/bao-cao-ngay/theo-khach-hang': '/bao-cao-ngay/khach-hang',
  '/bao-cao-ngay/tong-quan-co-so': '/bao-cao-ngay/tong-quan',
  '/ban-hang/ban-moi-thanh-toan-no': '/ban-hang/doanh-so'
}

export const getPermissionPath = pathname =>
  PERMISSION_PATH_ALIAS[pathname] || pathname
