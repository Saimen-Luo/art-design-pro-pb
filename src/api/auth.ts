// import request from '@/utils/http'
import { useUserStore } from '@/store/modules/user'
import pb from '@/utils/http/pocketbase'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  // return request.post<Api.Auth.LoginResponse>({
  //   url: '/api/auth/login',
  //   params
  //   // showSuccessMessage: true // 显示成功消息
  //   // showErrorMessage: false // 不显示错误消息
  // })
  const { userName, password } = params
  return pb
    .collection('users')
    .authWithPassword(userName, password)
    .then(() => ({
      token:
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU3VwZXIiLCJhZG1pbiI6dHJ1ZSwicm9sZSI6InN1cGVyIn0._8JyG7N-3P18p0e0__j-i_9p1G_6_3_s5KJ_8_L5__-9_-48I78_Q-6_i2_7_3HNn-J__S__-_KU_B_k_21bS2',
      refreshToken:
        'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiU3VwZXIiLCJhZG1pbiI6dHJ1ZSwicm9sZSI6InN1cGVyIn0.j3_-_-3y_-1XU7V5_OU__5hZ_V--63Um_3gB2k_-3vq83-_-N3_1_186_8_-___J_AE3-_6_-84D__8u__et5P'
    }))
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  // return request.get<Api.Auth.UserInfo>({
  //   url: '/api/user/info'
  //   // 自定义请求头
  //   // headers: {
  //   //   'X-Custom-Header': 'your-custom-value'
  //   // }
  // })
  return pb
    .collection('users')
    .authRefresh()
    .then(({ record: info }) => ({
      ...info,
      buttons: [],
      roles: [],
      userId: info.id,
      userName: info.name || info.email
    }))
    .catch((err) => {
      if (err.code >= 400) {
        useUserStore().logOut()
      }
    })
}
