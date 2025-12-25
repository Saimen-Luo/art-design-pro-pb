<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
      @keyup.enter="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-if="hasAuth('menus_create')" @click="handleAddMenu" v-ripple>
            添加菜单
          </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
      />

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :editData="editData"
        :lockType="lockMenuType"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { ColumnsFactoryKeyProp, MenusResponseWithChildren } from '@/types/pb/my-pb-types'
  import MenuDialog from './modules/menu-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import pb from '@/utils/http/pocketbase'
  import { deepClone, arrayToTree } from '@/utils'
  import { useMenuStore } from '@/store/modules/menu'
  import { useAuth } from '@/hooks'

  defineOptions({ name: 'Menus' })

  const menuPb = pb.from('menus')
  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'button'>('menu')
  const editData = ref<MenusResponseWithChildren | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    name: '',
    route: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'name',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'route',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 获取菜单列表数据
   */
  const menuStore = useMenuStore()
  const getMenuList = async (): Promise<void> => {
    loading.value = true

    try {
      const list = await menuPb.getFullList()
      menuStore.systemMenus = list
      tableData.value = arrayToTree(list)
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取菜单类型标签颜色
   * @param row 菜单行数据
   * @returns 标签颜色类型
   */
  const getMenuTypeTag = (
    row: MenusResponseWithChildren
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (row.type === 'button') return 'success'
    if (row.children.length) return 'info'
    if (row.meta_link && row.meta_isIframe) return 'warning'
    if (row.meta_link) return 'warning'
    if (row.path) return 'primary'
    return 'info'
  }

  /**
   * 获取菜单类型文本
   * @param row 菜单行数据
   * @returns 菜单类型文本
   */
  const getMenuTypeText = (row: MenusResponseWithChildren): string => {
    if (row.type === 'button') return '权限'
    if (row.children.length) return '目录'
    if (row.meta_link && row.meta_isIframe) return '内嵌'
    if (row.meta_link) return '外链'
    if (row.path) return '菜单'
    return '未知'
  }

  const { hasAuth } = useAuth()
  // 表格列配置
  const { columnChecks, columns } = useTableColumns((() => [
    {
      prop: 'meta_title',
      label: '菜单名称',
      minWidth: 120,
      formatter: (row: MenusResponseWithChildren) => formatMenuTitle(row.meta_title)
    },
    {
      prop: 'type',
      label: '菜单类型',
      formatter: (row: MenusResponseWithChildren) => {
        return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
      }
    },
    {
      prop: 'name',
      label: '权限标识'
    },
    {
      prop: 'path',
      label: '路由',
      formatter: (row: MenusResponseWithChildren) => {
        if (row.type === 'button') return ''
        return row.meta_link || row.path || ''
      }
    },
    {
      prop: 'updated',
      label: '编辑时间'
    },
    // {
    //   prop: 'status',
    //   label: '状态',
    //   formatter: () => h(ElTag, { type: 'success' }, () => '启用')
    // },
    {
      prop: 'sort',
      label: '排序',
      align: 'center'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 230,
      align: 'center',
      formatter: (row: MenusResponseWithChildren) => {
        const buttonStyle = { style: 'text-align: right' }

        if (row.type === 'button') {
          return h('div', buttonStyle, [
            hasAuth('menus_create') &&
              h(ArtButtonTable, {
                type: 'add',
                icon: 'ri:file-copy-2-line',
                onClick: () => handleEditAuth(row, true),
                title: '复制权限'
              }),
            hasAuth('menus_update') &&
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => handleEditAuth(row)
              }),
            hasAuth('menus_delete') &&
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => handleDeleteAuth(row.id)
              })
          ])
        }

        return h('div', buttonStyle, [
          hasAuth('menus_create') &&
            h(ArtButtonTable, {
              type: 'add',
              onClick: () => handleAddAuth(row.id),
              title: '新增'
            }),
          h(ArtButtonTable, {
            type: 'add',
            icon: 'ri:file-copy-2-line',
            onClick: () => handleEditMenu(row, true),
            title: '复制'
          }),
          hasAuth('menus_update') &&
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEditMenu(row)
            }),
          hasAuth('menus_delete') &&
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDeleteMenu(row.id)
            })
        ])
      }
    }
  ]) satisfies ColumnsFactoryKeyProp<MenusResponseWithChildren>)

  // 数据相关
  const tableData = ref<MenusResponseWithChildren[]>([])

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    getMenuList()
  }

  /**
   * 刷新菜单列表
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * 搜索菜单
   * @param items 菜单项数组
   * @returns 搜索结果数组
   */
  const searchMenu = (items: MenusResponseWithChildren[]): MenusResponseWithChildren[] => {
    const results: MenusResponseWithChildren[] = []

    for (const item of items) {
      const searchName = appliedFilters.name?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.route?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta_title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchName || menuTitle.includes(searchName)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    return searchMenu(tableData.value)
  })

  /**
   * 添加菜单
   */
  const handleAddMenu = (): void => {
    dialogType.value = 'menu'
    editData.value = null
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * 添加权限
   */
  const handleAddAuth = (pid: string): void => {
    dialogType.value = 'menu'
    editData.value = { pid }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * 编辑/复制菜单
   * @param row 菜单行数据
   */
  const handleEditMenu = (row: MenusResponseWithChildren, isCopy = false): void => {
    dialogType.value = 'menu'
    if (isCopy) {
      editData.value = {
        ...row,
        id: undefined
      }
    } else {
      editData.value = row
    }
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * 编辑/复制权限
   * @param row 权限行数据
   */
  const handleEditAuth = (row: MenusResponseWithChildren, isCopy = false): void => {
    dialogType.value = 'button'
    if (isCopy) {
      editData.value = {
        ...row,
        id: undefined
      }
    } else {
      editData.value = row
    }
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * 提交表单数据
   * @param formData 表单数据
   */
  const handleSubmit = (): void => {
    getMenuList()
  }

  /**
   * 删除菜单
   */
  const handleDeleteMenu = async (id: string): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => menuPb.delete(id))
      ElMessage.success('删除成功')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 删除权限
   */
  const handleDeleteAuth = async (id: string): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => menuPb.delete(id))
      ElMessage.success('删除成功')
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
      }
    }
  }

  /**
   * 切换展开/收起所有菜单
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: MenusResponseWithChildren[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }
</script>
