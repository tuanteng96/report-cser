const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const scriptsRequire = createRequire(require.resolve('react-scripts/package.json'))
const source = fs.readFileSync(path.join(__dirname, '../src/features/Reports/pages/RP-Staff/pages/SalaryServices/ModalViewMobile.js'), 'utf8')
const code = scriptsRequire('@babel/core').transformSync(
  source.replace(/^import .*\n/gm, '').replace('export default ModalViewMobile', 'module.exports = ModalViewMobile'),
  { babelrc: false, configFile: false, presets: [scriptsRequire.resolve('@babel/preset-react')] }
).code
const React = require('react')
const context = {
  React, Fragment: React.Fragment, PropTypes: { bool: 'bool' },
  Modal: 'Modal', PerfectScrollbar: 'Scrollbar', OverlayTrigger: 'OverlayTrigger',
  Popover: Object.assign(function Popover() {}, { Header: 'Header', Body: 'Body' }),
  PriceHelper: { formatVND: value => `money:${value ?? 0}` },
  moment: require('moment'), module: { exports: {} }
}
vm.runInNewContext(code, context)
const render = (ShowsX, data) => context.module.exports({ ShowsX, data, show: true, onHide() {} })
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...nodes(tree.props?.children)]
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('')
  if (tree === null || tree === undefined || typeof tree === 'boolean') return ''
  return typeof tree === 'object' ? text(tree.props?.children) : String(tree)
}
function rows(tree) {
  return Object.fromEntries(nodes(tree).filter(node => node.props?.className?.startsWith('px-15px d-flex')).map(node => {
    const children = node.props.children
    return [text(children[0]).trim(), text(children[1]).trim()]
  }))
}
const data = {
  ID: 1, OrderServiceID: 2, ClassID: 3, ID_Buoi_Dv: 4, giabuoi: 500,
  UserFullName: 'NV chi tiết', ReceiverName: 'NV TIP', Staffs: [{ FullName: 'NV ca' }],
  The_DV: { CardTitle: 'Thẻ ca' }, Prod: { Title: 'Thẻ chi tiết' }, MethodTitle: 'Yoga',
  LuongCa_PPhi: { Tong_Luong: 1000, Tong_DV: 800, DS_DV: [{ Title: 'DV' }], DS_PP: [{ Title: 'X', ToPay: 100 }, { Title: 'Y', ToPay: 100 }] },
  Salary: { salaryList: [{ OrderID: 99, StaffID: 1, StaffName: 'A', Value: 200 }, { StaffID: 1, StaffName: 'A', Value: 300 }, { StaffID: 2, StaffName: 'B', Value: 500 }] },
  Value: 1000, ValueSetup: 800, ValueExtra: 200, TourSalaryRatio: 1.5,
  StockTitle: 'Cơ sở TIP', StockName: 'Cơ sở ca', Stock: { Title: 'Cơ sở chi tiết' }, Desc: 'Tip khách hàng'
}
const ca = rows(render('1', data))
assert.equal(ca['ID Đơn hàng'], '99')
assert.equal(ca['ID Buổi dịch vụ / Lớp'], '4')
assert.equal(ca['Giá buổi'], 'money:500')
assert.equal(ca['Phụ phí'], 'X, Y')
assert.equal(ca['Cơ sở'], 'Cơ sở ca')
assert.equal(nodes(render('1', data)).filter(node => text(node.props?.children?.[0]) === 'Cơ sở').length, 1)
const overlay = nodes(render('1', data)).find(node => node.type === 'OverlayTrigger').props.overlay
assert(text(overlay).includes('Amoney:500'))
assert(text(overlay).includes('Bmoney:500'))
const classCaTree = render('1', { ...data, ID: 0 })
const classCa = rows(classCaTree)
assert.equal(classCa['ID Buổi dịch vụ / Lớp'], 'Lớp (3)')
assert.equal(classCa['Thẻ dịch vụ'], 'Yoga')
assert.equal(classCa['Giá buổi'], '')
assert(!nodes(classCaTree).some(node => node.type === 'OverlayTrigger'))
const detail = rows(render('3', data))
assert.equal(detail['ID Dịch vụ / Lớp'], '2')
assert.equal(detail['Theo Setup'], 'money:800')
assert.equal(detail.Extra, 'money:200')
const classDetail = rows(render('3', { ...data, OrderServiceID: 0 }))
assert.equal(classDetail['ID Dịch vụ / Lớp'], 'Lớp (3)')
assert.equal(classDetail['Theo Setup'], '')
assert.equal(classDetail.Extra, '')
assert.equal(classDetail['Thẻ dịch vụ'], 'Yoga')
assert.deepEqual(Object.keys(rows(render('2', data))), ['Tên nhân viên', 'Thời gian', 'Cơ sở', 'Tiền TIP', 'Nội dung'])
assert.equal(rows(render('2', data))['Tên nhân viên'], 'NV TIP')
assert.equal(rows(render('2', data))['Tiền TIP'], 'money:1000')
for (const type of ['1', '2', '3']) {
  assert.doesNotThrow(() => render(type, null))
  assert.doesNotThrow(() => render(type, { ID: 1, LuongCa_PPhi: { DS_PP: [{ Title: 'X' }] } }))
}
console.log('PASS: mobile salary types 1/2/3, service/class rows, salary details, TIP, and missing data.')
