import React from 'react'
import TableRowModal, {
  TableRowDetails
} from 'src/features/Reports/components/TableRowModal'

export default function ModalViewMobile({ show, onHide, data, columns, View }) {
  if (View === 1) {
    return (
      <TableRowModal
        show={show}
        onHide={onHide}
        data={data}
        columns={columns}
        title={data?.Member?.FullName}
      />
    )
  }
  return (
    <TableRowModal show={show} onHide={onHide} title={data?.MemberFullName}>
      <TableRowDetails columns={columns.slice(1, 6)} data={data} />
      {data?.ProdsList?.map((product, index) => (
        <div className="border m-15px rounded" key={index}>
          <TableRowDetails
            columns={columns.slice(6)}
            data={{
              ...product,
              CreateDateProd: product.CreateDate,
              TanSuatSDProd: product.TanSuatSD,
              ...data
            }}
          />
        </div>
      ))}
    </TableRowModal>
  )
}
