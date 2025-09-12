import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'
import reportsApi from 'src/api/reports.api'
import moment from 'moment'
import { useQuery } from '@tanstack/react-query'
import ReactTableV7 from 'src/components/Tables/ReactTableV7'

function PickerView({ children, item, filters }) {
  let [visible, setVisible] = useState(false)
  let [params, setParams] = useState({
    StockID: filters?.StockID,
    DateStart: filters?.DateStart,
    DateEnd: filters?.DateEnd,
    Pi: 1,
    Ps: 15
  })

  const open = () => setVisible(true)
  const onHide = () => setVisible(false)

  let elRef = useRef(null)

  useEffect(() => {
    setParams(prevState => ({
      ...prevState,
      StockID: filters?.StockID,
      DateStart: filters?.DateStart,
      DateEnd: filters?.DateEnd,
      Pi: 1
    }))
  }, [filters])

  const { isLoading, data } = useQuery({
    queryKey: ['PreviewCountMember', { ...params }],
    queryFn: async () => {
      const { data } = await reportsApi.getGuestsCount({
        ...params,
        StockID: params?.StockID,
        From: params?.DateStart
          ? moment(params?.DateStart).format('YYYY-MM-DD')
          : '',
        To: params?.DateEnd ? moment(params?.DateEnd).format('YYYY-MM-DD') : ''
      })
      return data || null
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
        key: 'FullName',
        title: 'Khách hàng',
        dataKey: 'FullName',
        width: 250,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'MobilePhone',
        title: 'Số điện thoại',
        dataKey: 'MobilePhone',
        width: 200,
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
          moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY'),
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      },
      {
        key: 'GuestCount',
        title: 'Số lượng khách',
        dataKey: 'GuestCount',
        width: 180,
        sortable: false,
        mobileOptions: {
          visible: true
        }
      }
    ],
    [params]
  )

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
                  <div className="flex align-items-center">
                    <div className="text-lg font-bold md:text-2xl">
                      Khách phục vụ
                    </div>
                  </div>
                  <div
                    className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-4 top-2/4 -translate-y-2/4"
                    onClick={onHide}
                  >
                    <XMarkIcon className="w-6 md:w-8" />
                  </div>
                </div>
                <div
                  className="p-4 overflow-auto grow md:overflow-hidden"
                  ref={elRef}
                >
                  <ReactTableV7
                    rowKey="ID"
                    overscanRowCount={50}
                    filters={{
                      Pi: params.Pi,
                      Ps: params.Ps
                    }}
                    columns={columns}
                    data={data?.lst || []}
                    loading={isLoading}
                    pageCount={data?.pCount}
                    onPagesChange={({ Pi, Ps }) => {
                      setParams(prevState => ({
                        ...prevState,
                        Pi,
                        Ps
                      }))
                    }}
                    maxHeight={elRef?.current?.clientHeight - 90}
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
