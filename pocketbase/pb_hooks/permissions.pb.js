/// <reference path="../pb_data/types.d.ts" />

routerAdd(
  'GET',
  '/api/custom/getPermissions',
  (e) => {
    const allCollections = $app.findAllCollections()

    const normalCollectionNames = allCollections
      .map((i) => i.name)
      .filter((name) => !name.startsWith('_'))

    // 'list', 'view'
    const ruleTypes = ['read', 'create', 'update', 'delete']

    const customRoutes = [
      // 'getPermissions',
    ]

    const allPermissions = normalCollectionNames.reduce((arr, name) => {
      arr.push(name, ...ruleTypes.map((type) => `${name}_${type}`))
      return arr
    }, customRoutes)

    return e.json(200, allPermissions)
  },
  $apis.requireAuth()
)
