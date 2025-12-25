// import request from '@/utils/http'
import { useMenuStore } from '@/store/modules/menu'
import { useUserStore } from '@/store/modules/user'
import { MenusResponse, UsersResponse } from '@/types/pb/pb-types'
import pb from '@/utils/http/pocketbase'
import { RecordModel } from 'pocketbase'

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
    .then(({ token }) => ({
      token,
      refreshToken: token
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

  /* 
  pb
    .from('users')
    .authRefresh({
      select: {
        expand: {
          roles: {
            expand: {
              menus: true
            }
          }
        }
      }
    })
  */
  return pb
    .collection('users')
    .authRefresh({
      expand: 'roles.menus',
      fields: '*,record.expand.roles.expand.menus'
    })
    .then(({ record }) => {
      const info = record as UsersResponse & RecordModel
      useMenuStore().rolesMenus =
        info.expand?.roles?.reduce((menus: MenusResponse[], role: any) => {
          return menus.concat(role.expand.menus)
        }, []) || []
      return {
        ...info,
        buttons: [],
        userId: info.id,
        userName: info.nickname || info.name || info.email
      }
    })
    .catch((err) => {
      if (err.code >= 400) {
        useUserStore().logOut()
      }
      return Promise.reject(err)
    })
}
