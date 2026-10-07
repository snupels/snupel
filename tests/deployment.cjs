/* eslint-disable @typescript-eslint/no-require-imports -- Exercise deployment shell without AWS calls. */
const assert = require('node:assert/strict');
const { readFileSync, mkdtempSync, rmSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
function script(name) {
  const step = workflow.split(`      - name: ${name}\n`)[1]?.split('\n      - name: ')[0];
  assert.ok(step, name);
  return step.split('        run: |\n')[1].split('\n').map(line => line.replace(/^          /, '')).join('\n');
}
function run(name, mock, distribution = '') {
  const dir = mkdtempSync(join(tmpdir(), 'snupel-deploy-'));
  try {
    const envFile = join(dir, 'env');
    const result = spawnSync('bash', ['-e', '-o', 'pipefail', '-c', `aws() { ${mock}\n}\n${script(name)}`], {
      encoding: 'utf8', env: { ...process.env, RUNNER_TEMP: dir, CLOUDFRONT_DISTRIBUTION_ID: distribution, S3_BUCKET: 'test-bucket', SITE_DOMAIN: 'sportspassport.kr', GITHUB_ENV: envFile },
    });
    const archive = join(dir, 'previous-site.tar.gz');
    return { ...result, archive: existsSync(archive) ? spawnSync('tar', ['-tzf', archive], { encoding: 'utf8' }).stdout : '', saved: result.status === 0 && name.startsWith('Resolve') ? readFileSync(envFile, 'utf8') : '' };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
test('deployment tests before upload and retains original hashed assets', () => {
  assert.match(workflow, /cancel-in-progress: false/);
  assert.ok(workflow.indexOf('run: npm test') < workflow.indexOf('- name: Deploy to S3'));
  assert.ok(workflow.indexOf('- name: Resolve CloudFront') < workflow.indexOf('- name: Deploy to S3'));
  assert.doesNotMatch(workflow, /cp .*out\/_next\/static|--delete/);
});
test('rollback backup is complete before upload and fails closed', () => {
  const name = 'Back up current site before upload';
  assert.ok(workflow.indexOf(`- name: ${name}`) < workflow.indexOf('- name: Preserve rollback artifact'));
  assert.ok(workflow.indexOf('- name: Preserve rollback artifact') < workflow.indexOf('- name: Deploy to S3'));
  assert.match(workflow, /if-no-files-found: error/);
  assert.match(workflow, /retention-days: 7/);
  const success = run(name, 'test "$1 $2 $3" = "s3 sync s3://test-bucket" && printf old-site > "$4/index.html" && mkdir -p "$4/_next/static" && printf old-js > "$4/_next/static/old.js"');
  assert.equal(success.status, 0, success.stderr);
  assert.match(success.archive, /index\.html/);
  assert.match(success.archive, /_next\/static\/old\.js/);
  assert.notEqual(run(name, 'return 1').status, 0);
  assert.notEqual(run(name, 'return 0').status, 0);
});
test('distribution resolution succeeds only with a verified distribution', () => {
  const name = 'Resolve CloudFront distribution before upload';
  const success = run(name, 'test "$1 $2" = "cloudfront get-distribution"', 'DIST123');
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.saved, 'CLOUDFRONT_DISTRIBUTION_ID=DIST123\n');
  assert.notEqual(run(name, 'return 1', 'DIST123').status, 0);
  assert.notEqual(run(name, 'return 1').status, 0);
  const fallback = run(name, 'case "$1 $2" in "s3api get-bucket-policy") echo distribution/DIST456;; "cloudfront get-distribution") return 0;; *) return 1;; esac');
  assert.equal(fallback.status, 0, fallback.stderr);
  assert.equal(fallback.saved, 'CLOUDFRONT_DISTRIBUTION_ID=DIST456\n');
});
test('deployment waits for cache invalidation and propagates AWS failures', () => {
  const name = 'Refresh CloudFront cache';
  const success = run(name, 'case "$2" in create-invalidation) echo INV123;; wait) test "$6" = "--id" && test "$7" = "INV123";; *) return 1;; esac', 'DIST123');
  assert.equal(success.status, 0, success.stderr);
  assert.notEqual(run(name, 'return 1', 'DIST123').status, 0);
  assert.notEqual(run(name, 'if test "$2" = create-invalidation; then echo INV123; else return 1; fi', 'DIST123').status, 0);
});
