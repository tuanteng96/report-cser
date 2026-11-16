import React from 'react'
import PropTypes from 'prop-types'
import Pagination from '@material-ui/lab/Pagination'
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap'
import clsx from 'clsx'

const DEFAULT_SIZES = [15, 25, 50, 100, 500, 1000]

// Phân trang dùng chung: số trang + chọn số dòng mỗi trang (giống ReactBaseTable)
function TablePagination({
  pageCount,
  filters,
  onPagesChange,
  sizes = DEFAULT_SIZES,
  className
}) {
  if (!filters || !pageCount) return null
  return (
    <div
      className={clsx(
        'pagination d-flex justify-content-between align-items-center',
        className
      )}
    >
      <Pagination
        count={pageCount}
        page={filters.Pi}
        siblingCount={1}
        boundaryCount={1}
        variant="outlined"
        shape="rounded"
        onChange={(event, value) => {
          onPagesChange({ Pi: value, Ps: filters.Ps })
        }}
      />
      <div className="d-flex align-items-center text-gray-500">
        Hiển thị
        <div className="px-8px">
          <DropdownButton
            as={ButtonGroup}
            key="secondary"
            id="dropdown-table-pagination"
            variant=" font-weight-boldest"
            title={filters.Ps}
          >
            {sizes.map((item, index) => (
              <Dropdown.Item
                key={index}
                eventKey={index}
                active={item === filters.Ps}
                onClick={() => onPagesChange({ Pi: 1, Ps: item })}
              >
                {item}
              </Dropdown.Item>
            ))}
          </DropdownButton>
        </div>
        trên trang
      </div>
    </div>
  )
}

TablePagination.propTypes = {
  pageCount: PropTypes.number,
  filters: PropTypes.object,
  onPagesChange: PropTypes.func.isRequired,
  sizes: PropTypes.array,
  className: PropTypes.string
}

export default TablePagination
