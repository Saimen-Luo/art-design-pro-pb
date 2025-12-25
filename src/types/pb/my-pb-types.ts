import { ColumnOption } from '@/types'
import { FormItem } from '@/components/core/forms/art-form/index.vue'
import type { MenusResponse, BaseCollectionResponse } from './pb-types'

export type MenusResponseWithChildren = MenusResponse & { children: MenusResponseWithChildren[] }

export const baseCollectionResponseKeys: Array<keyof BaseCollectionResponse> = [
  'created',
  'updated',
  'collectionId',
  'collectionName'
]

export function delBaseCollectionResponseKeys(obj: Partial<BaseCollectionResponse>) {
  baseCollectionResponseKeys.forEach((key) => {
    delete obj[key]
  })
}

/*
按钮权限类型提示，根据 getPermissions 生成，需及时同步
;['users_read']
  .filter((i) => i.includes('_'))
  .map((i) => `'${i}'`)
  .join(' | ')
 */
export type ButtonPermissions =
  | 'users_read'
  | 'users_create'
  | 'users_update'
  | 'users_delete'
  | 'menus_read'
  | 'menus_create'
  | 'menus_update'
  | 'menus_delete'
  | 'roles_read'
  | 'roles_create'
  | 'roles_update'
  | 'roles_delete'

/**
 * 约束 FormItem 的 key 以获得类型提示
 * [] satisfies FormItemKey<Type>)[]
 */
export type FormItemKey<T, moreKeys = 'otherKey'> = FormItem & {
  key: keyof T | moreKeys
}

/**
 * 约束 ColumnOption 的 prop 以获得类型提示
 * [] satisfies ColumnOptionKeyProp<Type>)[]
 */
export type ColumnOptionKeyProp<T, moreKeys = 'operation'> = ColumnOption & {
  prop?: keyof T | moreKeys
}

/**
 * 约束 useTableColumns(columnsFactory) ColumnOption 的 prop 以获得类型提示
 * 约束整个函数可保持缩进格式不变
 * useTableColumns((() => []) satisfies ColumnsFactoryKeyProp<Type>)
 */
export type ColumnsFactoryKeyProp<T, moreKeys = 'operation'> = () => Array<
  ColumnOption & { prop?: keyof T | moreKeys }
>
