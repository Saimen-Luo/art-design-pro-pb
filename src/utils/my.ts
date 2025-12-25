// import * as dayjs from 'dayjs'
import dayjs, { type ConfigType } from 'dayjs'

/**
 * https://element-plus.org/zh-CN/component/date-picker-panel
 * https://day.js.org/docs/en/display/format
 * https://day.js.org/docs/en/installation/typescript
 * @param timeStr 时间
 * @param formatStr 格式
 * @returns 格式化后的时间
 */
export function utcTimeFormat(time: ConfigType, formatStr = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(time).format(formatStr)
}

/**
 * 深度克隆对象
 * @param obj 要克隆的对象
 * @returns 克隆后的对象
 */
export const deepClone = <T>(obj: T): T => {
  // vue 中 structuredClone 遇到 proxy 会报错，需要 unref / toRaw
  // if (structuredClone) {
  //   return structuredClone(obj)
  // }
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj) as T
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 数组根据 id pid 转成带 children 的树状结构
 * @param arr
 */
export function arrayToTree<T extends { id: string; pid: string }>(arr: T[]) {
  type TWithChildren = T & { children: TWithChildren[] }
  const map: { [key: string]: TWithChildren } = {}
  const tree: TWithChildren[] = []

  arr.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })

  arr.forEach((item) => {
    if (!item.pid) {
      tree.push(map[item.id])
    } else if (map[item.pid]) {
      map[item.pid].children.push(map[item.id])
    }
  })

  return tree
}
