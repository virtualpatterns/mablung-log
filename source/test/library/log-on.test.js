import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'
import { FileSystem } from '@virtualpatterns/mablung-file-system'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.c?js$/, '.log')
const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
const Require = __require
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
