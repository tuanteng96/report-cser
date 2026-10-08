import { calculateAttendanceSalary } from 'src/features/Reports/pages/RP-Staff/pages/PayrollStaff/helpers/calculateAttendanceSalary'
import { DatetimeHelpers } from 'src/helpers/DatetimeHelpers'

test('tính đủ sáu khoản theo lượt chấm công và không sửa dữ liệu gốc', () => {
  const ctv = {
    CheckIn: '2026-09-02T08:00:00',
    CheckOut: '2026-09-02T10:00:00',
    Info: {
      Ratio: { ratio: 3 },
      WorkToday: { Title: 'CTV: tăng ca', Value: 3 },
      DI_SOM: { Value: 999999 }
    }
  }
  const salary = {
    LUONG_NGAY_CONG: 300000,
    User: { WorkTimeSetting: JSON.stringify({ SalaryHours: 50000 }) },
    TrackValue: {
      DI_MUON: 999999,
      DI_SOM: 999999,
      List: [
        {
          Info: {
            DI_MUON: { Value: -10000.25 },
            DI_SOM: { Value: 20000.25 },
            CheckOut: {
              VE_SOM: { Value: -5000 },
              VE_MUON: { Value: 10000 }
            }
          }
        },
        {
          Info: {
            Ratio: { ratio: 3 },
            WorkToday: { Value: 3 },
            DI_MUON: { Value: -30000 },
            DI_SOM: { Value: 60000 },
            CheckOut: {
              VE_SOM: { Value: -15000 },
              VE_MUON: { Value: 30000 }
            }
          }
        },
        ctv
      ],
      CTV: [ctv]
    },
    // Khoản OFF phải lấy từ phiếu lương cá nhân.
    BANGLUONGBC: { TrackValue: { CTV: [] } },
    WorkTrackDates: {
      weekdayLeave: [{}],
      weekendLeave: [{}],
      weekdayPermittedLeave: [{}],
      weekendPermittedLeave: [{}],
      weekdayNoLeave: [{}],
      weekendNoLeave: [{}]
    }
  }
  const original = JSON.parse(JSON.stringify(salary))
  const result = calculateAttendanceSalary(salary)

  expect(result.DI_MUON_VE_SOM).toBe(30000.25)
  expect(result.DI_SOM_VE_MUON).toBe(60000.25)
  expect(result.TANG_CA_OFF).toBe(200000)
  expect(result.TANG_CA_LE).toBe(930000)
  expect(result.TANG_CA_LE_DS.map(item => item.HolidayOvertimeValue)).toEqual([
    630000, 300000
  ])
  expect(result.NGHI_TRU_LUONG).toBe(1500000)
  expect(result.NGHI_TRU_LUONG_NOT_PHEP).toBe(1800000)
  expect(salary).toEqual(original)
})

test('loại đủ các dấu hiệu CTV khỏi đi muộn, về sớm và đi sớm, về muộn', () => {
  const result = calculateAttendanceSalary({
    TrackValue: {
      List: [
        { Title: 'CTV: ca giờ' },
        { value: 'CTV-THEO-GIO' },
        { SubTitle: 'CTV: ca giờ' },
        { label: 'CTV: ca giờ' }
      ].map(WorkToday => ({
        Info: {
          WorkToday,
          DI_MUON: { Value: -10000 },
          DI_SOM: { Value: 10000 },
          CheckOut: {
            VE_SOM: { Value: -10000 },
            VE_MUON: { Value: 10000 }
          }
        }
      }))
    }
  })

  expect(result.DI_MUON_VE_SOM).toBe(0)
  expect(result.DI_SOM_VE_MUON).toBe(0)
})

test('loại ngày OFF theo phân ca và áp dụng hệ số trừ ngày thường/cuối tuần', () => {
  const WorkTrackDates = DatetimeHelpers.splitWorkTrackDates(
    [
      { Date: '2020-09-01' },
      { Date: '2020-09-02', WorkOffs: [{ Type: 0, Status: 'DA_DUYET' }] },
      { Date: '2020-09-03', WorkOffs: [{ Type: 1, Status: 'DA_DUYET' }] },
      { Date: '2020-09-04', WorkOffs: [{ Type: 2, Status: 'DA_DUYET' }] },
      { Date: '2020-09-05' },
      { Date: '2020-09-06', WorkTrack: {} }
    ],
    null,
    true,
    [{ Date: '2020-09-01' }]
  )
  const result = calculateAttendanceSalary({
    WorkTrackDates,
    LUONG_NGAY_CONG: 300000
  })

  expect(result.NGHI_TRU_LUONG).toBe(600000)
  expect(result.NGHI_TRU_LUONG_NOT_PHEP).toBe(1200000)
})

test('dữ liệu trống hoặc ca lễ chưa có công không làm tổng thành NaN', () => {
  const empty = calculateAttendanceSalary({})
  const incomplete = calculateAttendanceSalary({
    LUONG_NGAY_CONG: 300000,
    TrackValue: {
      List: [{ Info: { Ratio: { ratio: 3 }, WorkToday: { Value: 0 } } }]
    }
  })

  for (const key of [
    'DI_MUON_VE_SOM',
    'DI_SOM_VE_MUON',
    'TANG_CA_OFF',
    'TANG_CA_LE',
    'NGHI_TRU_LUONG',
    'NGHI_TRU_LUONG_NOT_PHEP'
  ]) {
    expect(empty[key]).toBe(0)
  }
  expect(incomplete.TANG_CA_LE).toBe(0)
})
