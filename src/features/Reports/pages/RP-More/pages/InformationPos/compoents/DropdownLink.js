import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    onClick={e => {
      e.preventDefault()
      onClick(e)
    }}
    className="flex items-center cursor-pointer text-uppercase font-size-xl fw-600"
  >
    {children}
  </span>
))

function DropdownLink(props) {
  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-customers">
        Báo cáo thông tin khách hàng
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 ml-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m19.5 8.25-7.5 7.5-7.5-7.5"
          />
        </svg>
      </Dropdown.Toggle>

      <Dropdown.Menu align="end">
        {[
          '/khac/bao-cao-thong-tin-pos',
          '/khac/bao-cao-thong-tin-pos-1',
          '/khac/bao-cao-thong-tin-pos-2',
          '/khac/bao-cao-thong-tin-pos-3',
          '/khac/bao-cao-thong-tin-pos-4'
        ].map((item, index) => (
          <Dropdown.Item
            as={NavLink}
            className="dropdown-item-active"
            to={item}
            key={index}
          >
            Loại {index + 1}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default DropdownLink
