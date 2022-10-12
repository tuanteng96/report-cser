import Swal from 'sweetalert2'
export const PermissionHelpers = {
  ErrorAccess: error => {
    Swal.fire({
      icon: 'error',
      title: 'Yêu cầu quyền truy cập',
      text: 'Để xem được báo cáo này bạn cần có quyền truy cập từ người quản trị.',
      footer: `<span class="text-danger">${error}</span>`,
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false
    })
  },
  HideErrorAccess: () => {
    if (Swal.isVisible()) {
      Swal.close()
    }
  },
  ExportExcel: async ({ FuncStart, FuncEnd, FuncApi, UrlName }) => {
    FuncStart()
    FuncApi().then(({ data }) => {
      if (data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Xảy ra lỗi.',
          text: 'Bạn không thể xuất Excel báo cáo này.',
          footer: `<span class="text-danger">${data.error}</span>`,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: false
        })
      } else {
        window?.EzsExportExcel &&
          window?.EzsExportExcel({
            Url: UrlName,
            Data: data,
            hideLoading: () => FuncEnd()
          })
      }
    })
  }
}
