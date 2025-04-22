import { createVNode, render } from 'vue'
import Toast from '../components/ui/Toast.vue'

let toastContainer = null

// 创建挂载容器
const createContainer = () => {
  const container = document.createElement('div')
  container.className = 'global-toast-container'
  document.body.appendChild(container)
  return container
}

// 获取挂载容器
const getContainer = () => {
  if (!toastContainer) {
    toastContainer = createContainer()
  }
  return toastContainer
}

// 显示Toast
const showToast = (options) => {
  const container = getContainer()
  
  // 支持直接传入字符串
  if (typeof options === 'string') {
    options = { message: options }
  }
  
  // 创建Toast组件实例
  const toastVNode = createVNode(Toast, {
    ...options,
    onClose: () => {
      // 移除组件
      render(null, container)
    }
  })
  
  // 渲染至容器
  render(toastVNode, container)
  
  // 返回关闭方法
  return {
    close: () => {
      if (toastVNode.component) {
        toastVNode.component.exposed?.close()
      }
    }
  }
}

// 快捷方法
const toast = {
  info(message, options = {}) {
    return showToast({ type: 'info', message, ...options })
  },
  
  success(message, options = {}) {
    return showToast({ type: 'success', message, ...options })
  },
  
  error(message, options = {}) {
    return showToast({ type: 'error', message, ...options })
  },
  
  warning(message, options = {}) {
    return showToast({ type: 'warning', message, ...options })
  }
}

export default toast 