import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { createPortal } from 'react-dom'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { FieldArray, Form, Formik } from 'formik'
import NumberFormat from 'react-number-format'
import moment from 'moment'
import { useMutation } from '@tanstack/react-query'
import reportsApi from 'src/api/reports.api'
import clsx from 'clsx'
import Swal from 'sweetalert2'

function PickerPay({ children, data, CrStockID, refetch }) {
  const swalClass = {
    popup: '!z-[125002]',
    container: '!z-[125002]'
  }

  let [visible, setVisible] = useState(false)
  let [initialValues, setInitialValues] = useState({
    Users: []
  })

  useEffect(() => {
    if (visible) {
      setInitialValues({
        Users: data
          ? data.map(x => ({
              ...x,
              Payment:
                x?.CON_LAI > 0
                  ? x?.CON_LAI > x.TOI_DA_UNG_LUONG
                    ? x.TOI_DA_UNG_LUONG
                    : x?.CON_LAI
                  : 0
            }))
          : null
      })
    }
  }, [visible])

  const open = () => setVisible(true)
  const onHide = () => setVisible(false)

  let elRef = useRef(null)

  const updateMutation = useMutation({
    mutationFn: async ({ Users }) => {
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      const users = Users || []
      let data = []

      Swal.fire({
        title: 'Đang thực hiện trả lương',
        html: `Đang xử lý 0/${users.length}`,
        customClass: swalClass,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      for (const [index, user] of users.entries()) {
        Swal.update({
          html: `Đang xử lý ${index + 1}/${users.length}`
        })

        let result = await reportsApi.userSalary(user)
        data.push(result)

        if (index < users.length - 1) {
          await delay(1000)
        }
      }

      await refetch()
      return data
    }
  })

  const onSubmit = async values => {
    let { Users } = values

    let newUsers = Users
      ? Users.filter(x => x?.Payment > 0).map(x => ({
          cmd: 'salary',
          userid: x?.User?.ID,
          mon: moment(x.From).format('MM/YYYY'),
          pay_salary: '1',
          methodid: '1',
          desc: '',
          SUM_ALL_PENDING_OR_NOPENDING: 1,
          HOAN_UNG_NGAY: 0,
          SalaryInput: x.Payment,
          SalaryInput1: x.Payment,
          stockid: CrStockID
        }))
      : []

    if (newUsers?.length === 0) return

    const result = await Swal.fire({
      title: 'Xác nhận trả lương',
      text: `Bạn có chắc muốn thực hiện trả lương cho ${newUsers.length} nhân viên?`,
      icon: 'question',
      customClass: swalClass,
      showCancelButton: true,
      confirmButtonText: 'Thực hiện',
      cancelButtonText: 'Hủy'
    })

    if (!result.isConfirmed) return

    try {
      await updateMutation.mutateAsync({ Users: newUsers })

      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Thực hiện thành công.',
        customClass: swalClass,
        showConfirmButton: false,
        timer: 1500
      })

      onHide()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Thực hiện thất bại',
        customClass: swalClass,
        text: error?.message || 'Không thể hoàn tất trả lương.'
      })
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
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                >
                  {formikProps => {
                    // errors, touched, handleChange, handleBlur
                    const { values, setFieldValue, handleBlur } = formikProps
                    return (
                      <Form className="flex flex-col h-full">
                        <div className="relative flex justify-between px-4 py-4 border-b md:py-5">
                          <div className="flex align-items-center">
                            <div className="text-lg font-bold md:text-2xl">
                              Trả lương
                            </div>
                          </div>
                          <div
                            className="absolute flex items-center justify-center w-12 h-12 cursor-pointer right-4 top-2/4 -translate-y-2/4"
                            onClick={onHide}
                          >
                            <XMarkIcon className="w-6 md:w-8" />
                          </div>
                        </div>
                        <FieldArray
                          name="Users"
                          render={arrayHelpers => (
                            <div
                              className="p-4 overflow-auto grow md:overflow-hidden"
                              ref={elRef}
                            >
                              <div className="overflow-x-auto border border-[#eee] relative h-full">
                                <table className="min-w-full border-separate border-spacing-0">
                                  <thead className="sticky top-0 bg-[#f8f8f8] z-[10] border-b border-b-[#eee]">
                                    <tr>
                                      <th className="p-3 font-semibold text-left min-w-[60px] max-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 font-number text-sm uppercase h-[50px] sticky top-0 left-0 bg-[#f8f8f8]">
                                        STT
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[140px] max-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[60px] bg-[#f8f8f8]">
                                        Mã nhân viên
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm sticky top-0 left-[200px] bg-[#f8f8f8]">
                                        Tên nhân viên
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                                        Chức danh
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[200px] max-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                                        Mã địa điểm hệ thống
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                                        Lương thực tế
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                                        Tạm ứng tối đa
                                      </th>
                                      <th className="uppercase p-3 font-semibold text-left min-w-[180px] max-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 h-[50px] font-number text-sm">
                                        Tạm ứng thực tế
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {values.Users &&
                                      values.Users.map((rowData, index) => (
                                        <tr key={index}>
                                          <td className="p-3 bg-white max-w-[60px] min-w-[60px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-0">
                                            {index + 1}
                                          </td>
                                          <td className="p-3 bg-white max-w-[140px] min-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[60px]">
                                            {rowData?.User?.YahooID}
                                          </td>
                                          <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 sticky top-0 left-[200px]">
                                            {rowData?.User?.FullName}
                                          </td>
                                          <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                                            {rowData?.User?.Address}
                                          </td>
                                          <td className="p-3 bg-white max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                                            {rowData?.BANGLUONGBC?.DiemQL &&
                                            rowData?.BANGLUONGBC?.DiemQL
                                              .length > 0
                                              ? rowData?.BANGLUONGBC?.DiemQL.map(
                                                  stock => stock.StockTitle
                                                ).join(', ')
                                              : 'Chưa xác định'}
                                          </td>

                                          <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                                            {PriceHelper.formatVND(
                                              rowData?.CON_LAI
                                            )}
                                          </td>
                                          <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                                            {PriceHelper.formatVND(
                                              rowData?.TOI_DA_UNG_LUONG
                                            )}
                                          </td>
                                          <td className="p-3 bg-white max-w-[180px] min-w-[180px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0">
                                            <NumberFormat
                                              allowNegative={false}
                                              name="Payment"
                                              placeholder="Nhập số tiền"
                                              className={`form-control`}
                                              isNumericString={true}
                                              thousandSeparator={true}
                                              value={
                                                values.Users[index].Payment ??
                                                ''
                                              }
                                              onValueChange={({
                                                floatValue,
                                                value
                                              }) => {
                                                setFieldValue(
                                                  `Users[${index}]Payment`,
                                                  value === '' ? '' : floatValue
                                                )
                                              }}
                                              onBlur={handleBlur}
                                              autoComplete="off"
                                              isAllowed={({ floatValue }) => {
                                                let MaxValue =
                                                  rowData?.CON_LAI > 0
                                                    ? rowData?.CON_LAI >
                                                      rowData?.TOI_DA_UNG_LUONG
                                                      ? rowData.TOI_DA_UNG_LUONG
                                                      : rowData?.CON_LAI
                                                    : 0
                                                return (
                                                  !floatValue ||
                                                  floatValue === undefined ||
                                                  floatValue <= MaxValue
                                                )
                                              }}
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        />
                        <div className="flex justify-end px-4 pb-4">
                          <button
                            type="submit"
                            className={clsx(
                              'btn btn-primary fw-500',
                              updateMutation.isPending &&
                                'spinner spinner-white spinner-right'
                            )}
                            disabled={updateMutation.isPending}
                          >
                            {updateMutation.isPending
                              ? 'Đang thực hiện ...'
                              : 'Thực hiện trả lương'}
                          </button>
                        </div>
                      </Form>
                    )
                  }}
                </Formik>
              </motion.div>
            </div>,
            document.getElementById('root')
          )}
      </>
    </AnimatePresence>
  )
}

export default PickerPay
