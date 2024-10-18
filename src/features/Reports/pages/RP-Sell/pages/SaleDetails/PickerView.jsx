import React, { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'
import reportsApi from 'src/api/reports.api'
import moment from 'moment'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'
import { PriceHelper } from 'src/helpers/PriceHelper'

function PickerView({ children, item, filters }) {
  let [visible, setVisible] = useState(false)
  let [params, setParams] = useState({
    StockID: filters?.StockID,
    DateStart: filters?.DateStart,
    DateEnd: filters?.DateEnd,
    ids: item?.ProdId, // prodid
    Pi: 1,
    Ps: 15
  })
  const open = () => setVisible(true)
  const onHide = () => setVisible(false)
  
  let elRef = useRef(null)

  const { isLoading, data } = useQuery({
    queryKey: ['PreviewSale', { ...params }],
    queryFn: async ({}) => {
      const { data } = await reportsApi.getViewSaleDetail({
        ...params,
        StockID: params?.StockID,
        DateStart: params?.DateStart
          ? moment(params?.DateStart).format('DD/MM/YYYY')
          : '',
        DateEnd: params?.DateEnd
          ? moment(params?.DateEnd).format('DD/MM/YYYY')
          : '',
        ids: params?.ids
      })
      return data?.result || null
    },
    keepPreviousData: true,
    enabled: visible
  })
  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          params.Ps * (params.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ID',
        title: 'ID',
        dataKey: 'ID',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'CreateDate',
        title: 'Ngày tạo',
        dataKey: 'CreateDate',
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('DD-MM-YYYY'),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ProdTitle',
        title: 'Tên',
        dataKey: 'ProdTitle',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Qty',
        title: 'Số lượng',
        dataKey: 'Qty',
        cellRenderer: ({ rowData }) =>
          rowData.Status === 'finish' && rowData.IsReturn === 0
            ? rowData.Qty
            : -1 * rowData.Qty,
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'ToPay',
        title: 'Tổng thanh toán',
        dataKey: 'ToPay',
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'StockTitle',
        title: 'Cơ sở',
        dataKey: 'StockTitle',
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'OrderID',
        title: 'ID ĐH',
        dataKey: 'OrderID',
        width: 100,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderID',
        title: 'ID Khách hàng',
        dataKey: 'SenderID',
        width: 120,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderName',
        title: 'Khách hàng',
        dataKey: 'SenderName',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'SenderPhone',
        title: 'Số điện thoại',
        dataKey: 'SenderPhone',
        width: 160,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'Status',
        title: 'Trạng thái',
        dataKey: 'Status',
        width: 160,
        cellRenderer: ({ rowData }) =>
          rowData?.Status === 'finish' ? (
            <span className="font-medium text-success">Hoàn thành</span>
          ) : (
            <span className="font-medium text-danger">Trả hàng</span>
          ),
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ],
    [params]
  )
  const rowClassName = ({ rowData }) => {
    if (rowData.Status === 'cancel' && rowData.IsReturn > 0) {
      return 'bg-danger-o-50'
    }
  }
  return (
    <AnimatePresence>
      <>
        {children({ open: open })}

        {visible &&
          createPortal(
            <div className="fixed z-[125001] inset-0 flex justify-end flex-col">
              <motion.div
                className="relative z-20 flex flex-col h-full bg-white"
                initial={{ opacity: 0, translateY: '100%' }}
                animate={{ opacity: 1, translateY: '0%' }}
                exit={{ opacity: 0, translateY: '100%' }}
              >
                <div className="relative flex justify-between px-4 py-4 border-b md:py-5">
                  <div className="text-lg font-bold md:text-2xl">
                    {item?.ProdTitle}
                  </div>
                  <div
                    className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-4 top-2/4 -translate-y-2/4"
                    onClick={onHide}
                  >
                    <XMarkIcon className="w-6 md:w-8" />
                  </div>
                </div>
                <div className="p-4 overflow-auto grow md:overflow-hidden" ref={elRef}>
                  <ReactTableV7
                    rowKey="ID"
                    overscanRowCount={50}
                    filters={{
                      Pi: params.Pi,
                      Ps: params.Ps
                    }}
                    columns={columns}
                    data={data?.Items}
                    loading={isLoading}
                    pageCount={data?.PCount}
                    onPagesChange={({ Pi, Ps }) => {
                      setParams(prevState => ({
                        ...prevState,
                        Pi,
                        Ps
                      }))
                    }}
                    maxHeight={elRef?.current?.clientHeight - 90}
                    rowClassName={rowClassName}
                  />
                </div>
              </motion.div>
            </div>,
            document.getElementById('root')
          )}
      </>
    </AnimatePresence>
  )
}

export default PickerView
