#!/usr/bin/env node
// Usage: node scripts/dev.mjs <primary-app> [other-apps...]
//
// scripts/ports.json에서 앱별 포트를 읽어, 각 자식 프로세스에 PORT env를 주입합니다.
// 첫 번째 인자(primary)의 URL이 응답하면 기본 브라우저로 오픈합니다.
//
// 환경변수:
//   NO_OPEN=1  → 브라우저 자동 오픈 건너뜀 (헤드리스/에이전트용)

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const apps = process.argv.slice(2);
if (apps.length === 0) {
  console.error('Usage: node scripts/dev.mjs <primary-app> [other-apps...]');
  process.exit(1);
}
const primary = apps[0];

const portsPath = resolve(repoRoot, 'scripts/ports.json');
const ports = JSON.parse(await readFile(portsPath, 'utf-8'));

for (const app of apps) {
  if (!(app in ports)) {
    console.error(`[dev.mjs] scripts/ports.json에 "${app}" 포트 정의가 없습니다.`);
    process.exit(1);
  }
}

const COLORS = [36, 35, 33, 32, 34, 31, 96, 95, 93, 92];
function colorFor(name) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

function pipeWithPrefix(stream, target, prefix) {
  let buf = '';
  stream.setEncoding('utf-8');
  stream.on('data', (chunk) => {
    buf += chunk;
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) target.write(`${prefix}${line}\n`);
  });
  stream.on('end', () => {
    if (buf) target.write(`${prefix}${buf}\n`);
  });
}

const children = apps.map((app) => {
  const port = ports[app];
  const color = colorFor(app);
  const prefix = `\x1b[${color}m[${app}]\x1b[0m `;

  const child = spawn('pnpm', ['--filter', app, 'dev'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port), FORCE_COLOR: '1' },
  });

  pipeWithPrefix(child.stdout, process.stdout, prefix);
  pipeWithPrefix(child.stderr, process.stderr, prefix);

  child.on('exit', (code, signal) => {
    process.stdout.write(`${prefix}exited (code=${code ?? 'null'}, signal=${signal ?? 'null'})\n`);
    if (!shuttingDown) shutdown(code ?? 0);
  });

  return { app, port, child };
});

let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const { child } of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 500).unref();
}
process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

const primaryPort = ports[primary];
const primaryUrl = `http://localhost:${primaryPort}`;

async function waitForServer(url, { timeoutMs = 120_000, intervalMs = 500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (shuttingDown) return false;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch {
      // 연결 거부/타임아웃은 무시하고 재시도
    }
    await sleep(intervalMs);
  }
  return false;
}

function openInBrowser(url) {
  const platform = process.platform;
  let cmd;
  let args;
  if (platform === 'darwin') {
    cmd = 'open';
    args = [url];
  } else if (platform === 'win32') {
    cmd = 'cmd';
    args = ['/c', 'start', '""', url];
  } else {
    cmd = 'xdg-open';
    args = [url];
  }
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
}

if (process.env.NO_OPEN === '1') {
  console.log(`[dev.mjs] NO_OPEN=1 — 자동 오픈 생략 (${primaryUrl})`);
} else {
  console.log(`[dev.mjs] ${primary} 준비 대기 중 → ${primaryUrl}`);
  waitForServer(primaryUrl).then((ok) => {
    if (shuttingDown) return;
    if (ok) {
      console.log(`[dev.mjs] 브라우저 오픈: ${primaryUrl}`);
      openInBrowser(primaryUrl);
    } else {
      console.warn(`[dev.mjs] ${primaryUrl} 응답 없음 (timeout) — 자동 오픈 생략`);
    }
  });
}
