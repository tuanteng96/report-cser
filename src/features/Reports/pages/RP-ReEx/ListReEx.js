import React, { useEffect, useState } from 'react'
import BaseTablesCustom from 'src/components/Tables/BaseTablesCustom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import ModalViewMobile from './ModalViewMobile'
import { JsonFilter } from 'src/Json/JsonFilter'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function ListReEx({
  filters,
  onSizePerPageChange,
  onPageChange,
  loading,
  DataResult
}) {
  const [ListData, setListData] = useState([])
  const [PageTotal, setPageTotal] = useState(0)
  const [initialValuesMobile, setInitialValuesMobile] = useState(null)
  const [isModalMobile, setIsModalMobile] = useState(false)

  useEffect(() => {
    if (DataResult) {
      const { Items, Total } = DataResult
      setListData(Items)
      setPageTotal(Total)
    } else {
      setListData([])
      setPageTotal(0)
    }
  }, [DataResult])

  const OpenModalMobile = value => {
    setInitialValuesMobile(value)
    setIsModalMobile(true)
  }

  const HideModalMobile = () => {
    setInitialValuesMobile(null)
    setIsModalMobile(false)
  }

  const TransferTags = value => {
    const index = JsonFilter.TagsTCList.findIndex(item => item.value === value)
    if (index > -1) {
      return JsonFilter.TagsTCList[index].label
    }
    return value
  }

  return (
    <div className="bg-white rounded mt-25px">
      <div className="px-20px py-15px border-bottom border-gray-200 d-flex align-items-center justify-content-between">
        <div className="fw-500 font-size-lg">Danh sách thu chi & sổ quỹ</div>
      </div>
      <div className="p-20px">
        <BaseTablesCustom
          data={ListData}
          textDataNull="Không có dữ liệu."
          optionsMoible={{
            itemShow: 5,
            CallModal: row => OpenModalMobile(row)
          }}
          options={{
            custom: true,
            totalSize: PageTotal,
            page: filters.Pi,
            sizePerPage: filters.Ps,
            alwaysShowAllBtns: true,
            onSizePerPageChange: sizePerPage => {
              setListData([])
              const Ps = sizePerPage
              onSizePerPageChange(Ps)
              //setFilters({ ...filters, Ps: Ps })
            },
            onPageChange: page => {
              setListData([])
              const Pi = page
              onPageChange(Pi)
              //setFilters({ ...filters, Pi: Pi })
            }
          }}
          columns={[
            {
              dataField: '',
              text: 'STT',
              formatter: (cell, row, rowIndex) => (
                <span className="font-number">
                  {filters.Ps * (filters.Pi - 1) + (rowIndex + 1)}
                </span>
              ),
              headerStyle: () => {
                return { width: '60px' }
              },
              headerAlign: 'center',
              style: { textAlign: 'center' },
              attrs: { 'data-title': 'STT' }
            },
            {
              dataField: 'CreateDate',
              text: 'Ngày',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                moment(row.CreateDate).format('HH:mm DD/MM/YYYY'),
              attrs: { 'data-title': 'Ngày' },
              headerStyle: () => {
                return { minWidth: '150px', width: '150px' }
              }
            },
            {
              dataField: 'TM',
              text: 'Tiền mặt',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVNDPositive(row.TM),
              attrs: { 'data-title': 'Tiền mặt' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'CK',
              text: 'Chuyển khoản',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.CK),
              attrs: { 'data-title': 'Chuyển khoản' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'QT',
              text: 'Quẹt thẻ',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => PriceHelper.formatVND(row.QT),
              attrs: { 'data-title': 'Quẹt thẻ' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Tag',
              text: 'Tag',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => `${TransferTags(row.Tag)}`,
              attrs: { 'data-title': 'Tag' },
              headerStyle: () => {
                return { minWidth: '180px', width: '180px' }
              }
            },
            {
              dataField: 'Content',
              text: 'Nội dung',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.Content || 'Không có nội dung',
              attrs: { 'data-title': 'Nội dung' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'StockName',
              text: 'Cơ sở',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) => row.StockName || 'Tất cả cơ sở',
              attrs: { 'data-title': 'Cơ sở' },
              headerStyle: () => {
                return { minWidth: '200px', width: '200px' }
              }
            },
            {
              dataField: 'Member',
              text: 'Khách hàng',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Member
                  ? `${row.Member.FullName} (#${row.Member.ID})`
                  : 'Chưa xác định',
              attrs: { 'data-title': 'Khách hàng' },
              headerStyle: () => {
                return { minWidth: '220px', width: '220px' }
              }
            },
            {
              dataField: 'Staff',
              text: 'Nhân viên tạo',
              //headerAlign: "center",
              //style: { textAlign: "center" },
              formatter: (cell, row) =>
                row.Staff
                  ? `${row.Staff.FullName} (#${row.Staff.ID})`
                  : 'Chưa xác định',
              attrs: { 'data-title': 'Nhân viên tạo' },
              headerStyle: () => {
                return { minWidth: '220px', width: '220px' }
              }
            }
          ]}
          loading={loading}
          keyField="Id"
          className="table-responsive-attr"
          classes="table-bordered"
        />
      </div>
      <ModalViewMobile
        show={isModalMobile}
        onHide={HideModalMobile}
        data={initialValuesMobile}
        TransferTags={TransferTags}
      />
    </div>
  )
}

export default ListReEx
