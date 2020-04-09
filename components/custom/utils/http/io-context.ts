// @ts-nocheck
import RequestContext from './request-context'
const rc = new RequestContext()

const context = rc.context({
  // 后期做一下相关配置，暂不支持 19.7.26
  // urlPrefix: '/api/',
  urlPrefix: '',
  // mockUrlPrefix: '/api/',
  // mockUrlPrefix: '',
  headers: {
    // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    // 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  // withCredentials: false,
})

export default context