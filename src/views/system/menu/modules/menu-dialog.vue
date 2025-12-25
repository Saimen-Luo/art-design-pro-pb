<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    @update:model-value="handleCancel"
    width="860px"
    align-center
    class="menu-dialog"
    @closed="handleClosed"
  >
    <ArtForm
      ref="formRef"
      v-model="form"
      :items="formItems"
      :rules="rules"
      :span="width > 640 ? 12 : 24"
      :gutter="20"
      label-width="100px"
      :show-reset="false"
      :show-submit="false"
    >
      <template #type>
        <ElRadioGroup v-model="form.type" :disabled="disableMenuType">
          <ElRadioButton value="menu" label="menu">菜单</ElRadioButton>
          <ElRadioButton value="button" label="button">权限</ElRadioButton>
        </ElRadioGroup>
      </template>
      <template #meta_icon>
        <!-- element-plus 2.11.4 ElSelectV2 开启 filterable 会导致 options 重绘总是显示第一个，升级到 2.13.0 解决-->
        <ElSelectV2
          v-model="form.meta_icon"
          clearable
          filterable
          allow-create
          default-first-option
          placeholder="请选择图标如：ri:user-line"
          :options="iconOptions"
        >
          <template #default="{ item }">
            <span>
              <ArtSvgIcon :icon="item.value" class="text-2xl" />
              {{ item.label }}
            </span>
          </template>
        </ElSelectV2>
      </template>
    </ArtForm>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormRules } from 'element-plus'
  import { ElIcon, ElTooltip, ElSelectV2 } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { FormItemKey, type MenusResponseWithChildren } from '@/types/pb/my-pb-types'
  import type { MenusCreate } from '@/types/pb/pb-types'
  import ArtForm from '@/components/core/forms/art-form/index.vue'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'
  import { useWindowSize } from '@vueuse/core'
  import pb from '@/utils/http/pocketbase'
  import { $t } from '@/locales'
  import { useMenuStore } from '@/store/modules/menu'
  import riIcons from '@iconify-json/ri/icons.json'

  // https://iconify.design/docs/types/iconify-json.html#structure
  const iconOptions = Object.keys({ ...riIcons.icons, ...riIcons.aliases })
    .map((i) => `ri:${i}`)
    .map((i) => ({
      label: i,
      value: i
    }))

  const menuPb = pb.from('menus')
  const menuStore = useMenuStore()

  const permissions = ref<string[]>([])
  pb.send<string[]>('/api/custom/getPermissions', {}).then((list) => {
    permissions.value = list
  })

  const { width } = useWindowSize()

  /**
   * 创建带 tooltip 的表单标签
   * @param label 标签文本
   * @param tooltip 提示文本
   * @returns 渲染函数
   */
  const createLabelTooltip = (label: string, tooltip: string) => {
    return () =>
      h('span', { class: 'flex-c' }, [
        h('span', label),
        h(
          ElTooltip,
          {
            content: tooltip,
            placement: 'top'
          },
          () => h(ElIcon, { class: 'ml-0.5 cursor-help' }, () => h(QuestionFilled))
        )
      ])
  }

  interface Props {
    visible: boolean
    editData?: MenusResponseWithChildren | any
    type?: 'menu' | 'button'
    lockType?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'menu',
    lockType: false
  })

  const emit = defineEmits<Emits>()

  const formRef = ref()

  const form = reactive<MenusCreate>({
    id: undefined,
    pid: undefined,
    type: 'menu',
    name: '',
    path: '',
    component: '',
    meta_icon: '',
    meta_title: '',
    sort: 1,
    meta_keepAlive: false,
    meta_isHide: false,
    meta_isHideTab: false,
    meta_link: '',
    meta_isIframe: false,
    meta_showBadge: false,
    meta_showTextBadge: '',
    meta_fixedTab: false,
    meta_activePath: '',
    meta_isFullPage: false
  })

  const isEdit = computed(() => !!form.id)

  const rules = reactive<FormRules>({
    // 不写 trigger 都会触发
    meta_title: [{ required: true, message: '请输入菜单名称' }],
    path: [{ required: true, message: '请输入路由地址' }],
    sort: [{ required: true, message: '请输入序号' }],
    name: [{ required: true, message: '请选择或输入权限标识' }]
  })

  /**
   * 表单项配置
   */
  type FormItemMenu = FormItemKey<MenusCreate>
  const formItems = computed<FormItemMenu[]>(() => {
    const baseItems: FormItemMenu[] = [
      { label: '菜单类型', key: 'type', span: 24 }, // 见上面 #type
      { label: 'id', key: 'id', hidden: true }, // 不显示，只是为了 reset
      {
        label: '父级菜单',
        key: 'pid',
        type: 'select',
        props: {
          placeholder: '一级菜单留空',
          // disabled: !form.pid,
          clearable: true,
          filterable: true,
          options: menuStore.systemMenus
            .filter((i) => i.type === 'menu')
            .map((i) => ({ label: $t(i.meta_title), value: i.id }))
        }
      }
    ]

    // Switch 组件的 span：小屏幕 12，大屏幕 6
    const switchSpan = width.value < 640 ? 12 : 6

    if (form.type === 'menu') {
      return [
        ...baseItems,
        { label: '菜单名称', key: 'meta_title', type: 'input', props: { placeholder: '菜单名称' } },
        {
          label: '权限标识',
          key: 'name',
          type: 'select',
          props: {
            placeholder: '请选择或输入权限标识',
            filterable: true,
            allowCreate: true,
            defaultFirstOption: true,
            options: permissions.value.map((i) => ({ label: i, value: i }))
          }
        },
        {
          label: createLabelTooltip(
            '路由地址',
            '一级菜单：以 / 开头的绝对路径（如 /dashboard）\n二级及以下：相对路径（如 console、user）'
          ),
          key: 'path',
          type: 'input',
          props: { placeholder: '如：/dashboard 或 console' }
        },
        {
          label: () =>
            h('span', { class: 'flex-c' }, [
              h(ArtSvgIcon, {
                icon: form.meta_icon,
                class: 'text-2xl mr-1'
              }),
              h('span', '图标')
            ]),
          key: 'meta_icon' // 见上面 #meta_icon
        },
        {
          label: createLabelTooltip(
            '组件路径',
            '一级父级菜单：填写 /index/index\n具体页面：填写组件路径（如 /system/user）\n目录菜单：留空'
          ),
          key: 'component',
          type: 'input',
          props: { placeholder: '如：/system/user 或留空' }
        },
        // {
        //   label: createLabelTooltip(
        //     '角色权限',
        //     '仅用于前端权限模式：配置角色标识（如 R_SUPER、R_ADMIN）\n后端权限模式：无需配置'
        //   ),
        //   key: 'roles',
        //   type: 'inputtag',
        //   props: { placeholder: '输入角色标识后按回车，如：R_SUPER' }
        // },
        {
          label: '菜单排序',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        },
        {
          label: createLabelTooltip(
            '激活路径',
            '用于详情页等隐藏菜单，指定高亮显示的父级菜单路径\n例如：用户详情页高亮显示"用户管理"菜单'
          ),
          key: 'meta_activePath',
          type: 'input',
          props: { placeholder: '如：/system/user' }
        },
        {
          label: '外部链接',
          key: 'meta_link',
          type: 'input',
          props: { placeholder: '如：https://www.example.com' }
        },
        {
          label: '文本徽章',
          key: 'meta_showTextBadge',
          type: 'input',
          props: { placeholder: '如：New、Hot' }
        },
        // { label: '是否启用', key: 'meta_isEnable', type: 'switch', span: switchSpan },
        { label: '页面缓存', key: 'meta_keepAlive', type: 'switch', span: switchSpan },
        { label: '隐藏菜单', key: 'meta_isHide', type: 'switch', span: switchSpan },
        { label: '是否内嵌', key: 'meta_isIframe', type: 'switch', span: switchSpan },
        { label: '显示徽章', key: 'meta_showBadge', type: 'switch', span: switchSpan },
        { label: '固定标签', key: 'meta_fixedTab', type: 'switch', span: switchSpan },
        { label: '标签隐藏', key: 'meta_isHideTab', type: 'switch', span: switchSpan },
        { label: '全屏页面', key: 'meta_isFullPage', type: 'switch', span: switchSpan }
      ]
    } else {
      return [
        ...baseItems,
        {
          label: '权限名称',
          key: 'meta_title',
          type: 'input',
          props: { placeholder: '如：新增、编辑、删除' }
        },
        {
          label: '权限标识',
          key: 'name',
          type: 'select',
          props: {
            placeholder: '请选择或输入权限标识',
            filterable: true,
            allowCreate: true,
            defaultFirstOption: true,
            options: permissions.value.map((i) => ({ label: i, value: i }))
          }
        },
        {
          label: '权限排序',
          key: 'sort',
          type: 'number',
          props: { min: 1, controlsPosition: 'right', style: { width: '100%' } }
        }
      ]
    }
  })

  const dialogTitle = computed(() => {
    const type = form.type === 'menu' ? '菜单' : '权限'
    return isEdit.value ? `编辑${type}` : `新增${type}`
  })

  /**
   * 是否禁用菜单类型切换
   */
  const disableMenuType = computed(() => {
    if (isEdit.value) return true
    if (!isEdit.value && form.type === 'menu' && props.lockType) return true
    return false
  })

  /**
   * 重置表单数据
   */
  const resetForm = (): void => {
    formRef.value?.reset()
    form.type = 'menu'
  }

  /**
   * 加载表单数据（编辑模式）
   */
  const loadFormData = (): void => {
    if (!props.editData) return

    Object.assign(form, props.editData)
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      if (form.id) {
        await menuPb.update(form.id, form)
      } else {
        await menuPb.create(form)
      }
      ElMessage.success(`${isEdit.value ? '编辑' : '新增'}成功`)
      handleCancel()
      emit('submit')
    } catch {
      ElMessage.error('表单校验失败，请检查输入')
    }
  }

  /**
   * 取消操作
   */
  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  /**
   * 对话框关闭后的回调
   */
  const handleClosed = (): void => {
    resetForm()
    form.name ??= ''
  }

  /**
   * 监听对话框显示状态
   */
  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        form.type = props.type
        if (!form.sort) {
          form.sort = 1
        }
        nextTick(() => {
          if (props.editData) {
            loadFormData()
          }
        })
      }
    }
  )

  /**
   * 监听菜单类型变化
   */
  watch(
    () => props.type,
    (newType) => {
      if (props.visible) {
        form.type = newType
      }
    }
  )
</script>
