import React from 'react'
import { NavLink } from 'react-router-dom'

function NavBar(props) {
  return (
    <div className="position-absolute w-100 h-55px top-0 left-0 shadows px-30px">
      <ul className="ezs-navbar">
        <li>
          <NavLink to="/">
            <i className="fa-regular fa-chart-pie icon"></i>
            <span>Báo cáo ngày</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/1">
            <i className="fa-regular fa-chart-user icon"></i>
            <span>Khách hàng</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/2">
            <i className="fa-regular fa-cart-circle-check icon"></i>
            <span>Bán hàng</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/3">
            <i className="fa-regular fa-chart-waterfall icon"></i>
            <span>Dịch vụ</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/4">
            <i className="fa-regular fa-piggy-bank icon"></i>
            <span>Thu chi</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/5">
            <i className="fa-regular fa-circle-dollar-to-slot icon"></i>
            <span>Sổ quỹ</span>
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
        </li>
        <li>
          <NavLink to="/8">
            <i className="fa-regular fa-chart-mixed icon"></i>
            <span>Công nợ</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
        </li>
        <li>
          <NavLink to="/9">
            <i className="fa-regular fa-handshake icon"></i>
            <span>CSKH</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
        </li>
        <li>
          <NavLink to="/0">
            <i className="fa-regular fa-chart-scatter-bubble icon"></i>
            <span>Khác</span>
            <i className="fa-solid fa-chevron-down icon-down"></i>
          </NavLink>
        </li>
      </ul>
    </div>
  )
}

export default NavBar
