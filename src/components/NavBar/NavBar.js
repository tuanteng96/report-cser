import React, { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useWindowSize } from 'src/hooks/useWindowSize'
import PerfectScrollbar from 'react-perfect-scrollbar'
import clsx from 'clsx'
import { useSelector, useDispatch } from 'react-redux'
import { ToggleAside } from '../../layout/LayoutSlice'

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function NavBar(props) {
  const { isShowMobile } = useSelector(({ layout }) => ({
    isShowMobile: layout.aside.isShowMobile
  }))
  const { width } = useWindowSize()
  const [IndexShow, setIndexShow] = useState('')
  let location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    if (width < 1200) {
      dispatch(ToggleAside(false))
    }
    setIndexShow('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

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

  const getMenuItemActive = (key, subdomain) => {
    const { pathname } = location
    const index = pathname && pathname.indexOf(subdomain)
    if (index > -1 && !IndexShow) {
      setIndexShow(key)
    }
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
              <li>
                <NavLink to="/">
                  <i className="fa-regular fa-chart-pie icon"></i>
                  <span>Báo cáo ngày</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/khach-hang">
                  <i className="fa-regular fa-chart-user icon"></i>
                  <span>Khách hàng</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/dich-vu">
                  <i className="fa-regular fa-chart-waterfall icon"></i>
                  <span>Dịch vụ</span>
                </NavLink>
              </li>
              <li
                className={clsx(
                  IndexShow === 'BAN_HANG' && 'menu-item-open',
                  getMenuItemActive('BAN_HANG', '/ban-hang')
                )}
              >
                <NavLink to="/ban-hang">
                  <i className="fa-regular fa-cart-circle-check icon"></i>
                  <span>Bán hàng</span>
                </NavLink>
                <div
                  className="btn-down"
                  onClick={() => OpenSubmenu('BAN_HANG')}
                >
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                </div>
                <div className="ezs-navbar__sub">
                  <ul>
                    <li>
                      <NavLink to="/ban-hang/doanh-so">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Doanh số</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/ban-hang/sp-dv-ban-ra">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Sản phẩm, dịch vụ bán ra
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/ban-hang/tra-hang">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Trả hàng</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/ban-hang/thanh-toan-tra-no">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Thanh toán trả nợ</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
              <li>
                <NavLink to="/thu-chi-va-so-quy">
                  <i className="fa-regular fa-piggy-bank icon"></i>
                  <span>Thu chi & Sổ quỹ</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/6">
                  <i className="fa-regular fa-chart-pie icon"></i>
                  <span>Tồn kho</span>
                </NavLink>
              </li>
              <li
                className={clsx(
                  IndexShow === 'NHAN_VIEN' && 'menu-item-open',
                  getMenuItemActive('NHAN_VIEN', '/nhan-vien')
                )}
              >
                <NavLink to="/7">
                  <i className="fa-regular fa-chart-candlestick icon"></i>
                  <span>Nhân viên</span>
                </NavLink>
                <div
                  className="btn-down"
                  onClick={() => OpenSubmenu('NHAN_VIEN')}
                >
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                </div>
                <div className="ezs-navbar__sub">
                  <ul>
                    <li>
                      <NavLink to="/b1">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Hoa hồng</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/b2">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Danh số</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/b3">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Bảng lương</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
              <li
                className={clsx(
                  IndexShow === 'CONG_NO' && 'menu-item-open',
                  getMenuItemActive('CONG_NO', '/cong-no')
                )}
              >
                <NavLink to="/cong-no">
                  <i className="fa-regular fa-chart-mixed icon"></i>
                  <span>Công nợ</span>
                </NavLink>
                <div
                  className="btn-down"
                  onClick={() => OpenSubmenu('CONG_NO')}
                >
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                </div>
                <div className="ezs-navbar__sub">
                  <ul>
                    <li>
                      <NavLink to="/cong-no/danh-sach">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Công nợ</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/cong-no/khoa-no">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Báo cáo khóa nợ</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/cong-no/tang">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Báo cáo tặng</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
              <li
                className={clsx(
                  IndexShow === 'CSKH' && 'menu-item-open',
                  getMenuItemActive('CSKH', '/cskh')
                )}
              >
                <NavLink to="/9">
                  <i className="fa-regular fa-handshake icon"></i>
                  <span>CSKH</span>
                </NavLink>
                <div className="btn-down" onClick={() => OpenSubmenu('CSKH')}>
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                </div>
                <div className="ezs-navbar__sub">
                  <ul>
                    <li>
                      <NavLink to="/d1">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Khách hàng sử dụng APP
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d2">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Khách hàng sinh nhật</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d3">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Khách hàng sắp lên cấp
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d4">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Khách hàng hết sản phẩm
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d5">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Khách lâu không sử dụng
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d6">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Khách hết thẻ trong ngày
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d7">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Thời gian nghe Smart Call
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/d8">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Đánh giá dịch vụ</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
              <li
                className={clsx(
                  IndexShow === 'KHAC' && 'menu-item-open',
                  getMenuItemActive('KHAC', '/khac')
                )}
              >
                <NavLink to="/khac">
                  <i className="fa-regular fa-chart-scatter-bubble icon"></i>
                  <span>Khác</span>
                </NavLink>
                <div className="btn-down" onClick={() => OpenSubmenu('KHAC')}>
                  <i className="fa-solid fa-chevron-down icon-down"></i>
                </div>
                <div className="ezs-navbar__sub only-right">
                  <ul>
                    <li>
                      <NavLink to="/khac/top-ban-hang-doanh-so">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Top bán hàng, doanh số
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/e3">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Dịch vụ đã bán chưa thực hiện
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/e4">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">
                          Tổng tiền ví khách hàng
                        </span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/e5">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Tổng tiền thẻ tiền</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/e6">
                        <i className="menu-bullet menu-bullet-dot">
                          <span></span>
                        </i>
                        <span className="menu-text">Lợi nhuận</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </PerfectScrollbar>
        </div>
        <div className="navbar-overlay" onClick={onHideAside}></div>
      </div>
    )
  }
  return (
    <div className="position-fixed zindex-1001 w-100 h-55px top-0 left-0 shadows px-30px bg-white">
      <ul className="ezs-navbar">
        <li>
          <NavLink to="/">
            <i className="fa-regular fa-chart-pie icon"></i>
            <span>Báo cáo ngày</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/khach-hang">
            <i className="fa-regular fa-chart-user icon"></i>
            <span>Khách hàng</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/dich-vu">
            <i className="fa-regular fa-chart-waterfall icon"></i>
            <span>Dịch vụ</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/ban-hang">
            <i className="fa-regular fa-cart-circle-check icon"></i>
            <span>Bán hàng</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
          <div className="ezs-navbar__sub">
            <ul>
              <li>
                <NavLink to="/ban-hang/doanh-so">Doanh số</NavLink>
              </li>
              <li>
                <NavLink to="/ban-hang/sp-dv-ban-ra">
                  Sản phẩm, dịch vụ bán ra
                </NavLink>
              </li>
              <li>
                <NavLink to="/ban-hang/tra-hang">Trả hàng</NavLink>
              </li>
              <li>
                <NavLink to="/ban-hang/thanh-toan-tra-no">
                  Thanh toán trả nợ
                </NavLink>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <NavLink to="/thu-chi-va-so-quy">
            <i className="fa-regular fa-piggy-bank icon"></i>
            <span>Thu chi & Sổ quỹ</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/6">
            <i className="fa-regular fa-chart-pie icon"></i>
            <span>Tồn kho</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/7">
            <i className="fa-regular fa-chart-candlestick icon"></i>
            <span>Nhân viên</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
          <div className="ezs-navbar__sub">
            <ul>
              <li>
                <NavLink to="/">Hoa hồng</NavLink>
              </li>
              <li>
                <NavLink to="/">Danh số</NavLink>
              </li>
              <li>
                <NavLink to="/">Bảng lương</NavLink>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <NavLink to="/cong-no">
            <i className="fa-regular fa-chart-mixed icon"></i>
            <span>Công nợ</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
          <div className="ezs-navbar__sub">
            <ul>
              <li>
                <NavLink to="/cong-no/danh-sach">Công nợ</NavLink>
              </li>
              <li>
                <NavLink to="/cong-no/khoa-no">Báo cáo khóa nợ</NavLink>
              </li>
              <li>
                <NavLink to="/cong-no/tang">Báo cáo tặng</NavLink>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <NavLink to="/9">
            <i className="fa-regular fa-handshake icon"></i>
            <span>CSKH</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
          <div className="ezs-navbar__sub">
            <ul>
              <li>
                <NavLink to="/">Khách hàng sử dụng APP</NavLink>
              </li>
              <li>
                <NavLink to="/">Khách hàng sinh nhật</NavLink>
              </li>
              <li>
                <NavLink to="/">Khách hàng sắp lên cấp</NavLink>
              </li>
              <li>
                <NavLink to="/">Khách hàng hết sản phẩm</NavLink>
              </li>
              <li>
                <NavLink to="/">Khách lâu không sử dụng</NavLink>
              </li>
              <li>
                <NavLink to="/">Khách hết thẻ trong ngày</NavLink>
              </li>
              <li>
                <NavLink to="/">Thời gian nghe Smart Call</NavLink>
              </li>
              <li>
                <NavLink to="/">Đánh giá dịch vụ</NavLink>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <NavLink to="/khac">
            <i className="fa-regular fa-chart-scatter-bubble icon"></i>
            <span>Khác</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
          <div className="ezs-navbar__sub only-right">
            <ul>
              <li>
                <NavLink to="/khac/top-ban-hang-doanh-so">
                  Top bán hàng, doanh số
                </NavLink>
              </li>
              <li>
                <NavLink to="/">Dịch vụ đã bán chưa thực hiện</NavLink>
              </li>
              <li>
                <NavLink to="/">Tổng tiền ví khách hàng</NavLink>
              </li>
              <li>
                <NavLink to="/">Tổng tiền thẻ tiền</NavLink>
              </li>
              <li>
                <NavLink to="/">Lợi nhuận</NavLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default NavBar
