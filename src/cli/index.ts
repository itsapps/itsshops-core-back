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
    const outputDir = join(root, 'dist');
    const customerConfigPath = resolve(root, 'sanity.config.ts');

    // 1. DYNAMIC SEARCH FOR SANITY BINARY
    // We search the most likely locations where Sanity might be installed
    const possibleBinPaths = [
      join(root, 'node_modules/.bin/sanity'),              // 1. Hoisted Root (Netlify/Production)
      resolve(__dirname, '../node_modules/.bin/sanity'),   // 2. Nested (Local Dev/Link)
      resolve(__dirname, '../../.bin/sanity'),            // 3. Flattened Side-by-side
    ];

    let sanityBin = possibleBinPaths.find(p => fs.existsSync(p));

    // Fallback: Try Node resolution if filesystem search fails
    if (!sanityBin) {
      try {
        const pkgPath = require.resolve('sanity/package.json');
        sanityBin = join(dirname(pkgPath), '../../.bin/sanity');
      } catch (e) {
        // Final fallback failed
      }
    }

    if (!sanityBin || !fs.existsSync(sanityBin)) {
      console.error('❌ CLI Error: Sanity binary not found.');
      console.error('Paths searched:', possibleBinPaths);
      process.exit(1);
    }

    // 2. RESOLVE CORE NODE_MODULES (For Symlinking/NODE_PATH)
    // We base this on the location of the sanityBin we found
    const coreNodeModules = resolve(dirname(sanityBin), '..');

    console.log(`🍷 Heavy Engine: Using Sanity from ${coreNodeModules}`);

    // 3. ENSURE SYMLINKS (Crucial for Vite/Sanity to see UI dependencies)
    const customerNM = join(root, 'node_modules');
    if (!fs.existsSync(customerNM)) fs.mkdirSync(customerNM, { recursive: true });

    const packagesToSymlink = ['sanity', 'styled-components', 'react', 'react-dom'];
    packagesToSymlink.forEach(pkg => {
      const target = join(customerNM, pkg);
      const source = join(coreNodeModules, pkg);
      
      if (!fs.existsSync(target) && fs.existsSync(source)) {
        try {
          // 'junction' is safer for Windows users without Admin rights
          fs.symlinkSync(source, target, process.platform === 'win32' ? 'junction' : 'dir');
        } catch (e) {
          /* Link might exist or permission denied - continue */
        }
      }
    });

    // 4. VALIDATE CONFIG
    if (!fs.existsSync(customerConfigPath)) {
      console.error(`❌ CLI Error: Could not find sanity.config.ts in ${root}`);
      process.exit(1);
    }

    // 5. RUN THE BUILD
    console.log(`🚀 Starting production build into ${outputDir}...`);

    try {
      // We pass outputDir as a positional argument for the 'build' command
      await execa(sanityBin, ['build', outputDir], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          // Force Node to look in our core modules for dependencies
          NODE_PATH: coreNodeModules,
          // Let the Master Config (if used) know where the customer file is
          ITSSHOPS_CUSTOMER_CONFIG_PATH: customerConfigPath,
          // Bypass the "is this a sanity project" check
          SANITY_SKIP_LOCAL_CLI_CHECK: 'true',
        }
      });
      
      console.log('\n✅ Build complete successfully.');
    } catch (err) {
      console.error('\n❌ Sanity build failed.');
      process.exit(1);
    }
  });

program.parse();