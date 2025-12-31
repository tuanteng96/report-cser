import { createSlice } from '@reduxjs/toolkit'
import { DevHelpers } from 'src/helpers/DevHelpers'

if (DevHelpers.isDevelopment()) {
  window.Info = {
    User: {
      UserName: 'admin',
      ID: 1
    },
    Groups: [
      {
        Title: '11620.order'
      },
      {
        Title: 'Administrator'
      }
      // {
      //   Title: 'Báo cáo - 3'
      // }
    ],
    Stocks: [
      {
        ID: 778,
        Title: 'Quản lý cơ sở',
        ParentID: 0
      },
      {
        ID: 11620,
        Title: 'Saigon Office',
        Lat: 0,
        Lng: 0,
        WifiID: 'ac:a3:1e:4:e2:35',
        WifiName: 'Face Wash Fox',
        IsPublic: 1
      },
      {
        ID: 12356,
        Title: 'Vincom Plaza 3-2',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:f7:6f:29',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12357,
        Title: 'Yên Hoa Hà Nội',
        Lat: 0,
        Lng: 0,
        WifiID: 'a0:89:66:ca:14:9',
        WifiName: 'FACEWASHFOX',
        IsPublic: 1
      },
      {
        ID: 12358,
        Title: 'Hạ Long Vũng Tàu',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 0
      },
      {
        ID: 12359,
        Title: 'Nguyễn Du Q1',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12360,
        Title: 'Vincom Plaza Skylake',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12361,
        Title: 'Vincom Phạm Ngọc Thạch',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:e5:72:a8',
        WifiName: 'FACEWASHFOX',
        IsPublic: 1
      },
      {
        ID: 12362,
        Title: 'Starlake',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12363,
        Title: 'Marina',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12365,
        Title: 'Greenbay',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12366,
        Title: 'Lumiere',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12367,
        Title: 'Times City',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12368,
        Title: 'HANOI TOWER',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12369,
        Title: 'SAIGON PEARL',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12370,
        Title: 'Vincom Saigonres',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12371,
        Title: 'Diamond Island',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12372,
        Title: 'Vincom Bắc Từ Liêm',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12373,
        Title: 'LOTTE HANOI',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12374,
        Title: 'HANOI CENTRE',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12333,
        Title: 'Aeon Mall Tân Phú Celadon',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:d1:d7:19',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12329,
        Title: 'Đảo Ngọc Ngũ Xã HN',
        Lat: 0,
        Lng: 0,
        WifiID: '0:c8:96:29:e5:21',
        WifiName: 'Face Wash Fox',
        IsPublic: 1
      },
      {
        ID: 12330,
        Title: 'Gold Coast Nha Trang',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:d9:41:99',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12331,
        Title: 'Trương Định Q3',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:e7:10:91',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12336,
        Title: 'Trần Phú Đà Nẵng',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12338,
        Title: 'Sương Nguyệt Ánh Q1',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ac:89:41',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12344,
        Title: 'TTTM Estella Place',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:69:5a:91',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12345,
        Title: 'SC VivoCity',
        Lat: 0,
        Lng: 0,
        WifiID: 'ac:a3:1e:4:e2:36',
        WifiName: 'fwfwifi',
        IsPublic: 1
      },
      {
        ID: 12346,
        Title: 'Midtown Q7',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ac:89:41',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12347,
        Title: 'Aeon Mall Bình Tân',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:27:4a:a1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12348,
        Title: 'Nowzone Q1',
        Lat: 0,
        Lng: 0,
        WifiID: 'cc:71:90:9a:3f:99',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12350,
        Title: 'Ha Noi Office',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12351,
        Title: 'Saigon Centre',
        Lat: 10.7732077801471,
        Lng: 106.701059803134,
        WifiID: 'b8:29:3:c7:7c:41',
        WifiName: 'FACE WASH FOX_5G',
        IsPublic: 1
      },
      {
        ID: 12352,
        Title: 'Hub Kho Saigon ',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:c7:f8:79',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12353,
        Title: 'THI SÁCH Q1',
        Lat: 0,
        Lng: 0,
        WifiID: 'b8:29:3:d4:65:31',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12354,
        Title: 'Kosmo Tây Hồ',
        Lat: 0,
        Lng: 0,
        WifiID: 'cc:71:90:61:d7:81',
        WifiName: 'FACEWASHFOX 5G',
        IsPublic: 1
      },
      {
        ID: 12301,
        Title: 'Riviera Point Q7',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:fc:77:69',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12302,
        Title: 'Vincom Bà Triệu',
        Lat: 21.0112658,
        Lng: 105.8499174,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12306,
        Title: 'Vincom Lê Văn Việt',
        Lat: 0,
        Lng: 0,
        WifiID: 'cc:71:90:5c:5f:b1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12307,
        Title: 'Vincom Thảo Điền',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:5f:36:e1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12313,
        Title: 'Parc Mall Q8',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ac:89:41',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12315,
        Title: 'Vista Verde',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:94:38:f1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12316,
        Title: 'Westpoint Phạm Hùng',
        Lat: 0,
        Lng: 0,
        WifiID: '3c:f9:f0:5b:c3:13',
        WifiName: 'Face Wash Fox',
        IsPublic: 1
      },
      {
        ID: 12320,
        Title: 'Crescent Mall Q7',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ac:89:41',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12322,
        Title: 'The Botanica QTB',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:b2:83:41',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12323,
        Title: 'Hoa Lan Q PN',
        Lat: 0,
        Lng: 0,
        WifiID: 'cc:71:90:5c:5f:b1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12324,
        Title: 'Everrich Infinity Q5',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ce:4:9',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12325,
        Title: 'Thống Nhất Vũng Tàu',
        Lat: 0,
        Lng: 0,
        WifiID: '',
        WifiName: '',
        IsPublic: 1
      },
      {
        ID: 12326,
        Title: 'Võ Thị Sáu Q1',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:ce:3:71',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12327,
        Title: 'Imperia Sky Garden HN',
        Lat: 0,
        Lng: 0,
        WifiID: '0:c8:96:21:ba:b1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 11620,
        Title: 'The Sun Avenue',
        Lat: 0,
        Lng: 0,
        WifiID: '24:b:2a:82:49:2',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 11288,
        Title: 'Vincom Landmark 81',
        Lat: 0,
        Lng: 0,
        WifiID: 'cc:71:90:5c:5f:b1',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 11289,
        Title: 'Vincom Quang Trung',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:5a:f4:61',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      },
      {
        ID: 12290,
        Title: 'Vincom Phan Văn Trị',
        Lat: 0,
        Lng: 0,
        WifiID: '4c:12:e8:62:5f:f9',
        WifiName: 'FACE WASH FOX',
        IsPublic: 1
      }
    ],
    CrStockID: 11643,
    rightsSum: {
      report: {
        IsAllStock: true,
        hasRight: true,
        stocks: [
          {
            ID: 11620,
            Title: 'Cser Hà Nội'
          },
          {
            ID: 11621,
            Title: 'Cser HCM'
          },
          {
            ID: 11623,
            Title: 'Cser Đà nẵng'
          },
          {
            ID: 11625,
            Title: 'Cser CS A'
          },
          {
            ID: 11620,
            Title: 'Cser CS B'
          }
        ],
        jdata: {
          groups: [
            {
              group: 'Báo cáo ngày',
              items: [
                {
                  text: 'Tổng quan',
                  stocks: '',
                  name: 'bao-cao-ngay-danh-sach',
                  paths: ['/bao-cao-ngay/danh-sach'],
                  url: '/bao-cao-ngay/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chi-tiet-ngay'],
                  text: 'Khách hàng',
                  handler: 'Report1.Program.Main',
                  url: '/bao-cao-ngay/khach-hang',
                  checked: true
                }
              ]
            },
            {
              group: 'Khách hàng',
              items: [
                {
                  paths: ['/khach-hang/danh-sach', '/khach-hang/tong-quan'],
                  text: 'Tổng quan KH',
                  stocks: '',
                  url: '/khach-hang/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/tong-hop'],
                  text: 'Tổng hợp KH',
                  stocks: '',
                  url: '/khach-hang/tong-hop',
                  handler: 'Report1.Program.Main',
                  debug: 'Reports.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chi-tieu'],
                  text: 'Chi tiêu',
                  stocks: '',
                  url: '/khach-hang/chi-tieu',
                  handler: 'Report1.Program.Main',
                  debug: 'Reports.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/su-dung-dich-vu'],
                  text: 'Sử dụng dịch vụ',
                  url: '/khach-hang/su-dung-dich-vu',
                  handler: 'Reports.Program.Main',
                  debug: 'Report1.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/du-kien'],
                  text: 'Dự kiến',
                  url: '/khach-hang/du-kien',
                  handler: 'Reports.Program.Main',
                  debug: 'Report1.Program.Main',
                  checked: true
                },
                {
                  paths: ['/khach-hang/tan-suat-su-dung'],
                  text: 'Tần suất sử dụng',
                  url: '/khach-hang/tan-suat-su-dung',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chuyen-doi'],
                  text: 'Chuyển đổi',
                  handler: 'Report1.Program.Main',
                  url: '/khach-hang/chuyen-doi',
                  checked: true
                }
              ]
            },
            {
              group: 'Dịch vụ',
              items: [
                {
                  paths: ['/dich-vu/tong-quan', '/dich-vu/danh-sach'],
                  text: 'Tổng quan - Doanh số',
                  stocks: '',
                  url: '/dich-vu/tong-quan',
                  checked: true
                },
                {
                  paths: ['/khach-hang/chinh-sua-the'],
                  text: 'Báo cáo Nghiệp vụ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/bao-cao-nghiep-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/dich-vu-kh-khac-diem'],
                  text: 'Dịch vụ sử dụng khác điểm',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/dv-diem-sd-diem-khac',
                  checked: true
                },
                {
                  paths: ['/dich-vu/su-dung-dich-vu'],
                  text: 'Dịch vụ chưa sử dụng',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/su-dung-dich-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/ton-dich-vu'],
                  text: 'Tồn Dịch vụ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/ton-dich-vu',
                  checked: true
                },
                {
                  paths: ['/dich-vu/bao-cao-dat-lich'],
                  text: 'Báo cáo đặt lịch',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/dich-vu/bao-cao-dat-lich',
                  checked: true
                }
              ]
            },
            {
              group: 'Bán hàng',
              items: [
                {
                  paths: [
                    '/ban-hang/doanh-so-tong-quan',
                    '/ban-hang/doanh-so-danh-sach'
                  ],
                  text: 'Doanh số',
                  stocks: '',
                  url: '/ban-hang/doanh-so',
                  checked: true
                },
                {
                  paths: ['/ban-hang/doanh-so-chi-tiet'],
                  text: 'Sản phẩm - dịch vụ bán ra',
                  url: '/ban-hang/sp-dv-ban-ra',
                  checked: true
                },
                {
                  paths: ['/ban-hang/tra-hang'],
                  text: 'Trả hàng',
                  url: '/ban-hang/tra-hang',
                  checked: true
                },
                {
                  paths: ['/ban-hang/thanh-toan-tra-no'],
                  text: 'Thanh toán trả nợ',
                  url: '/ban-hang/thanh-toan-tra-no',
                  checked: true
                },
                {
                  paths: ['/ban-hang/top-ban-hang-doanh-so'],
                  text: 'Top bán hàng - doanh số',
                  url: '/ban-hang/top-ban-hang-doanh-so',
                  checked: true
                },
                {
                  paths: ['/ban-hang/doanh-so-giam-tru'],
                  text: 'Doanh số giảm trừ',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/doanh-so-giam-tru',
                  checked: true
                },
                {
                  paths: ['/ban-hang/gia-ban-san-pham-dich-vu'],
                  text: 'Bảng giá',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/bang-gia',
                  checked: true
                },
                {
                  paths: ['/loi-nhuan/danh-sach'],
                  text: 'Lợi nhuận',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/loi-nhuan',
                  checked: true
                },
                {
                  paths: ['/ban-hang/bao-cao-thuc-thu'],
                  text: 'Doanh số thực thu',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/ban-hang/doanh-so-thuc-thu',
                  checked: true
                }
              ]
            },
            {
              group: 'Thu chi & Sổ quỹ',
              items: [
                {
                  paths: [
                    '/bao-cao-thu-chi/tong-quan',
                    '/bao-cao-thu-chi/danh-sach'
                  ],
                  text: 'Tổng quan TC',
                  stocks: '',
                  handlers: [
                    {
                      path: '/bao-cao-thu-chi/tong-quan',
                      name: 'Report1.Program.Main'
                    },
                    {
                      path: '/bao-cao-thu-chi/danh-sach',
                      name: 'Report1.Program.Main',
                      export: {
                        listAsTablePath: 'Items'
                      }
                    }
                  ],
                  url: '/thu-chi-va-so-quy',
                  checked: true
                },
                {
                  paths: ['/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan'],
                  text: 'Các phương thức thanh toán',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/bao-cao-thu-chi/cac-phuong-thuc-thanh-toan',
                  checked: true
                }
              ]
            },
            {
              group: 'Công nợ',
              items: [
                {
                  paths: ['/cong-no/danh-sach'],
                  text: 'Công nợ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/danh-sach',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  outRights: '@memberid=',
                  url: '/cong-no/danh-sach',
                  checked: true
                },
                {
                  paths: ['/cong-no/khoa-no'],
                  text: 'Báo cáo khóa nợ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/khoa-no',
                      name: 'Report1.Program.Main',
                      export: {}
                    }
                  ],
                  url: '/cong-no/khoa-no',
                  checked: true
                },
                {
                  paths: ['/cong-no/tang'],
                  text: 'Báo cáo Tặng',
                  stocks: '',
                  handlers: [
                    {
                      path: '/cong-no/tang',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  url: '/cong-no/tang',
                  checked: true
                }
              ]
            },
            {
              group: 'Nhân viên',
              items: [
                {
                  paths: ['/nhan-vien/luong-ca-dich-vu'],
                  text: 'Lương ca dịch vụ',
                  stocks: '',
                  handlers: [
                    {
                      path: '/nhan-vien/luong-ca-dich-vu',
                      name: 'Report1.Program.Main'
                    }
                  ],
                  url: '/nhan-vien/luong-ca-dich-vu',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/hoa-hong'],
                  text: 'Hoa hồng',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/hoa-hong',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/doanh-so'],
                  text: 'Doanh số',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/doanh-so',
                  checked: true
                },
                {
                  paths: ['/nhan-vien/bang-luong'],
                  text: 'Bảng lương',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/nhan-vien/bang-luong',
                  checked: true
                }
              ]
            },
            {
              group: 'Tồn kho',
              items: [
                {
                  paths: ['/ton-kho/danh-sach'],
                  text: 'Tồn kho',
                  url: '/ton-kho/danh-sach',
                  checked: true
                },
                {
                  paths: ['/ton-kho/tieu-hao'],
                  text: 'Tiêu hao',
                  url: '/ton-kho/tieu-hao',
                  checked: true
                },
                {
                  paths: ['/ton-kho/du-kien-nvl'],
                  text: 'Nguyên vật liệu dự kiến',
                  url: '/ton-kho/du-kien-nvl',
                  checked: true
                }
              ]
            },
            {
              group: 'CSKH',
              items: [
                {
                  paths: ['/khach-hang/su-dung-app'],
                  text: 'Sử dụng App',
                  stocks: '',
                  handler: 'Report1.Program.Main',
                  url: '/cskh/bao-cao-cai-dat-app',
                  checked: true
                }
              ]
            },
            {
              group: 'Khác',
              items: [
                {
                  paths: ['/khac/tong-tien-vi-khach-hang'],
                  text: 'Báo cáo ví',
                  url: '/khac/bao-cao-vi',
                  checked: true
                },
                {
                  paths: ['/khac/bao-cao-the-tien'],
                  text: 'Báo cáo thẻ tiền',
                  url: '/khac/bao-cao-the-tien',
                  checked: true
                },
                {
                  paths: ['/khac/bao-cao-su-dung-the-tien'],
                  text: 'Báo cáo sử dụng thẻ tiền',
                  url: '/khac/bao-cao-su-dung-the-tien',
                  checked: true
                }
              ]
            }
          ]
        }
      }
    },
    rightTree: {
      groups: [
        {
          group: 'Báo cáo',
          rights: [
            {
              IsAllStock: false,
              hasRight: true,
              name: 'report',
              text: 'Báo cáo',
              stocksList: [
                {
                  ID: 11620,
                  Title: 'Cser Beauty Hà Nội'
                },
                {
                  ID: 11542,
                  Title: 'Cser beauty Hồ chí Minh'
                },
                {
                  ID: 11543,
                  Title: 'Cser Hue'
                },
                {
                  ID: 11544,
                  Title: 'RAZER CSER'
                }
              ],
              reports: {
                groups: [
                  {
                    group: 'Báo cáo ngày',
                    items: [
                      {
                        text: 'Tổng quan',
                        stocks: '11620',
                        jdata: {
                          paths: ['/bao-cao-ngay/danh-sach'],
                          url: '/bao-cao-ngay/tong-quan'
                        }
                      },
                      {
                        text: 'Khách hàng',
                        stocks: '11620',
                        jdata: {
                          paths: ['/khach-hang/chi-tiet-ngay'],
                          url: '/bao-cao-ngay/khach-hang'
                        }
                      }
                    ]
                  },
                  {
                    group: 'Bán hàng',
                    items: [
                      {
                        text: 'Doanh số',
                        jdata: {
                          paths: [
                            '/ban-hang/doanh-so-tong-quan',
                            '/ban-hang/doanh-so-danh-sach'
                          ],
                          url: '/ban-hang/doanh-so'
                        },
                        stocks: '11620'
                      },
                      {
                        text: 'Sản phẩm - dịch vụ bán ra',
                        jdata: {
                          paths: [
                            '/ban-hang/doanh-so-chi-tiet',
                            '/ban-hang/doanh-so-chi-tiet-2'
                          ],
                          url: '/ban-hang/sp-dv-ban-ra'
                        },
                        stocks: '11620'
                      }
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          group: 'Chức năng khác',
          rights: [
            {
              name: 'adminTools',
              subs: [
                {
                  name: 'adminTools_byStock',
                  IsAllStock: false,
                  hasRight: true,
                  stocksList: [{ ID: 11620 }]
                }
              ]
            }
          ]
        }
      ]
    }
  }
  window.token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjExMjQ2MTAxMDE5MDAwMDEiLCJuYmYiOjE3NjYwNzUzNTcsImV4cCI6MTg1MjQ3NTM1NywiaWF0IjoxNzY2MDc1MzU3fQ.r2Bpd4j458nhWiWlwKNSScT1Ww1lxjooOcq_LcG_acg'
}
const Auth = createSlice({
  name: 'auth',
  initialState: {
    Info: null,
    Token: null,
    GlobalConfig: null,
    StocksPermission: []
  },
  reducers: {
    setProfile: (state, { payload }) => {
      return {
        ...state,
        Token: payload.token,
        Info: payload.Info
      }
    },
    setGlobalConfig: (state, { payload }) => {
      return {
        ...state,
        GlobalConfig: payload.GlobalConfig
      }
    }
  },
  extraReducers: {}
})

const { reducer, actions } = Auth
export const { setProfile, setGlobalConfig } = actions
export default reducer
