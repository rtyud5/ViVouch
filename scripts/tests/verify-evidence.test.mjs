import { test, describe, before, after } from 'node:test';
import { strict as assert } from 'node:assert';
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, "../..");
const testDocsDir = join(root, "w6_acceptance_docs", "test_fixtures");

describe('verify-evidence.mjs validator', () => {
  before(() => {
    // Create necessary folders for test
    if (!existsSync(testDocsDir)) {
      mkdirSync(testDocsDir, { recursive: true });
    }
  });

  after(() => {
    // Clean up
    if (existsSync(testDocsDir)) {
      rmSync(testDocsDir, { recursive: true, force: true });
    }
  });

  const runValidator = () => {
    try {
      execSync(`node "${join(root, "scripts", "verify-evidence.mjs")}"`, { encoding: 'utf8', stdio: 'pipe' });
      return { code: 0, output: '' };
    } catch (err) {
      return { code: err.status, output: err.stderr || err.stdout };
    }
  };

  test('should fail on local file:/// link', () => {
    const badFile = join(testDocsDir, 'bad-local-link.md');
    writeFileSync(badFile, '[Bad Link](file:///C:/Users/test/file.md)');
    const result = runValidator();
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Local path in link:/);
    rmSync(badFile);
  });

  test('should fail on missing relative link', () => {
    const badFile = join(testDocsDir, 'bad-relative-link.md');
    writeFileSync(badFile, '[Missing](missing-file-123.md)');
    const result = runValidator();
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Broken link:/);
    rmSync(badFile);
  });

  test('should fail on empty evidence file', () => {
    const badFile = join(testDocsDir, 'empty.md');
    writeFileSync(badFile, '');
    const result = runValidator();
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Empty evidence file:/);
    rmSync(badFile);
  });

  test('should fail on SHA placeholder', () => {
    const badFile = join(testDocsDir, 'placeholder.md');
    writeFileSync(badFile, 'FROZEN_SHA=<SHA>');
    const result = runValidator();
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Placeholder found in sign-off:/);
    rmSync(badFile);
  });

  test('should fail on invalid SHA length', () => {
    const badFile = join(testDocsDir, 'short-sha.md');
    writeFileSync(badFile, 'COMMIT_SHA=1234567890');
    const result = runValidator();
    assert.notEqual(result.code, 0);
    assert.match(result.output, /Invalid SHA length \(10\)/);
    rmSync(badFile);
  });
});
