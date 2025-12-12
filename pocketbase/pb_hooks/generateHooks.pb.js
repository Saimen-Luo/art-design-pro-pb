/// <reference path="../pb_data/types.d.ts" />

const generateTypes = (e) => {
  console.log('Collection changed - Running type generation...')
  const cmd = $os.cmd(
    'npx',
    'typed-pocketbase',
    '--email',
    'admin@local.host',
    '--password',
    'yZrFElRtbvoRsn9ygJpo',
    '--type',
    'ts',
    '--dir',
    'src/types/pb'
  )
  const result = toString(cmd.output())
  console.log(result)

  e.next()
}

onCollectionAfterCreateSuccess(generateTypes)
onCollectionAfterUpdateSuccess(generateTypes)
onCollectionAfterDeleteSuccess(generateTypes)
