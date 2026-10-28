import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { test } from 'node:test';
import { load } from 'js-yaml';

test('active experiment can build artifacts but cannot publish or acquire deployment permissions', async context => {
  let source;
  try { source = await fs.readFile(new URL('../../.github/workflows/documentation-experiment.yml', import.meta.url), 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') return context.skip('Optional experiment workflow is absent in this consuming repository');
    throw error;
  }
  const workflow = load(source);
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(workflow.on.push.branches, ['feat/docusaurus']);
  assert.equal(workflow.on.workflow_dispatch, null);
  assert.doesNotMatch(source, /pull_request_target|secrets\./);
  for (const job of Object.values(workflow.jobs)) {
    assert.equal(job.permissions, undefined);
    assert.equal(job.environment, undefined);
    for (const step of job.steps) assert.doesNotMatch(step.uses ?? '', /deploy|upload-pages|configure-pages/);
  }
});

test('inactive Pages template guards both jobs and grants write only to deployment', async () => {
  const workflow = load(await fs.readFile(new URL('../deployment/github-pages.yml.example', import.meta.url), 'utf8'));
  assert.deepEqual(workflow.permissions, { contents: 'read' });
  assert.deepEqual(workflow.on.push.branches, ['main']);
  for (const name of ['build', 'deploy']) {
    const condition = workflow.jobs[name].if;
    assert.match(condition, /DOCS_PAGES_APPROVED == 'true'/);
    assert.equal(condition, "${{ vars.DOCS_PAGES_APPROVED == 'true' && github.ref == 'refs/heads/main' }}");
  }
  assert.equal(workflow.jobs.build.permissions, undefined);
  assert.deepEqual(workflow.jobs.deploy.permissions, { pages: 'write', 'id-token': 'write' });
  assert.equal(workflow.jobs.deploy.needs, 'build');
  assert.equal(workflow.jobs.deploy.environment.name, 'github-pages');
});
