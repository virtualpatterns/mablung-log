import Test from 'ava'

;[
  'Destination',
  'ConsoleDestination',
  'FastDestination',
  'FileDestination',
  'StreamDestination',
  'Log',
  'FastLog',
  'FormattedLog',
  'ShortFormattedLog',
  'DestinationInvalidLevelError'
].forEach((name) => {

  Test(name, async (test) => {
    test.truthy(await import('@virtualpatterns/mablung-log').then((module) => module[name]))
  })
  
})
