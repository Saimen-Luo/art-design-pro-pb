<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <!-- <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch> -->

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple v-if="hasAuth('roles_create')">
              新增角色
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
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <!-- 菜单权限弹窗 -->
    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  // import { ButtonMoreItem } from '@/components/core/forms/art-button-more/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  // import ArtButtonMore from '@/components/core/forms/art-button-more/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  // import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import { ElMessageBox } from 'element-plus'
  import type { RolesResponse } from '@/types/pb/pb-types'
  import pb from '@/utils/http/pocketbase'
  import { useAuth } from '@/hooks'
  import { ColumnsFactoryKeyProp } from '@/types/pb/my-pb-types'

  defineOptions({ name: 'Role' })

  const rolesPb = pb.from('roles')

  // // 搜索表单
  // const searchForm = ref({
  //   roleName: undefined,
  //   roleCode: undefined,
  //   description: undefined,
  //   enabled: undefined,
  //   daterange: undefined
  // })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const currentRoleData = ref<RolesResponse | undefined>(undefined)

  const { hasAuth } = useAuth()
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
      apiFn: () => rolesPb.getFullList(),
      apiParams: {
        current: 1,
        size: 20
      },
      // 排除 apiParams 中的属性
      excludeParams: ['daterange'],
      columnsFactory: (() => [
        {
          prop: 'name',
          label: '角色名称'
          // minWidth: 120
        },
        // {
        //   prop: 'roleCode',
        //   label: '角色编码',
        //   minWidth: 120
        // },
        {
          prop: 'desc',
          label: '角色描述',
          // minWidth: 150,
          showOverflowTooltip: true
        },
        // {
        //   prop: 'enabled',
        //   label: '角色状态',
        //   width: 100,
        //   formatter: (row) => {
        //     const statusConfig = row.enabled
        //       ? { type: 'success', text: '启用' }
        //       : { type: 'warning', text: '禁用' }
        //     return h(
        //       ElTag,
        //       { type: statusConfig.type as 'success' | 'warning' },
        //       () => statusConfig.text
        //     )
        //   }
        // },
        {
          prop: 'updated',
          label: '编辑时间',
          // width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          // width: 80,
          align: 'center',
          fixed: 'right',
          // formatter: (row) =>
          //   h('div', [
          //     h(ArtButtonMore, {
          //       list: [
          //         {
          //           key: 'permission',
          //           label: '菜单权限',
          //           icon: 'ri:user-3-line'
          //         },
          //         {
          //           key: 'edit',
          //           label: '编辑角色',
          //           icon: 'ri:edit-2-line'
          //         },
          //         {
          //           key: 'delete',
          //           label: '删除角色',
          //           icon: 'ri:delete-bin-4-line',
          //           color: '#f56c6c'
          //         }
          //       ],
          //       onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row)
          //     })
          //   ]),
          formatter: (row) => {
            return h('div', [
              hasAuth('roles_update') &&
                h(ArtButtonTable, {
                  type: 'add',
                  icon: 'ri:menu-line',
                  onClick: () => showPermissionDialog(row),
                  title: '菜单权限'
                }),
              hasAuth('roles_update') &&
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row),
                  title: '编辑角色'
                }),
              hasAuth('roles_delete') &&
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => deleteRole(row),
                  title: '删除角色'
                })
            ])
          }
        }
      ]) satisfies ColumnsFactoryKeyProp<RolesResponse>
    }
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: RolesResponse) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  // const handleSearch = (params: Record<string, any>) => {
  //   // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
  //   const { daterange, ...filtersParams } = params
  //   const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

  //   // 搜索参数赋值
  //   Object.assign(searchParams, { ...filtersParams, startTime, endTime })
  //   getData()
  // }

  // const buttonMoreClick = (item: ButtonMoreItem, row: RolesResponse) => {
  //   switch (item.key) {
  //     case 'permission':
  //       showPermissionDialog(row)
  //       break
  //     case 'edit':
  //       showDialog('edit', row)
  //       break
  //     case 'delete':
  //       deleteRole(row)
  //       break
  //   }
  // }

  const showPermissionDialog = (row?: RolesResponse) => {
    permissionDialog.value = true
    currentRoleData.value = row
  }

  const deleteRole = (row: RolesResponse) => {
    ElMessageBox.confirm(`确定删除角色"${row.name}"吗？此操作不可恢复！`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await rolesPb.delete(row.id)
        ElMessage.success('删除成功')
        refreshData()
      })
      .catch(() => {
        ElMessage.info('已取消删除')
      })
  }
</script>
