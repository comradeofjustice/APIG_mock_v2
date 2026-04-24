#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import prompts from 'prompts';

// 项目配置，可按分发场景自行扩展
const PROJECTS = [
  {
    label: '智启模板（Fronted）',
    repo: 'http://gitlab.info.dbappsecurity.com.cn/seclabfront1/vue-project-template.git',
    defaultBranch: 'feature/template',
    defaultDirName: 'vue-project-template',
  },
  {
    label: '自定义 Git 仓库地址',
    repo: 'custom',
    defaultBranch: 'main',
    defaultDirName: 'my-project',
  },
];

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} 退出码：${code}`));
    });
  });
}

function runCommandCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || `${command} 退出码：${code}`));
    });
  });
}

function extractDevServerUrlFromOutput(raw) {
  if (!raw) return null;
  const text = String(raw);

  const localMatches = [...text.matchAll(/Local:\s*(https?:\/\/[^\s]+)/gi)];
  if (localMatches.length > 0) return localMatches[localMatches.length - 1][1];

  const appRunningMatches = [...text.matchAll(/App\s+running\s+at:\s*(https?:\/\/[^\s]+)/gi)];
  if (appRunningMatches.length > 0) return appRunningMatches[appRunningMatches.length - 1][1];

  const generic = [...text.matchAll(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+[^\s]*/gi)];
  if (generic.length > 0) return generic[generic.length - 1][0];

  return null;
}

function openUrlInBrowser(url) {
  if (!url) return;
  if (process.platform === 'darwin') {
    spawn('open', [url], { detached: true, stdio: 'ignore' }).unref();
  } else if (process.platform === 'win32') {
    spawn('cmd', ['/c', `start "" "${url}"`], { detached: true, stdio: 'ignore', shell: true }).unref();
  } else {
    spawn('xdg-open', [url], { detached: true, stdio: 'ignore' }).unref();
  }
}

function runDevWithUrlCapture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
      ...options,
    });

    let buf = '';
    let opened = false;
    let latestParsedUrl = null;
    let quietOpenTimer = null;
    let stableOpenTimer = null;
    let fallbackTimer = null;

    const clearTimers = () => {
      if (quietOpenTimer) clearTimeout(quietOpenTimer);
      if (stableOpenTimer) clearTimeout(stableOpenTimer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      quietOpenTimer = null;
      stableOpenTimer = null;
      fallbackTimer = null;
    };

    const tryOpen = (url, reason = 'parsed') => {
      if (!url || opened) return;
      opened = true;
      clearTimers();
      if (reason === 'parsed') console.log(`   已识别到 dev 实际地址：${url}，正在打开浏览器...`);
      else console.log(`   未识别到 Local 地址，改用参考地址打开：${url}`);
      openUrlInBrowser(url);
    };

    const scheduleStableOpen = () => {
      if (opened || !latestParsedUrl) return;
      if (stableOpenTimer) clearTimeout(stableOpenTimer);
      stableOpenTimer = setTimeout(() => {
        stableOpenTimer = null;
        if (opened || !latestParsedUrl) return;
        tryOpen(latestParsedUrl, 'parsed');
      }, 1300);
    };

    const onChunk = (data, isStdErr = false) => {
      const text = data.toString();
      buf += text;
      if (buf.length > 96000) buf = buf.slice(-64000);
      if (isStdErr) process.stderr.write(text);
      else process.stdout.write(text);

      if (opened) return;
      if (quietOpenTimer) clearTimeout(quietOpenTimer);
      quietOpenTimer = setTimeout(() => {
        quietOpenTimer = null;
        const parsed = extractDevServerUrlFromOutput(buf);
        if (parsed) {
          latestParsedUrl = parsed;
          scheduleStableOpen();
        }
      }, 2800);
    };

    child.stdout.on('data', (d) => onChunk(d, false));
    child.stderr.on('data', (d) => onChunk(d, true));
    child.on('error', (err) => {
      clearTimers();
      reject(err);
    });

    fallbackTimer = setTimeout(() => {
      fallbackTimer = null;
      if (opened) return;
      const parsed = extractDevServerUrlFromOutput(buf);
      if (parsed) latestParsedUrl = parsed;
      const fallbackOpenUrl = options.fallbackOpenUrl;
      tryOpen(latestParsedUrl || fallbackOpenUrl, latestParsedUrl ? 'parsed' : 'fallback');
    }, 12000);

    child.on('close', (code) => {
      clearTimers();
      if (code === 0) resolve();
      else reject(new Error(`${command} 退出码：${code}`));
    });
  });
}

async function getGitRemoteUrl(cwd) {
  try {
    const { stdout } = await runCommandCapture('git', ['remote', 'get-url', 'origin'], { cwd });
    return stdout.trim();
  } catch {
    return null;
  }
}

async function tryGitClone(repoUrl, targetDir) {
  console.log('3. 正在克隆代码，请稍等...');
  try {
    await runCommand('git', ['clone', repoUrl, targetDir]);
    console.log('   代码克隆完成 ✅\n');
  } catch (e) {
    const msg = e.message || '';
    console.error('   克隆代码失败 ❌');
    console.error(`   原始错误：${msg}\n`);

    if (/Authentication failed|authentication required|auth/i.test(msg) || /401|403/.test(msg)) {
      console.log('   可能原因：');
      console.log('   - GitLab 账号没有该仓库权限；');
      console.log('   - 或用户名/密码（Token）配置不正确。');
      console.log('   建议：');
      console.log('   1）确认你能在浏览器访问该 GitLab 仓库；');
      console.log('   2）确认账号已被加入对应项目；');
      console.log('   3）如仍有问题，请将以上错误信息截图给前端/运维同学。\n');
    } else if (/Could not resolve host|Name or service not known|Temporary failure in name resolution/i.test(msg)) {
      console.log('   看起来是网络问题：无法连接到 Git 服务器。');
      console.log('   请确认：');
      console.log('   - 电脑已连接公司内网 / VPN；');
      console.log('   - 可以在浏览器打开 GitLab 地址。');
      console.log('   处理好网络后，请重新运行本向导。\n');
    }

    throw e;
  }
}

function detectPackageManager(targetDir, pkg) {
  if (pkg && typeof pkg.packageManager === 'string') {
    const name = pkg.packageManager.split('@')[0];
    if (['pnpm', 'yarn', 'npm'].includes(name)) return name;
  }
  if (fs.existsSync(path.join(targetDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(targetDir, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(targetDir, 'package-lock.json'))) return 'npm';
  return 'npm';
}

function isCommandAvailable(command) {
  return new Promise((resolve) => {
    const child = spawn(command, ['--version'], {
      stdio: 'ignore',
      shell: process.platform === 'win32',
    });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

function getDevPortFromConfig(targetDir) {
  const configs = ['vite.config.js', 'vite.config.ts', 'configs/vite.config.dev.js', 'configs/vite.config.dev.ts'];
  for (const name of configs) {
    const p = path.join(targetDir, name);
    if (!fs.existsSync(p)) continue;
    try {
      const content = fs.readFileSync(p, 'utf8');
      const m = content.match(/port:\s*(\d+)/);
      if (m) return parseInt(m[1], 10);
    } catch {
      // ignore
    }
  }
  return null;
}

async function ensurePackageManagerAvailable(pm) {
  if (pm === 'npm') return { pm: 'npm', useNpx: false };
  const pmAvailable = await isCommandAvailable(pm);
  if (pmAvailable) return { pm, useNpx: false };
  const npxAvailable = await isCommandAvailable('npx');
  if (npxAvailable) return { pm, useNpx: true };
  return { pm: 'npm', useNpx: false };
}

function getRunScript(pkg) {
  const scripts = (pkg && pkg.scripts) || {};
  if (scripts.dev) return 'dev';
  if (scripts.start) return 'start';
  return null;
}

async function checkNodeVersionWithPackage(pkg) {
  if (!pkg || !pkg.engines || !pkg.engines.node) return true;
  const required = pkg.engines.node;
  const current = process.versions.node;
  console.log(`检测到该项目声明的 Node 版本要求：${required}`);
  console.log(`你当前的 Node 版本为：v${current}`);

  const match = required.match(/^\s*v?(\d+)(?:\D.*)?$/);
  if (match) {
    const wantedMajor = parseInt(match[1], 10);
    const currentMajor = parseInt(current.split('.')[0], 10);
    if (Number.isFinite(wantedMajor) && wantedMajor !== currentMajor) {
      console.log('');
      console.log('⚠️  当前 Node 主版本与项目声明不一致，可能导致安装或运行失败。');
      const { cont } = await prompts({
        type: 'toggle',
        name: 'cont',
        message: `项目推荐 Node ${wantedMajor}.x，你当前为 ${currentMajor}.x，是否仍然继续？`,
        initial: false,
        active: '继续',
        inactive: '退出',
      });
      if (!cont) {
        console.log('已根据你的选择退出。请安装合适的 Node 版本后重试。');
        process.exit(1);
      }
    }
  } else {
    console.log('（提示：项目使用了更复杂的 Node 版本约束，请确保你本机版本满足上述要求。）');
  }
  console.log('');
  return true;
}

async function resolveTargetDir(baseDir, projectName) {
  let name = projectName.trim();
  let targetDir = path.join(baseDir, name);

  if (!fs.existsSync(targetDir)) return { targetDir, finalName: name };

  const { action } = await prompts({
    type: 'select',
    name: 'action',
    message: `检测到 ${targetDir} 已经存在，如何处理？`,
    choices: [
      { title: '重新输入项目名称', value: 'rename' },
      { title: '自动在名称后追加数字（my-project-1 / -2 ...）', value: 'auto' },
    ],
  });

  if (action === 'rename') {
    const { newName } = await prompts({
      type: 'text',
      name: 'newName',
      message: '请输入新的项目名称：',
      validate: (v) => (v && v.trim().length > 0 ? true : '项目名称不能为空'),
    });
    return resolveTargetDir(baseDir, newName);
  }

  let i = 1;
  while (fs.existsSync(targetDir)) {
    const candidate = `${name}-${i}`;
    targetDir = path.join(baseDir, candidate);
    i += 1;
  }
  console.log(`   已自动调整项目目录为：${targetDir}`);
  const finalName = path.basename(targetDir);
  return { targetDir, finalName };
}

function checkGit() {
  try {
    spawn('git', ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('==============================');
  console.log(' 前端环境向导（通用版）');
  console.log('==============================\n');
  console.log(`1. Node 环境检测：已检测到 Node 版本 ${process.version}\n`);

  const hasGit = checkGit();
  if (!hasGit) {
    console.log('2. Git 环境检测：未检测到 Git');
    console.log('   请先安装 Git（安装好后再重新运行本向导）。\n');
    process.exit(1);
  } else {
    console.log('2. Git 环境检测：已安装 ✅\n');
  }

  const { projectChoice } = await prompts({
    type: 'select',
    name: 'projectChoice',
    message: '请选择要准备的项目：',
    choices: PROJECTS.map((p, index) => ({ title: p.label, value: index })),
  });

  const project = PROJECTS[projectChoice];
  let repoUrl = project.repo;
  let dirName = project.defaultDirName;

  if (project.repo === 'custom') {
    const customAnswers = await prompts([
      {
        type: 'text',
        name: 'repoUrl',
        message: '请输入 Git 仓库地址：',
        validate: (value) => (value && value.trim().length > 0 ? true : '仓库地址不能为空'),
      },
      {
        type: 'text',
        name: 'dirName',
        message: '建议的目录名称（用于创建子目录）：',
        initial: dirName,
      },
    ]);
    repoUrl = customAnswers.repoUrl.trim();
    dirName = (customAnswers.dirName || dirName).trim();
  }

  const defaultDir = path.join(os.homedir(), 'workspace');
  const answers = await prompts([
    {
      type: 'text',
      name: 'targetDir',
      message: '请输入代码存放路径（可以直接回车使用默认路径）：',
      initial: defaultDir,
    },
    {
      type: 'select',
      name: 'branchMode',
      message: '分支操作方式：',
      choices: [
        { title: '直接使用已有分支', value: 'useExisting' },
        { title: '基于某个分支创建新分支', value: 'createFrom' },
      ],
      initial: 0,
    },
    {
      type: 'toggle',
      name: 'installDeps',
      message: '代码下载完成后，是否自动安装依赖？',
      initial: true,
      active: '是',
      inactive: '否',
    },
    {
      type: 'toggle',
      name: 'startDev',
      message: '依赖安装完成后，是否自动启动项目（npm run dev）？',
      initial: true,
      active: '是',
      inactive: '否',
    },
  ]);

  const baseDir = path.resolve(answers.targetDir);
  const { targetDir, finalName } = await resolveTargetDir(baseDir, dirName);
  const branchMode = answers.branchMode;

  console.log('\n目标信息：');
  console.log(`- 仓库地址：${repoUrl}`);
  console.log(`- 项目目录名称：${finalName}`);
  console.log(`- 分支：稍后在远程分支列表中选择${branchMode === 'createFrom' ? ' / 创建' : ''}`);
  console.log(`- 本地根目录：${baseDir}`);
  console.log(`- 实际代码目录：${targetDir}\n`);

  let needClone = true;

  if (fs.existsSync(targetDir)) {
    const stat = fs.statSync(targetDir);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(targetDir);
      const gitDir = path.join(targetDir, '.git');
      if (files.length > 0 && fs.existsSync(gitDir)) {
        const remoteUrl = await getGitRemoteUrl(targetDir);
        if (remoteUrl && remoteUrl === repoUrl) {
          const { reuse } = await prompts({
            type: 'toggle',
            name: 'reuse',
            message: '检测到该目录已有对应仓库代码，是否复用并跳过重新克隆？',
            initial: true,
            active: '复用',
            inactive: '重新拉取',
          });
          if (reuse) {
            needClone = false;
            console.log('   将复用已有代码目录，并在其基础上继续操作。\n');
          }
        }
      }
    }
  }

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
  if (needClone) await tryGitClone(repoUrl, targetDir);
  else console.log('3. 跳过克隆步骤，直接使用本地已有代码。\n');

  console.log('4. 正在获取远程分支列表...');
  let remoteBranches = [];
  try {
    const { stdout } = await runCommandCapture('git', ['ls-remote', '--heads', 'origin'], { cwd: targetDir });
    remoteBranches = stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line) => line.split('\t')[1])
      .map((ref) => ref.replace('refs/heads/', ''));
  } catch {
    console.log('   获取远程分支失败，将使用你后续输入的分支名称继续。');
  }

  if (branchMode === 'useExisting') {
    let branchToUse = null;
    if (remoteBranches.length > 0) {
      const { pickedBranch } = await prompts({
        type: 'select',
        name: 'pickedBranch',
        message: '请选择要使用的远程分支：',
        choices: remoteBranches.map((b) => ({ title: b, value: b })),
      });
      branchToUse = pickedBranch;
    } else {
      const { inputBranch } = await prompts({
        type: 'text',
        name: 'inputBranch',
        message: '未能获取远程分支，请手动输入要切换的分支名：',
      });
      branchToUse = inputBranch;
    }
    console.log(`5. 正在切换分支到 ${branchToUse} ...`);
    await runCommand('git', ['checkout', branchToUse], { cwd: targetDir });
    console.log('   分支切换完成 ✅\n');
  } else {
    let baseBranch = null;
    if (remoteBranches.length > 0) {
      const { pickedBase } = await prompts({
        type: 'select',
        name: 'pickedBase',
        message: '请选择“基础分支”（将先切到这个分支）：',
        choices: remoteBranches.map((b) => ({ title: b, value: b })),
      });
      baseBranch = pickedBase;
    } else {
      const { inputBase } = await prompts({
        type: 'text',
        name: 'inputBase',
        message: '未能获取远程分支，请手动输入“基础分支”名称：',
      });
      baseBranch = inputBase;
    }

    const { newBranch } = await prompts({
      type: 'text',
      name: 'newBranch',
      message: '请输入要“新建的分支名”（本地与远程将保持一致）：',
      validate: (value) => (value && value.trim().length > 0 ? true : '新分支名不能为空'),
    });

    console.log(`5. 正在基于 ${baseBranch} 创建并推送新分支 ${newBranch} ...`);
    await runCommand('git', ['checkout', baseBranch], { cwd: targetDir });
    await runCommand('git', ['checkout', '-b', newBranch], { cwd: targetDir });
    await runCommand('git', ['push', '-u', 'origin', newBranch], { cwd: targetDir });
    console.log('   新分支创建、本地切换并推送到远程完成 ✅\n');
  }

  const packageJsonPath = path.join(targetDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('⚠️  当前分支下未找到 package.json，说明这里还没有可直接运行的前端工程代码。');
    console.log('   - 如果这是一个空仓库 / 仅 README 分支，这是正常现象；');
    console.log('   - 等前端代码提交到该分支后，再运行本向导即可自动安装依赖和启动项目。\n');
    console.log('本次将跳过依赖安装和启动步骤。');
  } else {
    let pkg;
    try {
      const raw = fs.readFileSync(packageJsonPath, 'utf8');
      pkg = JSON.parse(raw);
    } catch {
      console.log('⚠️  读取 package.json 失败，将使用默认 npm 命令。');
    }

    await checkNodeVersionWithPackage(pkg);
    const detectedPm = detectPackageManager(targetDir, pkg);
    const { pm, useNpx } = await ensurePackageManagerAvailable(detectedPm);
    const runScript = getRunScript(pkg);
    const pmLabel = useNpx ? `npx ${pm}` : pm;

    if (useNpx) console.log(`   （未检测到 ${pm}，将通过 npx 临时运行，首次可能稍慢）`);

    let installCmd;
    let installArgs;
    if (useNpx) {
      installCmd = 'npx';
      installArgs = pm === 'pnpm' ? ['pnpm', 'install'] : pm === 'yarn' ? ['yarn'] : ['npm', 'install'];
    } else {
      installCmd = pm;
      installArgs = pm === 'pnpm' ? ['install'] : pm === 'yarn' ? [] : ['install'];
    }

    if (answers.installDeps) {
      console.log(`6. 正在安装依赖（使用 ${pmLabel}），时间可能稍长，请耐心等待...`);
      let installOk = false;
      try {
        await runCommand(installCmd, installArgs, { cwd: targetDir });
        installOk = true;
      } catch {
        console.error('\n   依赖安装失败，正在删除 lock 文件和 node_modules 后重试...');
        try {
          const nodeModules = path.join(targetDir, 'node_modules');
          if (fs.existsSync(nodeModules)) fs.rmSync(nodeModules, { recursive: true, force: true });
          for (const lock of ['yarn.lock', 'pnpm-lock.yaml', 'package-lock.json']) {
            const lockPath = path.join(targetDir, lock);
            if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
          }
          console.log('   已删除 node_modules 和 lock 文件，正在重新安装...');
          await runCommand(installCmd, installArgs, { cwd: targetDir });
          installOk = true;
        } catch (retryErr) {
          console.error('\n   重试仍失败 ❌');
          console.error(`   ${retryErr.message || retryErr}\n`);
          throw retryErr;
        }
      }
      if (installOk) console.log('   依赖安装完成 ✅\n');
    } else {
      console.log(`6. 已跳过依赖安装，请后续在项目目录手动执行：${pmLabel} install`);
    }

    if (!runScript) {
      console.log('⚠️  package.json 中未找到可用的启动脚本（dev/start），将跳过自动启动。');
    } else if (answers.startDev) {
      let runCmd;
      let runArgs;
      if (useNpx) {
        runCmd = 'npx';
        runArgs = pm === 'pnpm' ? ['pnpm', 'run', runScript] : pm === 'yarn' ? ['yarn', runScript] : ['npm', 'run', runScript];
      } else {
        runCmd = pm;
        runArgs = pm === 'pnpm' || pm === 'npm' ? ['run', runScript] : [runScript];
      }

      console.log(`7. 正在启动项目（使用 ${pmLabel}，脚本：${runScript}）...`);
      const devPort = getDevPortFromConfig(targetDir);
      const port = devPort || 5173;
      const fallbackOpenUrl = `http://localhost:${port}`;
      await runDevWithUrlCapture(runCmd, runArgs, { cwd: targetDir, fallbackOpenUrl });
    } else {
      const hintCmd =
        useNpx
          ? `npx ${pm} ${pm === 'pnpm' || pm === 'npm' ? 'run ' : ''}${runScript || 'dev'}`
          : pm === 'pnpm'
            ? `pnpm run ${runScript || 'dev'}`
            : pm === 'yarn'
              ? `yarn ${runScript || 'dev'}`
              : `npm run ${runScript || 'dev'}`;
      console.log(`7. 已跳过自动启动，请后续在项目目录手动执行：${hintCmd}`);
    }
  }

  console.log('\n全部步骤执行完毕。');
}

main().catch((err) => {
  console.error('\n向导执行过程中出现错误：');
  console.error(err.message || err);
  process.exit(1);
});
