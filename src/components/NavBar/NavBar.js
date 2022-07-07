import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useWindowSize } from 'src/hooks/useWindowSize'
import PerfectScrollbar from 'react-perfect-scrollbar'
import clsx from 'clsx'
import { useSelector, useDispatch } from 'react-redux'
import { ToggleAside } from '../../layout/LayoutSlice'
import Swal from 'sweetalert2'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

const MenuList = [
  {
    Title: 'Báo cáo ngày',
    TitleKey: 'BAO_CAO_NGAY',
    IconClass: 'fa-regular fa-chart-pie icon',
    Href: '/'
  },
  {
    Title: 'Khách hàng',
    TitleKey: 'KHACH_HANG',
    IconClass: 'fa-regular fa-chart-user icon',
    Href: '/khach-hang'
  },
  {
    Title: 'Dịch vụ',
    TitleKey: 'DICH_VU',
    IconClass: 'fa-regular fa-chart-waterfall icon',
    Href: '/dich-vu'
  },
  {
    Title: 'Bán hàng',
    TitleKey: 'BAN_HANG',
    IconClass: 'fa-regular fa-cart-circle-check icon',
    Href: '/ban-hang',
    Children: [
      {
        Title: 'Doanh số',
        Href: '/ban-hang/doanh-so'
      },
      {
        Title: 'Sản phẩm, dịch vụ bán ra',
        Href: '/ban-hang/sp-dv-ban-ra'
      },
      {
        Title: 'Trả hàng',
        Href: '/ban-hang/tra-hang'
      },
      {
        Title: 'Thanh toán trả nợ',
        Href: '/ban-hang/thanh-toan-tra-no'
      },
      {
        Title: 'Top bán hàng, doanh số',
        Href: '/ban-hang/top-ban-hang-doanh-so'
      }
    ]
  },
  {
    Title: 'Thu chi & Sổ quỹ',
    TitleKey: 'THU_CHI_SO_QUY',
    IconClass: 'fa-regular fa-piggy-bank icon',
    Href: '/thu-chi-va-so-quy'
  },
  {
    Title: 'Công nợ',
    TitleKey: 'CONG_NO',
    IconClass: 'fa-regular fa-chart-mixed icon',
    Href: '/cong-no',
    Children: [
      {
        Title: 'Công nợ',
        Href: '/cong-no/danh-sach'
      },
      {
        Title: 'Báo cáo khóa nợ',
        Href: '/cong-no/khoa-no'
      },
      {
        Title: 'Báo cáo tặng',
        Href: '/cong-no/tang'
      }
    ]
  },
  {
    Title: 'Nhân viên',
    TitleKey: 'NHAN_VIEN',
    IconClass: 'fa-regular fa-chart-candlestick icon',
    Href: '/nhan-vien',
    Children: [
      {
        Title: 'Lương ca dịch vụ',
        Href: '/nhan-vien/luong-ca-dich-vu'
      },
      {
        Title: 'Hoa hồng',
        Href: '/nhan-vien/hoa-hong'
      },
      {
        Title: 'Doanh số',
        Href: '/nhan-vien/doanh-so'
      },
      {
        Title: 'Bảng lương',
        Href: '/nhan-vien/bang-luong'
      }
    ]
  },
  {
    Title: 'Tồn kho',
    TitleKey: 'TON_KHO',
    IconClass: 'fa-regular fa-chart-pie icon',
    Href: '/ton-kho',
    Children: [
      {
        Title: 'Tồn kho',
        Href: '/ton-kho/danh-sach'
      },
      {
        Title: 'Tiêu hao',
        Href: '/ton-kho/tieu-hao'
      },
      {
        Title: 'Nguyên vật liệu dự kiến',
        Href: '/ton-kho/du-kien-nvl'
      }
    ]
  },
  // {
  //   Title: 'CSKH',
  //   TitleKey: 'CSKH',
  //   IconClass: 'fa-regular fa-handshake icon',
  //   Href: '/cskh',
  //   Children: [
  //     {
  //       Title: 'Khách hàng sử dụng APP',
  //       Href: '/cskh/khach-hang-su-dung-app'
  //     },
  //     {
  //       Title: 'Khách hàng sinh nhật',
  //       Href: '/cskh/khach-hang-sinh-nhat'
  //     },
  //     {
  //       Title: 'Khách hàng sắp lên cấp',
  //       Href: '/cskh/khach-hang-sap-len-cap'
  //     },
  //     {
  //       Title: 'Khách hàng hết sản phẩm',
  //       Href: '/cskh/khach-hang-het-san-pham'
  //     },
  //     {
  //       Title: 'Khách hết thẻ trong ngày',
  //       Href: '/cskh/khach-het-the-trong-ngay'
  //     },
  //     {
  //       Title: 'Thẻ sắp hết hạn',
  //       Href: '/cskh/the-sap-het-han'
  //     },
  //     {
  //       Title: 'Thời gian nghe Smart Call',
  //       Href: '/cskh/thoi-gian-nghe-smart-call'
  //     },
  //     {
  //       Title: 'Đánh giá dịch vụ',
  //       Href: '/cskh/danh-gia-dich-vu'
  //     },
  //     {
  //       Title: 'Chỉ sử dụng mã giảm giá',
  //       Href: '/cskh/chi-su-dung-ma-giam-gia'
  //     },
  //     {
  //       Title: 'Chỉ sử dụng buổi lẻ',
  //       Href: '/cskh/chi-su-dung-buoi-le'
  //     },
  //     {
  //       Title: 'Top ưu đãi sử dụng',
  //       Href: '/cskh/top-uu-dai-su-dung'
  //     },
  //     {
  //       Title: 'Tần suất sử dụng dịch vụ',
  //       Href: '/cskh/tan-suat-su-dunng-dich-vu'
  //     }
  //   ]
  // },
  {
    Title: 'Khác',
    TitleKey: 'KHAC',
    IconClass: 'fa-regular fa-chart-scatter-bubble icon',
    Href: '/khac',
    Children: [
      // {
      //   Title: 'Top đánh giá',
      //   Href: '/khac/top-danh-gia'
      // },
      // {
      //   Title: 'Dịch vụ đã bán chưa thực hiện',
      //   Href: '/khac/dich-vu-da-ban-chua-thuc-hien'
      // },
      {
        Title: 'Báo cáo ví',
        Href: '/khac/bao-cao-vi'
      },
      {
        Title: 'Báo cáo thẻ tiền',
        Href: '/khac/bao-cao-the-tien'
      },
      {
        Title: 'Báo cáo sử dụng thẻ tiền',
        Href: '/khac/bao-cao-su-dung-the-tien'
      }
      // {
      //   Title: 'Lợi nhuận',
      //   Href: '/khac/loi-nhuan'
      // }
    ]
  }
]

function NavBar(props) {
  const { isShowMobile } = useSelector(({ layout }) => ({
    isShowMobile: layout.aside.isShowMobile
  }))
  const { width } = useWindowSize()
  const [IndexShow, setIndexShow] = useState('')
  const [locationCurent, setLocationCurrent] = useState('')
  let location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (width < 1200) {
      dispatch(ToggleAside(false))
    }
    setLocationCurrent(location.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  useEffect(() => {
    if (location.pathname !== locationCurent) {
      Swal.close()
    }
  }, [location, locationCurent])

  useEffect(() => {
    const { pathname } = location
    const index = MenuList.findIndex(item => {
      if (item.Href === pathname) return item.Href === pathname
      return item.Children && item.Children.some(sub => sub.Href === pathname)
    })
    if (index > -1) {
      setIndexShow(MenuList[index].TitleKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MenuList, location])

  const OpenSubmenu = key => {
    if (key === IndexShow) {
      setIndexShow('')
    } else {
      setIndexShow(key)
    }
  }

  const onHideAside = () => {
    dispatch(ToggleAside(false))
  }

  if (width < 1200) {
    return (
      <div className={clsx('ezs-navbars-mobile', isShowMobile && 'show')}>
        <div className="ezs-navbar-mobile">
          <PerfectScrollbar
            options={perfectScrollbarOptions}
            className="scroll h-100"
            style={{ position: 'relative' }}
          >
            <ul className="ezs-navbars">
              {MenuList &&
                MenuList.map((item, index) => (
                  <li
                    className={clsx(
                      IndexShow === item.TitleKey && 'menu-item-open'
                    )}
                    key={index}
                  >
                    <NavLink to={item.Href}>
                      <i className={item.IconClass}></i>
                      <span>{item.Title}</span>
                    </NavLink>
                    {item.Children && item.Children.length > 0 && (
                      <div
                        className="btn-down"
                        onClick={() => OpenSubmenu(item.TitleKey)}
                      >
                        <i className="fa-solid fa-chevron-down icon-down"></i>
                      </div>
                    )}
                    {item.Children && item.Children.length > 0 && (
                      <div className="ezs-navbar__sub">
                        <ul>
                          {item.Children.map((sub, i) => (
                            <li key={i}>
                              <NavLink to={sub.Href}>
                                <i className="menu-bullet menu-bullet-dot">
                                  <span></span>
                                </i>
                                <span className="menu-text">{sub.Title}</span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                ))}
            </ul>
          </PerfectScrollbar>
        </div>
        <div className="navbar-overlay" onClick={onHideAside}></div>
      </div>
    )
  }
  return (
    <div className="position-fixed zindex-1001 w-100 h-55px top-0 left-0 px-30px bg-white">
      <ul className="ezs-navbar">
        {MenuList &&
          MenuList.map((item, index) => (
            <li key={index}>
              <NavLink to={item.Href}>
                <i className={item.IconClass}></i>
                <span>{item.Title}</span>
                {item.Children && item.Children.length > 0 && (
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                )}
              </NavLink>
              {item.Children && item.Children.length > 0 && (
                <div className="ezs-navbar__sub">
                  <ul>
                    {item.Children.map((sub, i) => (
                      <li key={i}>
                        <NavLink to={sub.Href}>{sub.Title}</NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  )
}

export default NavBar
