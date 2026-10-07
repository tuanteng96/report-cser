const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8')
const source = read('excel/index.js')
const ui = read('src/features/Reports/pages/RP-Staff/pages/SalaryServices/index.js')
const helperStart = source.indexOf('function exportServiceSalaryList(')
const helper = source.slice(helperStart, source.indexOf('function exportServiceSalaryTIP', helperStart))
const caseStart = source.indexOf("    case '/nhan-vien/luong-ca-dich-vu':")
const exportCase = source.slice(caseStart, source.indexOf("    case '/nhan-vien/luong-ca-dich-vu-tip':", caseStart))
const row = {
  ID: 1, OrderServiceID: 21, ID_Buoi_Dv: 22, ClassID: 31,
  Staffs: [{ FullName: 'A' }, { FullName: 'B' }], UserFullName: 'A',
  LuongCa_PPhi: { Tong_Luong: 1200, Tong_PP: 200, DS_PP: [{ Title: 'X' }, { Title: 'Y' }] },
  Ngay_Lam: 'date', CreateDate: 'date', Member: { FullName: 'C', Phone: '0123', MobilePhone: '0456' },
  DV_Goc: { ProdTitle: 'Gốc' }, The_DV: { CardTitle: 'Thẻ' }, MethodTitle: 'Lớp Yoga',
  Salary: { salaryList: [{ OrderID: 11 }] }, giabuoi: 300, StockName: 'S', Stock: { Title: 'S' },
  Value: 1200, ValueSetup: 1000, ValueExtra: 200, Root: { Title: 'Gốc' }, Prod: { Title: 'Thẻ' },
  Desc: 'Mô tả', TourSalaryRatio: 1.5
}
for (const ShowsX of ['1', '3']) {
  for (const empty of [false, true]) {
    const tables = [], formats = []
    let filterRange, finished = false
    const range = new Proxy({}, { get: () => () => range })
    const sheet = new Proxy({
      setArray: (r, c, values) => tables.push(values),
      setFormatter: (r, c, format) => formats.push([r, c, format]),
      getCell: () => range, getRange: () => range
    }, { get: (target, key) => target[key] || (() => {}) })
    const context = {
      Data: { param: { Body: { ShowsX } }, result: {
        Items: empty ? [] : [row, { ...row, ID: 0 }],
        List: empty ? [] : [row, { ...row, OrderServiceID: 0 }],
        sum: empty ? [] : [{ UserID: 1, UserFullName: 'A', TourSalaryRatio: 1.5, Value: 1200 }]
      } },
      Url: '/nhan-vien/luong-ca-dich-vu', getStockName: () => 'S',
      window: { top: { moment: () => ({ format: format => format }) } },
      hideLoading: () => { finished = true },
      dataToExcel: (name, callback) => callback(sheet, {
        getActiveSheet: () => sheet, suspendPaint() {}, suspendEvent() {}, resumePaint() {}, resumeEvent() {}
      }),
      GC: { Spread: { Sheets: {
        LineBorder: function () {}, LineStyle: { thin: 1 }, SheetArea: { viewport: 1 },
        HorizontalAlign: { left: 0, center: 1 }, Range: function (...args) { filterRange = args },
        Filter: { HideRowFilter: function () {} }
      } } }
    }
    vm.runInNewContext(`${helper}\nswitch (Url) { ${exportCase} }`, context)
    const columnsStart = ui.indexOf("if (filters.ShowsX === '1')", ui.indexOf('  const columns = useMemo', ui.indexOf('const RenderSum') + 1000))
    const split = ui.indexOf("} else if (filters.ShowsX === '3')", columnsStart)
    const end = ui.indexOf('} else {', split)
    const columns = ShowsX === '1' ? ui.slice(columnsStart, split) : ui.slice(split, end)
    const titles = [...columns.matchAll(/title: '([^']+)'/g)].map(match => match[1].toUpperCase())
    assert.deepEqual(Array.from(tables[0][0]), titles)
    assert.deepEqual(filterRange, [3, 0, empty ? 1 : 2, titles.length])
    assert(finished)
    if (!empty) {
      if (ShowsX === '1') {
        assert.deepEqual(Array.from(tables[0][1]), [1, 'A, B', 1200, 'HH:mm DD-MM-YYYY', 'C', '0123', 'Gốc', 'Thẻ', 11, 22, 300, 'X, Y', 'S'])
        assert.equal(tables[0][2][7], 'Lớp Yoga')
        assert.equal(tables[0][2][9], 'Lớp (31)')
        assert.equal(tables[0][2][10], '')
      } else {
        assert.equal(tables[0][2][1], 'Lớp (31)')
        assert.equal(tables[0][2][6], '')
        assert.equal(tables[0][2][7], '')
        assert.equal(tables[0][2][9], 'Lớp Yoga')
        assert.deepEqual(Array.from(tables[1][1]), [1, 1, 'A', 1.5, 1200])
        assert.equal(tables[1][0][3], 'HỆ SỐ DỊCH VỤ')
      }
      assert(formats.every(([, , format]) => format === '#,##0'))
      assert.deepEqual(formats.filter(([r]) => r === 3).map(([, c]) => c), ShowsX === '1' ? [2, 10] : [5, 6, 7])
    }
  }
}
console.log('PASS: service salary headers match UI; service/class rows, totals, formats, and filters work.')
