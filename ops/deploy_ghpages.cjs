const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const TOKEN = process.env.GH_TOKEN || require('fs').readFileSync(path.join(__dirname, '.gh_token'), 'utf8').trim();
const OWNER = 'Rui-z817';
const REPO = 'neicai-procurement-platform';
const DIST_DIR = 'C:/Users/Administrator/WorkBuddy/2026-06-26-11-38-38/app/dist';

function curl(method, url, body) {
  const args = ['-s', '-X', method,
    '-H', `Authorization: token ${TOKEN}`,
    '-H', 'Accept: application/vnd.github+json',
    '-H', 'User-Agent: deploy-script'];
  const tmpFile = body ? path.join(os.tmpdir(), 'gh_' + Date.now() + '.json') : null;
  if (body) { fs.writeFileSync(tmpFile, JSON.stringify(body)); args.push('--data', '@' + tmpFile); }
  args.push(url);
  try {
    const out = execSync('curl ' + args.map(a => a.includes(' ') ? `"${a}"` : a).join(' '), { maxBuffer: 500*1024*1024, encoding: 'utf-8' });
    try { return JSON.parse(out); } catch { return out; }
  } finally {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
}

function getAllFiles(dir, base) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (entry.isDirectory()) files = files.concat(getAllFiles(full, base));
    else files.push({ path: rel, full });
  }
  return files;
}

async function main() {
  const allFiles = getAllFiles(DIST_DIR, DIST_DIR);
  console.log(`1. Found ${allFiles.length} files`);

  // Create blobs
  console.log('2. Creating blobs...');
  const treeItems = [];
  for (let i = 0; i < allFiles.length; i++) {
    const f = allFiles[i];
    const b64 = fs.readFileSync(f.full).toString('base64');
    const blob = curl('POST', `https://api.github.com/repos/${OWNER}/${REPO}/git/blobs`, { content: b64, encoding: 'base64' });
    if (blob.sha) {
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
      process.stdout.write(`\r   ${i+1}/${allFiles.length} blobs created`);
    } else {
      console.error(`\n   ERROR: ${f.path} - ${JSON.stringify(blob).slice(0, 200)}`);
    }
  }
  console.log('');

  // Create tree
  console.log('3. Creating tree...');
  const tree = curl('POST', `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`, { tree: treeItems });
  if (!tree.sha) { console.error('Tree error:', JSON.stringify(tree).slice(0, 300)); process.exit(1); }
  console.log(`   Tree: ${tree.sha.slice(0, 12)}`);

  // Create commit
  console.log('4. Creating commit...');
  const commit = curl('POST', `https://api.github.com/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'Deploy to GitHub Pages',
    tree: tree.sha,
    parents: []
  });
  if (!commit.sha) { console.error('Commit error:', JSON.stringify(commit).slice(0, 300)); process.exit(1); }
  console.log(`   Commit: ${commit.sha.slice(0, 12)}`);

  // Create/update gh-pages branch
  console.log('5. Creating gh-pages branch...');
  let ref = curl('POST', `https://api.github.com/repos/${OWNER}/${REPO}/git/refs`, { ref: 'refs/heads/gh-pages', sha: commit.sha });
  if (!ref.object) {
    console.log('   Branch exists, updating...');
    ref = curl('PATCH', `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/gh-pages`, { sha: commit.sha, force: true });
  }
  if (ref.object) console.log(`   OK: ${ref.object.sha.slice(0, 12)}`);
  else { console.error('Ref error:', JSON.stringify(ref).slice(0, 300)); }

  // Update Pages config to use gh-pages branch (legacy = branch-based deploy)
  console.log('6. Updating Pages config...');
  const pages = curl('PUT', `https://api.github.com/repos/${OWNER}/${REPO}/pages`, {
    build_type: 'legacy',
    source: { branch: 'gh-pages', path: '/' }
  });
  if (pages.html_url) console.log(`   Pages URL: ${pages.html_url}`);
  else console.log(`   Response: ${JSON.stringify(pages).slice(0, 300)}`);

  // Trigger a Pages build (required: pushing gh-pages alone does not deploy)
  console.log('7. Triggering Pages build...');
  const build = curl('POST', `https://api.github.com/repos/${OWNER}/${REPO}/pages/builds`, null);
  if (build.status) console.log(`   Build status: ${build.status}`);
  else console.log(`   Build trigger response: ${JSON.stringify(build).slice(0, 300)}`);

  // Wait for the build to finish (max ~3 min)
  console.log('8. Waiting for build to finish...');
  for (let i = 0; i < 12; i++) {
    await new Promise(r => setTimeout(r, 15000));
    const latest = curl('GET', `https://api.github.com/repos/${OWNER}/${REPO}/pages/builds/latest`);
    console.log(`   [${i + 1}/12] status: ${latest.status || 'unknown'}`);
    if (latest.status === 'built') { console.log('   ✓ Deployed!'); break; }
    if (latest.status === 'errored' || latest.status === 'build_errored') { console.error('   Build failed!'); process.exit(1); }
  }

  console.log('\n✓ Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
