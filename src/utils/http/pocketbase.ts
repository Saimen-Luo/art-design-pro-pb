import { HttpError, showError } from './error'
import { TypedPocketBase } from '@tigawanna/typed-pocketbase'
import { Schema } from '@/types/pb/pb-types'
import { ClientResponseError } from 'pocketbase'
import { $t } from '@/locales'

// Create typed client
const pb = new TypedPocketBase<Schema>('http://localhost:8090')

/** 统一创建HttpError */
interface BaseResponse {
  message: string
  code?: number
  status?: number
  cause?: BaseResponse
}

function createHttpError(
  { message, code, status, cause }: BaseResponse,
  res?: {
    data?: unknown
    url?: string
    method?: string
  }
) {
  const msg = cause?.message ?? message
  return new HttpError($t(msg) || msg, code ?? status ?? 0, res)
}

pb.beforeSend = function (url, options) {
  const { body } = options
  if (body) {
    // 统一删除无用字段
    delete body.created
    delete body.updated
    delete body.expand
    // 统一设置 userId
    const { userIdKey } = body
    if (userIdKey) {
      if (!body[userIdKey]) {
        body[userIdKey] = pb.authStore.record?.id
      }
      delete body.userIdKey
    }
  }
  return { url, options }
}

pb.afterSend = function (response, data) {
  // console.log("res", response);
  // console.log("data", data);
  // 发生错误时 data 包含 code 和 message, response.status 和 data.code 一致
  // 无错误时，data 为正常返回的数据
  if (!response.ok) {
    const bData = data.data
    if (bData) {
      // {
      //   "code": 400,
      //   "message": "Failed to create record.",
      //   "data": {
      //       "password": {
      //           "code": "validation_length_out_of_range",
      //           "message": "The length must be between 8 and 72."
      //       },
      //       "username": {
      //           "code": "validation_length_out_of_range",
      //           "message": "The length must be between 3 and 150."
      //       }
      //   }
      // }
      const errKeyArr = Object.keys(bData)
      if (errKeyArr.length) {
        errKeyArr.forEach((key) => showError(createHttpError(bData[key], response)))
      } else {
        showError(createHttpError(data, response))
      }
    } else {
      // 500
      showError(createHttpError(data, response))
    }
  }
  return data
}

const { send } = pb
pb.send = <T>(...args: Parameters<typeof send>) =>
  send.apply(pb, args).catch((err) => {
    /* 
    status 0 仅触发这里
    status >= 400 先触发 afterSend 再触发这里
    */
    if (err instanceof ClientResponseError && err.status === 0) {
      /* 
      这里处理无返回的异常，一般是:
      1 后端 api 服务无法访问 (未启动/防火墙未放行)
      2 客户端网络问题
      */
      console.error('[ClientResponseError]', err.toJSON())
      showError(createHttpError(err as BaseResponse, err))
    }
    throw createHttpError(err)
  }) as Promise<T>

// https://vueuse.org/core/useAsyncState/ // 结合使用
// const p = pb.from('users').getFullList() // 这里 p 是带类型的 Promise
// const { isLoading, state } = useAsyncState(p, initialState, options) // 这样 state 的类型也能正确推断出来
// 初始值 initialState 根据 p 的返回值而定
// options 可选

export default pb
