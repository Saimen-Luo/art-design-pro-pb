<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <!-- <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch> -->

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple v-if="hasAuth('users_create')">
              新增用户
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  // import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'
  import pb from '@/utils/http/pocketbase'
  import { UsersResponse } from '@/types/pb/pb-types'
  import { useAuth } from '@/hooks'
  import { ColumnsFactoryKeyProp } from '@/types/pb/my-pb-types'

  defineOptions({ name: 'User' })

  const usersPb = pb.from('users')
  const { hasAuth } = useAuth()

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UsersResponse>>({})

  // 选中行
  const selectedRows = ref<UsersResponse[]>([])

  // 搜索表单
  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  // 用户状态配置
  // const USER_STATUS_CONFIG = {
  //   '1': { type: 'success' as const, text: '在线' },
  //   '2': { type: 'info' as const, text: '离线' },
  //   '3': { type: 'warning' as const, text: '异常' },
  //   '4': { type: 'danger' as const, text: '删除' }
  // } as const

  /**
   * 获取用户状态配置
   */
  // const getUserStatusConfig = (status: string) => {
  //   return (
  //     USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
  //       type: 'info' as const,
  //       text: '未知'
  //     }
  //   )
  // }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    // getData,
    // searchParams,
    // resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: () =>
        usersPb.getFullList({
          select: {
            expand: {
              roles: {
                name: true
              }
            }
          }
        }),
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: (() => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'name',
          label: '用户名',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            const url = row.avatar ? pb.files.getURL(row, row.avatar) : ''
            return h('div', { class: 'user flex-c' }, [
              url
                ? h(ElImage, {
                    class: 'size-9.5 rounded-md',
                    src: url,
                    previewSrcList: [url],
                    // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                    previewTeleported: true
                  })
                : h('div', {
                    class: 'size-9.5 rounded-md bg-gray-500'
                  }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.name),
                h('p', { class: 'email' }, row.email)
              ])
            ])
          }
        },
        {
          prop: 'gender',
          label: '性别',
          sortable: true,
          formatter: (row) => {
            let str = ''
            switch (row.gender) {
              case 'male':
                str = '男'
                break
              case 'female':
                str = '女'
                break
            }
            return str
          }
        },
        { prop: 'phone', label: '手机号' },
        // {
        //   prop: 'status',
        //   label: '状态',
        //   formatter: (row) => {
        //     const statusConfig = getUserStatusConfig(row.status)
        //     return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
        //   }
        // },
        {
          prop: 'roles',
          label: '角色',
          // sortable: true,
          formatter: (row) => row.expand.roles.map((i: any) => h(ElTag, () => i.name))
        },
        {
          prop: 'created',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              hasAuth('users_update') &&
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row)
                }),
              hasAuth('users_delete') &&
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => deleteUser(row)
                })
            ])
        }
      ]) satisfies ColumnsFactoryKeyProp<UsersResponse>
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  // const handleSearch = (params: Record<string, any>) => {
  //   console.log(params)
  //   // 搜索参数赋值
  //   Object.assign(searchParams, params)
  //   getData()
  // }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UsersResponse): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UsersResponse): void => {
    ElMessageBox.confirm(`确定要删除该用户吗？`, '删除用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
      .then(async () => {
        await usersPb.delete(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {})
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UsersResponse[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
