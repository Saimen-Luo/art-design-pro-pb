/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3107173924")

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "bool1083686392",
    "name": "meta_isFullPage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text672490340",
    "max": 0,
    "min": 0,
    "name": "meta_activePath",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3107173924")

  // remove field
  collection.fields.removeById("bool1083686392")

  // remove field
  collection.fields.removeById("text672490340")

  return app.save(collection)
})
