// @ts-nocheck
// 处理错误信息
export async function responseFilter(res) {
  return true
}

// 适配新接口规范的响应拦截
export async function responseInterceptor(res) {
  return res
}