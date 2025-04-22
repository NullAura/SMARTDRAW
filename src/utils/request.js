import axios from 'axios'
import toast from './toast'
import router from '../router'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://121.41.225.168:5173',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从本地存储获取token
    const token = localStorage.getItem('token')
    
    // 如果存在token则添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 如果返回的状态码不是200，说明接口有问题，需要处理
    if (response.status !== 200) {
      toast.error('请求失败，请稍后重试')
      return Promise.reject(new Error('请求失败'))
    }
    
    // 自定义状态码处理（通常后端会返回一个code字段表示业务状态码）
    if (res.code && res.code !== 0) {
      // 401: 未登录或token过期
      if (res.code === 401) {
        toast.error('登录已过期，请重新登录')
        
        // 清除本地存储中的登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
        
        // 跳转到登录页
        router.push('/login')
        
        return Promise.reject(new Error('登录已过期'))
      }
      
      // 其他业务错误
      toast.error(res.message || '操作失败')
      return Promise.reject(new Error(res.message || '操作失败'))
    }
    
    return res
  },
  error => {
    console.error('响应错误:', error)
    
    // 请求超时
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      toast.error('请求超时，请检查网络连接')
      return Promise.reject(error)
    }
    
    // 网络错误
    if (!window.navigator.onLine) {
      toast.error('网络连接已断开，请检查网络')
      return Promise.reject(error)
    }
    
    // 服务器返回错误
    if (error.response) {
      const status = error.response.status
      
      // 401: 未登录或token过期
      if (status === 401) {
        toast.error('登录已过期，请重新登录')
        
        // 清除本地存储中的登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
        
        // 跳转到登录页
        router.push('/login')
        
        return Promise.reject(error)
      }
      
      // 403: 没有权限
      if (status === 403) {
        toast.error('您没有权限进行此操作')
        return Promise.reject(error)
      }
      
      // 404: 请求的资源不存在
      if (status === 404) {
        toast.error('请求的资源不存在')
        return Promise.reject(error)
      }
      
      // 500: 服务器错误
      if (status === 500) {
        toast.error('服务器错误，请稍后重试')
        return Promise.reject(error)
      }
      
      // 其他错误
      toast.error(error.response.data?.message || '请求失败，请稍后重试')
      return Promise.reject(error)
    }
    
    // 其他错误
    toast.error('请求失败，请稍后重试')
    return Promise.reject(error)
  }
)

// 封装GET请求
export function get(url, params) {
  return request({
    method: 'GET',
    url,
    params
  })
}

// 封装POST请求
export function post(url, data) {
  return request({
    method: 'POST',
    url,
    data
  })
}

// 封装PUT请求
export function put(url, data) {
  return request({
    method: 'PUT',
    url,
    data
  })
}

// 封装DELETE请求
export function del(url, params) {
  return request({
    method: 'DELETE',
    url,
    params
  })
}

export default request 