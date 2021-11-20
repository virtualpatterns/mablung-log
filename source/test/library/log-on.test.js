import { CreateLoggedProcess } from '@virtualpatterns/mablung-worker/test'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import { WorkerClient } from '@virtualpatterns/mablung-worker'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const Require = __require

const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const WorkerPath = Require.resolve('./worker/log-on.js')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test('onRotate() throws Error', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.onRotate(), { 'instanceOf': Error })
  } finally {
    await client.exit()
  }

})

Test('onBeforeExit() throws Error', async (test) => {

  let client = new LoggedClient(WorkerPath)

  await client.whenReady()

  try {
    await test.throwsAsync(client.worker.onBeforeExit(), { 'instanceOf': Error })
  } finally {
    await client.exit()
  }

})
