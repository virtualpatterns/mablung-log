// import '@virtualpatterns/mablung-source-map-support/install'
// import { CreateLoggedProcess, WorkerClient } from '@virtualpatterns/mablung-worker'

// const FilePath = __filePath
// const JsonPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.json')
// const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
// const LoggedClient = CreateLoggedProcess(WorkerClient, LogPath)
// const Require = __require
// const WorkerPath = Path.resolve(FolderPath, '../test/library/worker/log.js')

// async function main() {

//   try {

//     let client = new LoggedClient(WorkerPath)

//     await client.whenReady()

//     try {
//       // await client.worker.createLog(JsonPath, { 'level': 'trace', 'handleExit': true })
//     } finally {
//       await client.exit()
//     }

//   } catch (error) {
//     console.error(error)
//   }

// }

// main()