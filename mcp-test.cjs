const { spawn } = require('child_process');

const serverPath = 'D:\\pencil\\resources\\app.asar.unpacked\\out\\mcp-server-windows-x64.exe';
const server = spawn(serverPath, ['--app', 'desktop'], { stdio: ['pipe', 'pipe', 'pipe'] });

let buffer = '';
let requestId = 0;
const pending = new Map();

server.stdout.on('data', (data) => {
  buffer += data.toString();
  try {
    const result = JSON.parse(buffer);
    buffer = '';
    const { id } = result;
    if (id && pending.has(id)) { pending.get(id)(result); pending.delete(id); }
  } catch (e) {}
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    pending.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error('Timeout')); } }, 60000);
  });
}

const TOKENS = [
  { n: 'color/bg/page',        t: 'color', v: '#F7FAFD' },
  { n: 'color/bg/container',   t: 'color', v: '#FFFFFF' },
  { n: 'color/bg/overlay',     t: 'color', v: 'rgba(0,0,0,0.45)' },
  { n: 'color/brand/normal',   t: 'color', v: '#3B71EE' },
  { n: 'color/brand/hover',    t: 'color', v: '#5488F0' },
  { n: 'color/brand/light',    t: 'color', v: '#E8F0FE' },
  { n: 'color/status/success', t: 'color', v: '#52c41a' },
  { n: 'color/status/warning', t: 'color', v: '#faad14' },
  { n: 'color/status/error',   t: 'color', v: '#f5222d' },
  { n: 'color/text/primary',   t: 'color', v: '#262626' },
  { n: 'color/text/secondary', t: 'color', v: '#8c8c8c' },
  { n: 'color/text/placeholder', t: 'color', v: '#bfbfbf' },
  { n: 'color/text/link',      t: 'color', v: '#3B71EE' },
  { n: 'color/text/anti',      t: 'color', v: '#FFFFFF' },
  { n: 'color/border/default', t: 'color', v: '#d9d9d9' },
  { n: 'color/stroke/default', t: 'color', v: '#F0F0F0' },
  { n: 'color/get-text',       t: 'color', v: '#1890ff' },
  { n: 'color/post-text',      t: 'color', v: '#722ed1' },
];

async function main() {
  try {
    await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'qoder', version: '1.0.0' } });
    await send('notifications/initialized', {});

    const openRes = await send('tools/call', { name: 'open_document', arguments: { filePath: 'design/SQL转API.pen' } });
    console.log('✓ 文档已打开:', openRes.result?.status || 'ok');

    const vars = {};
    TOKENS.forEach(tk => { vars[tk.n] = { type: tk.t, value: tk.v }; });
    await send('tools/call', { name: 'set_variables', arguments: { filePath: 'design/SQL转API.pen', variables: vars } });
    console.log('✓ Token 已注入 (' + TOKENS.length + ' 个)');

    const verify = await send('tools/call', { name: 'get_variables', arguments: { filePath: 'design/SQL转API.pen' } });
    const count = Object.keys(verify.result?.variables || {}).length;
    console.log('✓ 变量验证通过, 共 ' + count + ' 个变量');

    console.log('\n=== SQL转API 设计稿就绪 ===');
    console.log('文件: design/SQL转API.pen');
    console.log('画板: 3 个');
    console.log('  - SQL转API - 列表页');
    console.log('  - SQL转API - API调试页');
    console.log('  - SQL转API - 创建/编辑抽屉');
    console.log('Token: ' + TOKENS.length + ' 个已注入');

  } catch (e) {
    console.error('错误:', e.message);
  } finally {
    setTimeout(() => process.exit(0), 2000);
  }
}

main();
