// import type { ItsshopsConfig } from './src/types'
import { createCoreBack } from './src/index'

const customerConfigPath = process.env.ITSSHOPS_CUSTOMER_CONFIG_PATH!;
const customerConfig = await import(customerConfigPath).then(m => m.default);
if (!customerConfig) {
  console.error(`❌ Error: Could not find shop.config.ts in ${process.cwd()}`);
  process.exit(1);
} else {
  console.log(`\n🍷 customer configuration file found at ${customerConfig} \n`);
}

export default createCoreBack(customerConfig)
