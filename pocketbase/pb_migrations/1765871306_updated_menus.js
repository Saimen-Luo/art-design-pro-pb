/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3107173924")

  // remove field
  collection.fields.removeById("relation1431356653")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3107173924")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": true,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1431356653",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "pid",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
