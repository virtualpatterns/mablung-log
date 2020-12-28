import '@virtualpatterns/mablung-source-map-support/install';
import { FormattedLog } from '../index.js';
import Pino from 'pino';

async function main() {

  try {

    // let e = new Error('error')

    // let s = Pino.stdSerializers

    // let o = s.err(new Error('error'))

    let log0 = Pino();

    // log0.error('message')
    // log0.error({ 'a': 'bc' })
    log0.error(new Error('error'));

    let log1 = Pino({ 'nestedKey': 'data' });

    // log1.error('message')
    // log1.error({ 'a': 'bc' })
    log1.error(new Error('error'));

    let log2 = new FormattedLog();

    log2.error(new Error('error'));

    console.log('hey!');

  } catch (error) {
    console.error(error);
  }

}

main();
//# sourceMappingURL=t.js.map