<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入用户名" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" placeholder="请输入手机号" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender">
          <ElOption label="男" value="male" />
          <ElOption label="女" value="female" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="角色" prop="roles">
        <ElSelect v-model="formData.roles" multiple>
          <ElOption v-for="role in roleList" :key="role.id" :value="role.id" :label="role.name" />
        </ElSelect>
      </ElFormItem>
      <template v-if="!formData.id">
        <ElFormItem label="密码" prop="password">
          <ElInput
            v-model="formData.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </ElFormItem>
        <ElFormItem label="确认密码" prop="passwordConfirm">
          <ElInput
            v-model="formData.passwordConfirm"
            type="password"
            show-password
            placeholder="请二次确认密码"
          />
        </ElFormItem>
      </template>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { RolesResponse, UsersCreate, UsersResponse, UsersUpdate } from '@/types/pb/pb-types'
  import pb from '@/utils/http/pocketbase'
  import type { FormInstance, FormRules } from 'element-plus'

  const usersPb = pb.from('users')

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<UsersResponse>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 角色列表数据
  const roleList = ref<RolesResponse[]>([])
  pb.from('roles')
    .getFullList()
    .then((list) => (roleList.value = list))

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const emptyData: UsersUpdate = {
    id: undefined,
    password: undefined,
    passwordConfirm: undefined,
    name: '',
    phone: '',
    gender: '',
    roles: [] as string[]
  }
  const formData = reactive<UsersUpdate>({ ...emptyData })

  // 表单验证规则
  const rules: FormRules = {
    name: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      // { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '手机号格式：1开头，第二位为3-9的11位数字',
        trigger: 'blur'
      }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    roles: [{ required: true, message: '请选择角色', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, message: '密码至少8位', trigger: 'blur' }
    ],
    passwordConfirm: [
      { required: true, message: '请二次确认密码', trigger: 'blur' },
      {
        validator: (rule: any, value: any, callback: any) => {
          if (value !== formData.password) {
            callback(new Error('密码不匹配'))
          } else {
            callback()
          }
        }
      }
    ]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  const initFormData = () => {
    Object.assign(formData, emptyData)
    Object.assign(formData, props.userData)
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (formData.id) {
          await usersPb.update(formData.id, formData)
        } else {
          await usersPb.create(formData as UsersCreate)
        }
        ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
        dialogVisible.value = false
        emit('submit')
      }
    })
  }
</script>
