/**
 * Test runner for LLM module
 * Runs all test suites and generates a summary report
 */

import { spawn } from 'child_process';
import { resolve } from 'path';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  duration?: number;
  error?: string;
}

const tests = [
  'provider.test.ts',
  'prompts.test.ts',
  'fallback.test.ts',
  'service.integration.test.ts',
  'performance.bench.ts'
];

async function runTest(testFile: string): Promise<TestResult> {
  return new Promise((resolve) => {
    const testPath = resolve(__dirname, testFile);
    const startTime = Date.now();

    const proc = spawn('node', ['--test', testPath], {
      cwd: resolve(__dirname, '../../../..'),
      env: process.env,
      stdio: 'pipe'
    });

    let output = '';
    let error = '';

    proc.stdout?.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      error += data.toString();
    });

    proc.on('close', (code) => {
      const duration = Date.now() - startTime;

      resolve({
        name: testFile,
        status: code === 0 ? 'pass' : code === null ? 'skip' : 'fail',
        duration,
        error: error || undefined
      });
    });
  });
}

async function main() {
  console.log('Running LLM module test suite...\n');
  console.log('Tests:', tests.join(', '));
  console.log('---\n');

  const results: TestResult[] = [];

  for (const test of tests) {
    try {
      const result = await runTest(test);
      results.push(result);

      const statusIcon = result.status === 'pass' ? '✓' : result.status === 'skip' ? '○' : '✗';
      const duration = result.duration ? ` (${result.duration}ms)` : '';
      console.log(`${statusIcon} ${result.name}${duration}`);

      if (result.error) {
        console.log(`  Error: ${result.error.substring(0, 100)}`);
      }
    } catch (error) {
      console.error(`Error running ${test}:`, error);
      results.push({
        name: test,
        status: 'fail',
        error: String(error)
      });
    }
  }

  // Summary
  console.log('\n---');
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  console.log(`\nResults: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log(`Total duration: ${totalDuration}ms\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
