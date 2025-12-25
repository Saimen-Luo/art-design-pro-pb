/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.id != \"\"",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_NPxorLNim7` ON `users` (`name`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''"
    ],
    "listRule": "@request.auth.id != \"\"",
    "passwordAuth": {
      "identityFields": [
        "name"
      ]
    },
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)",
      "CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != ''",
      "CREATE UNIQUE INDEX `idx_NPxorLNim7` ON `users` (`name`)",
      "CREATE UNIQUE INDEX `idx_WyugFHDNv7` ON `users` (`phone`)"
    ],
    "listRule": "id = @request.auth.id",
    "passwordAuth": {
      "identityFields": [
        "email"
      ]
    },
    "updateRule": "id = @request.auth.id",
    "viewRule": "id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
