import { Command } from 'commander';
import fs from 'fs';
import { execa } from 'execa';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { core } from 'zod';



const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .name('itsshops')
  .description('✨ itsshops - The core engine for your winery backend')
  .version('1.0.0');

program
  .command('dev')
  .description('🚀 Start the Sanity Studio in development mode')
  .option('-e, --env <path>', 'Path to .env file', '.env')
  .action(async (options) => {
    console.log(`\n🍷 ITSSHOPS | Starting Sanity Studio...\n`);

    const coreNodeModules = resolve(__dirname, '../node_modules');
    const customerNM = join(process.cwd(), 'node_modules');

    // Ensure the customer has a node_modules folder
    if (!fs.existsSync(customerNM)) {
      fs.mkdirSync(customerNM);
    }

    // List of packages Sanity might try to "auto-install"
    const packagesToSymlink = ['sanity', 'styled-components', 'react', 'react-dom'];

    packagesToSymlink.forEach(pkg => {
      const target = join(customerNM, pkg);
      const source = join(coreNodeModules, pkg);

      if (!fs.existsSync(target) && fs.existsSync(source)) {
        // Create a symlink: Customer Project -> Core Package
        fs.symlinkSync(source, target, 'dir');
      }
    });

    const root = process.cwd();
    // Resolve Sanity from the CORE-BACK node_modules
    const sanityBin = join(coreNodeModules, '.bin/sanity');
    console.log("sanityBin is", sanityBin);
    // const coreConfigPath = resolve(__dirname, '../dist/sanity.config.js');
    const configPath = resolve(root, 'sanity.config.ts');
    if (!fs.existsSync(configPath)) {
      console.error(`❌ CLI Error: Could not find shop.config.ts in ${root}`);
      process.exit(1);
    } else {
      console.log(`\n🍷 CLI customer configuration file found at ${configPath} \n`);
    }

    try {
      // We trigger the actual 'sanity dev' command
      // Sanity will look for 'sanity.config.ts' in the customer's root (process.cwd())
      // await execa(sanityBin, ['dev', '--config', coreConfigPath], {
      await execa(sanityBin, ['dev'], {
        stdio: 'inherit',
        shell: true,
        // cwd: root,
        env: {
          ...process.env,
          // You can pass custom flags to the createCoreBack function here
          ITSSHOPS_MODE: 'development',
          NODE_PATH: coreNodeModules,
          ITSSHOPS_CUSTOMER_CONFIG_PATH: configPath,
          SANITY_SKIP_LOCAL_CLI_CHECK: 'true', // 👈 The "Silver Bullet"
        }
      });
    } catch (err) {
      console.error('❌ Sanity failed to start.');
      process.exit(1);
    }
  });

program
  .command('build')
  .description('🏗️ Build the Sanity Studio for production')
  .action(async () => {
    const sanityBin = resolve(__dirname, '../node_modules/.bin/sanity');
    const root = process.cwd();
    console.log("root is", root);

    await execa(sanityBin, ['build', '--config', 'sanity.config.ts'], { stdio: 'inherit', shell: true, cwd: root });
  });

program.parse();