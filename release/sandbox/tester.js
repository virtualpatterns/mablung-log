import '@virtualpatterns/mablung-source-map-support/install';

import { FormattedLog } from '../index.js';

async function main() {

  try {

    let log = new FormattedLog({ 'level': 'trace' });

    log.trace('trace this!');
    log.error(new Error('error this!'));
    log.info({ 'value': {} }, 'info this!');

  } catch (error) {
    console.error(error);
  }

}

main();
//# sourceMappingURL=tester.js.map