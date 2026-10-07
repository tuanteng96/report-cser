const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const source = fs.readFileSync(path.join(__dirname, '../excel/index.js'), 'utf8')
const start = source.indexOf("    case '/nhan-vien/bang-luong-4':")
const end = source.indexOf('case ', start + 5)
assert(start >= 0 && end > start, 'Missing payroll-4 export case')
const code = `switch (Url) { ${source.slice(start, end)} }`
const fields = [
  'NGAY_CONG_THANG', 'LUONG_NGAY_CONG', 'LUONG_CB', 'PHU_CAP_THANG',
  'DI_MUON_VE_SOM', 'DI_SOM_VE_MUON', 'TANG_CA_OFF', 'TANG_CA_LE',
  'NGHI_TRU_LUONG', 'NGHI_TRU_LUONG_NOT_PHEP', 'LUONG_TOUR',
  'THUONG_DOANH_SO', 'THUONG_KHAC', 'PHAT_KHAC', 'TONG_THU_NHAP',
  'LUONG_BHXH', 'TIEN_TRA_BHXH', 'THUC_NHAN', 'GIAM_TRU_GIA_CANH',
  'LUONG_CHIU_THUE_TNCN', 'THUE_TNCN', 'TONG_LUONG_THUC_NHAN',
  'TAM_UNG', 'CON_LAI'
]
const employee = {
  User: { ID: 99, YahooID: 'NV001', FullName: 'Nhân viên A', Address: 'Kỹ thuật viên' },
  BANGLUONGBC: { DiemQL: [{ StockTitle: 'Cơ sở A' }, { StockTitle: 'Cơ sở B' }] },
  LICH_NGHI_CO_DINH: 4,
  NGAY_NGHI_CO_DINH: 'Chủ nhật',
  ...Object.fromEntries(fields.map((field, i) => [field, i === 23 ? -500 : i + 10]))
}

for (const Data of [[employee, {}], []]) {
  let rows, filterRange, numberFormat, loadingFinished = false
  const range = new Proxy({ formatter(value) { numberFormat = value; return range } }, {
    get: (target, key) => target[key] || (() => range)
  })
  const sheet = new Proxy({
    setArray(row, column, values) {
      assert.equal(row, 2)
      assert.equal(column, 0)
      rows = values
    },
    getRange: () => range,
    getCell: () => range
  }, { get: (target, key) => target[key] || (() => {}) })
  vm.runInNewContext(code, {
    Url: '/nhan-vien/bang-luong-4', Data, filters: { StockID: 1 }, Title: 'Bảng lương',
    getStockName: () => 'Cơ sở A',
    safeGet: (obj, key, fallback) => key.split('.').reduce((value, part) => value?.[part], obj) ?? fallback,
    hideLoading: () => { loadingFinished = true },
    dataToExcel: (name, callback) => callback(sheet, {
      suspendPaint() {}, suspendEvent() {}, resumePaint() {}, resumeEvent() {},
      getActiveSheet: () => sheet
    }),
    GC: { Spread: { Sheets: {
      LineBorder: function () {}, LineStyle: { thin: 1 }, HorizontalAlign: { right: 1 },
      Range: function (...args) { filterRange = args },
      Filter: { HideRowFilter: function () {} }
    } } }
  })
  assert.equal(rows.length, Data.length + 1)
  assert.equal(rows[0].length, 30)
  assert.deepEqual(filterRange, [3, 0, Math.max(Data.length, 1), 30])
  assert.equal(numberFormat, '#,##0')
  assert(loadingFinished)
  if (Data.length) {
    assert.deepEqual(Array.from(rows[1]), [
      1, 'NV001', 'Nhân viên A', 'Kỹ thuật viên', 'Cơ sở A, Cơ sở B',
      '4 (Chủ nhật)', ...fields.map(field => employee[field])
    ])
    assert.deepEqual(Array.from(rows[2]), [2, '', '', '', 'Chưa xác định', '0', ...fields.map(() => 0)])
  }
}
console.log('PASS: payroll-4 exports 30 matching columns, numeric amounts, defaults, and all filter rows.')
