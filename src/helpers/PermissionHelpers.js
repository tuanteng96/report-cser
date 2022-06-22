import Swal from 'sweetalert2'
export const PermissionHelpers = {
  ErrorAccess: error => {
    Swal.fire({
      icon: 'error',
      title: 'Yêu cầu quyền truy cập.',
      text: 'Để xem được báo cáo này bạn cần có quyền truy cập từ người quản trị.',
      footer: `<span class="text-danger">${error}</span>`,
      showCancelButton: false,
      showConfirmButton: false,
      allowOutsideClick: false
    })
  }
}
