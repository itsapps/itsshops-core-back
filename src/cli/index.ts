import { Command } from 'commander';
import fs from 'fs';
import { execa } from 'execa';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { core } from 'zod';
import { createRequire } from 'module';


const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

function getSanityBinPath() {
  try {
    // 1. Try to find sanity in the dependency tree
    const sanityPkgPath = require.resolve('sanity/package.json');
    // 2. Go from .../node_modules/sanity/package.json to .../node_modules/.bin/sanity
    return join(dirname(sanityPkgPath), '../../.bin/sanity');
  } catch (e) {
    // 3. Fallback to your hardcoded path if resolution fails
    return join(process.cwd(), 'node_modules/.bin/sanity');
  }
}

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
    const root = process.cwd();
    
    // 1. DYNAMICALLY LOCATE THE SANITY BINARY
    let sanityBin: string;
    let coreNodeModules: string;

    try {
      // Find where 'sanity' is installed (handles hoisting on Netlify)
      const sanityPkgPath = require.resolve('sanity/package.json');
      const sanityFolder = dirname(sanityPkgPath);
      
      // Go from .../node_modules/sanity up to .../node_modules
      coreNodeModules = resolve(sanityFolder, '..');
      // The binary is always in the .bin folder of that node_modules
      sanityBin = join(coreNodeModules, '.bin/sanity');
    } catch (e) {
      // Local development / link fallback
      coreNodeModules = resolve(__dirname, '../node_modules');
      sanityBin = join(coreNodeModules, '.bin/sanity');
    }

    // 2. VERIFY BINARY EXISTS
    if (!fs.existsSync(sanityBin)) {
      console.error(`❌ CLI Error: Could not find sanity binary at ${sanityBin}`);
      process.exit(1);
    }

    // 3. SYMLINK LOGIC (Ensuring UI dependencies are found)
    const customerNM = join(root, 'node_modules');
    if (!fs.existsSync(customerNM)) fs.mkdirSync(customerNM, { recursive: true });

    const packagesToSymlink = ['sanity', 'styled-components', 'react', 'react-dom'];
    packagesToSymlink.forEach(pkg => {
      const target = join(customerNM, pkg);
      const source = join(coreNodeModules, pkg);
      if (!fs.existsSync(target) && fs.existsSync(source)) {
        try { fs.symlinkSync(source, target, 'dir'); } catch (e) { /* silent fail if link exists */ }
      }
    });

    // 4. PREPARE PATHS
    const configPath = resolve(root, 'sanity.config.ts');
    const outputDir = join(root, 'dist');

    console.log(`🍷 Building Sanity Studio to ${outputDir}...`);

    try {
      await execa(sanityBin, ['build', outputDir], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          // Help Node find nested dependencies during the Vite build
          NODE_PATH: coreNodeModules,
          // Tell your Master Config where the customer config is
          ITSSHOPS_CUSTOMER_CONFIG_PATH: configPath,
          // Bypass the Sanity project check
          SANITY_SKIP_LOCAL_CLI_CHECK: 'true',
        }
      });
    } catch (err) {
      console.error('❌ Sanity build failed.');
      process.exit(1);
    }
  });

program.parse();