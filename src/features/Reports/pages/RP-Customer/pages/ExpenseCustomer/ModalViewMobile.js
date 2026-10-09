import React from 'react'
import TableRowModal, {
  TableRowDetails
} from 'src/features/Reports/components/TableRowModal'

export default function ModalViewMobile({ show, onHide, data, columns }) {
  return (
    <TableRowModal show={show} onHide={onHide} title={data?.MemberFullName}>
      <TableRowDetails columns={columns.slice(1, 6)} data={data} />
      {data?.OrdersList?.map((order, index) => (
        <div className="border m-15px rounded" key={index}>
          <TableRowDetails
            columns={columns.slice(6)}
            data={{
              ...order,
              ...data,
              NgayMuaHang: order.CreateDate,
              CoSoMuaHang: order.StockName
            }}
          />
        </div>
      ))}
    </TableRowModal>
  )
}
