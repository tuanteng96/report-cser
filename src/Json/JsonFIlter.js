export const JsonFilter = {
  VoucherList: [
    {
      value: 0,
      label: 'Không có Voucher'
    },
    {
      value: 1,
      label: 'Có Voucher'
    }
  ],

  PaymentList: [
    {
      value: 0,
      label: 'Còn nợ'
    },
    {
      value: 1,
      label: 'Thanh toán hết'
    }
  ],

  IsMemberList: [
    {
      value: 0,
      label: 'Khách cũ'
    },
    {
      value: 1,
      label: 'Khách mới'
    }
  ],

  TopTypeList: [
    {
      value: 1,
      label: 'Sản phẩm, NVL'
    },
    {
      value: 2,
      label: 'Dịch vụ, Phụ phí'
    },
    {
      value: 3,
      label: 'Thẻ tiền'
    }
  ],
  PaymentMethodsList: [
    {
      value: 'TM',
      label: 'Tiền mặt'
    },
    {
      value: 'CK',
      label: 'Chuyển khoản'
    },
    {
      value: 'QT',
      label: 'Quẹt thẻ'
    }
  ],

  TypeTCList: [
    {
      value: 0,
      label: 'Thu'
    },
    {
      value: 1,
      label: 'Chi'
    }
  ],

  TagsTCList: [
    {
      value: 'THU',
      label: 'Thu',
      type: 0
    },
    {
      value: 'THU_NAP_VI',
      label: 'Thu nạp ví',
      type: 0
    },
    {
      value: 'THU_GIU_LUONG',
      label: 'Thu giữ lương',
      type: 0
    },
    {
      value: 'THU_HOAN_UNG',
      label: 'Thu hoàn ứng',
      type: 0
    },
    {
      value: 'THU_BAN_HANG',
      label: 'Thu bán hàng',
      type: 0
    },
    {
      value: 'CHI',
      label: 'Chi',
      type: 1
    },
    {
      value: 'CHI_TRA_VI',
      label: 'Chi trả ví',
      type: 1
    },
    {
      value: 'CHI_TAM_UNG',
      label: 'Chi tạm ứng',
      type: 1
    },
    {
      value: 'CHI_GIU_LUONG',
      label: 'Trả tiền giữ lương',
      type: 1
    },
    {
      value: 'CHI_LUONG',
      label: 'Trả lương',
      type: 1
    }
  ],
  TypeCNList: [
    {
      value: 'SP',
      label: 'Sản phẩm'
    },
    {
      value: 'DV',
      label: 'Dịch vụ'
    },
    {
      value: 'NVL',
      label: 'Nguyên vật liệu'
    },
    {
      value: 'PP',
      label: 'Phụ phí'
    },
    {
      value: 'THE_TIEN',
      label: 'Thẻ tiền'
    }
  ],
  TypeCNHng: [
    {
      value: 'san_pham',
      label: 'Sản phẩm'
    },
    {
      value: 'dich_vu',
      label: 'Dịch vụ'
    },
    {
      value: 'nvl',
      label: 'Nguyên vật liệu'
    },
    {
      value: 'phu_phi',
      label: 'Phụ phí'
    },
    {
      value: 'the_tien',
      label: 'Thẻ tiền'
    }
  ],
  TypeCNList2: [
    {
      value: 'SP',
      label: 'Sản phẩm'
    },
    {
      value: 'DV',
      label: 'Dịch vụ'
    }
  ],
  CategoriesTKList: [
    {
      value: 0,
      label: 'Sản phẩm'
    },
    {
      value: 1,
      label: 'Nguyên vật liệu'
    }
  ],
  TagWLList: [
    {
      value: 'NAP_QUY',
      label: 'Nạp quỹ'
    },
    {
      value: 'CHI_QUY',
      label: 'Chi quỹ'
    },
    {
      value: 'CHINH_SUA_SO_BUOI_DV',
      label: 'Kết thúc lẻ buổi dịch vụ'
    },
    {
      value: 'HOAN_TIEN_MUA_HANG',
      label: 'Hoàn tiền mua hàng'
    },
    {
      value: 'KHAU_TRU_TICH_LUY',
      label: 'Khấu trừ tích lũy'
    },
    {
      value: 'TRA_HANG_HOAN_VI',
      label: 'Trả hàng hoàn ví'
    },
    {
      value: 'HH_GT',
      label: 'Hoa hồng giới thiệu'
    },
    {
      value: 'KHAU_TRU_HH_GT',
      label: 'Khấu trừ hoa hồng giới thiệu'
    },
    {
      value: 'CHIA_SE_MAGIAMGIA',
      label: 'Chia sẻ mã giảm giá'
    },
    {
      value: 'KET_THUC_THE_HOAN_VI',
      label: 'Kết thúc thẻ hoàn ví'
    },

    {
      value: 'DANG_KY_THANH_VIEN',
      label: 'Đăng ký thành viên'
    },
    {
      value: 'DANG_NHAP_LAN_DAU',
      label: 'Đăng nhập lần đầu'
    },
    {
      value: 'CHUC_MUNG_SN',
      label: 'Chúc mừng sinh nhật'
    },
    {
      value: 'CHUC_MUNG_SN_THANG',
      label: 'Chúc mừng sinh nhật tháng'
    },
    {
      value: 'THANH_TOAN_DH',
      label: 'Thanh toán đơn hàng'
    }
  ],
  TypeTTList: [
    {
      value: 'MUA_THE_TIEN',
      label: 'Mua thẻ tiền'
    },
    {
      value: 'THANH_TOAN_DON_HANG',
      label: 'Thanh toán đơn hàng'
    },
    {
      value: 'KET_THUC_THE',
      label: 'Hoàn thẻ tiền kết thúc thẻ'
    },
    {
      value: 'TRA_HANG',
      label: 'Hoàn thẻ tiền trả hàng'
    }
  ],
  StatusTTList: [
    {
      value: 'KHOA',
      label: 'Khóa'
    },
    {
      value: 'HET_HAN',
      label: 'Hết hạn'
    },
    {
      value: 'DANG_SU_DUNG',
      label: 'Đang sử dụng'
    }
  ],
  StatusWalletList: [
    {
      value: 'CON',
      label: 'Còn'
    },
    {
      value: 'HET',
      label: 'Hết'
    }
  ],
  TypeServiceMemberList: [
    {
      value: 'MUA_CHUA_SU_DUNG',
      label: 'Mua nhưng chưa sử dụng'
    },
    {
      value: 'CHUA_MUA_DV',
      label: 'Chưa mua dịch vụ'
    },
    {
      value: 'SD_GIAM_GIA',
      label: 'Chỉ sử dụng giảm giá'
    },
    {
      value: 'SD_BUOI_LE',
      label: 'Chỉ sử dụng buổi lẻ'
    }
  ],
  StatusServiceMemberList: [
    {
      value: 'CON_HAN',
      label: 'Hiện còn'
    },
    {
      value: 'HET_HAN',
      label: 'Không còn hiệu lực'
    },
    {
      value: 'DV_BAO_HANH',
      label: 'Thẻ bảo hành'
    }
  ],
  StarRatingList: [
    {
      value: 0,
      label: 'Chưa đánh giá'
    },
    {
      value: 1,
      label: '1 Sao'
    },
    {
      value: 2,
      label: '2 Sao'
    },
    {
      value: 3,
      label: '3 Sao'
    },
    {
      value: 4,
      label: '4 Sao'
    },
    {
      value: 5,
      label: '5 Sao'
    }
  ],
  FrequencyList: [
    {
      value: 'NGAY',
      label: 'Ngày'
    },
    {
      value: 'TUAN',
      label: 'Tuần'
    },
    {
      value: 'THANG',
      label: 'Tháng'
    },
    {
      value: 'NAM',
      label: 'Năm'
    },
    {
      value: 'KHAC',
      label: 'Khác'
    }
  ],
  BrowserTypeList: [
    {
      value: 'android',
      label: 'Android'
    },
    {
      value: 'ios',
      label: 'IOS'
    }
  ],
  BrowserStatusList: [
    {
      value: 0,
      label: 'Offline'
    },
    {
      value: 1,
      label: 'Online'
    }
  ],
  TypeNVList: [
    {
      value: 'Đơn hàng thay đổi khách hàng',
      label: 'Đơn hàng thay đổi khách hàng'
    },
    {
      value: 'Xóa đơn hàng',
      label: 'Xóa đơn hàng'
    },
    {
      value: 'Tạo buổi bảo hành',
      label: 'Tạo buổi bảo hành'
    },
    {
      value: 'Kết thúc dịch vụ',
      label: 'Kết thúc dịch vụ'
    },
    {
      value: 'Chuyển nhượng thẻ',
      label: 'Chuyển nhượng thẻ'
    },
    {
      value: 'Tặng buổi',
      label: 'Tặng buổi'
    },
    {
      value: 'Thay đổi ngày hết hạn',
      label: 'Thay đổi ngày hết hạn'
    },
    {
      value: 'Xóa buổi',
      label: 'Xóa buổi'
    },
    {
      value: 'Thêm buổi',
      label: 'Thêm buổi'
    },
    {
      value: 'Kích hoạt bảo hành',
      label: 'Kích hoạt bảo hành'
    },
    {
      value: 'Thay đổi cơ sở',
      label: 'Thay đổi cơ sở'
    }
  ],
  TypeNVList2: [
    {
      value: 'Kết thúc dịch vụ',
      label: 'Kết thúc dịch vụ'
    },
    {
      value: 'Xóa buổi',
      label: 'Xóa buổi'
    }
  ],
  ViewTypeList: [
    {
      value: 'DON_HANG',
      label: 'Đơn hàng'
    },
    {
      value: 'SD_DICH_VU',
      label: 'Sử dụng dịch vụ'
    },
    {
      value: 'THANH_TOAN_NO',
      label: 'Thanh toán nợ'
    },
    {
      value: 'NGHIEP_VU_KHAC',
      label: 'Nghiệp vụ khác'
    }
  ]
}
