#!/usr/bin/env node

/**
 * Autonomous Agent Parallel Executor
 * Miyabiフレームワーク用の並列実行スクリプト
 */

import { parseArgs } from 'node:util';
import { CoordinatorAgent } from '../agents/coordinator.js';

const HELP_MESSAGE = `
Autonomous Operations - Parallel Executor

Usage: npm run agents:parallel:exec -- [options]

Options:
  --issue <number>       Issue number to process
  --concurrency <n>      Max concurrent agents (default: 3)
  --log-level <level>    Log level: info, debug, error (default: info)
  --help                 Show this help message

Example:
  npm run agents:parallel:exec -- --issue 2 --concurrency 3 --log-level info

Environment Variables Required:
  GITHUB_TOKEN           GitHub Personal Access Token
  ANTHROPIC_API_KEY      Anthropic API Key
  REPOSITORY             Repository in format owner/repo
`;

function parseArguments() {
  try {
    const { values } = parseArgs({
      options: {
        issue: { type: 'string' },
        concurrency: { type: 'string', default: '3' },
        'log-level': { type: 'string', default: 'info' },
        help: { type: 'boolean', default: false }
      },
      strict: false
    });

    if (values.help) {
      console.log(HELP_MESSAGE);
      process.exit(0);
    }

    return values;
  } catch (error) {
    console.error('Error parsing arguments:', error.message);
    console.log(HELP_MESSAGE);
    process.exit(1);
  }
}

function validateEnvironment() {
  const required = ['GITHUB_TOKEN', 'ANTHROPIC_API_KEY', 'REPOSITORY'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('\nPlease set the following:');
    missing.forEach(key => console.error(`  - ${key}`));
    process.exit(1);
  }
}

async function main() {
  const args = parseArguments();

  console.log('🚀 Autonomous Agent Parallel Executor');
  console.log('=====================================');
  console.log(`Issue: #${args.issue || 'N/A'}`);
  console.log(`Concurrency: ${args.concurrency}`);
  console.log(`Log Level: ${args['log-level']}`);
  console.log('');

  if (!args.issue) {
    console.log('⚠️  No issue number provided. Use --issue <number> to specify an issue.');
    return;
  }

  // 環境変数チェック
  validateEnvironment();

  // CoordinatorAgentを実行
  const coordinator = new CoordinatorAgent({
    githubToken: process.env.GITHUB_TOKEN,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    repository: process.env.REPOSITORY,
    issueNumber: parseInt(args.issue, 10),
  });

  await coordinator.execute();
}

main().catch(error => {
  console.error('❌ Execution failed:', error);
  console.error(error.stack);
  process.exit(1);
});
