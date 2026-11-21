export interface SimInodeEntry {
  inode: number;
  type: 'file' | 'dir' | 'symlink' | 'block' | 'char';
  mode: string;
  owner: string;
  group: string;
  links: number;
  mtime: string;
  content: string;
  target?: string;
  major?: number;
  minor?: number;
}

export interface TerminalEnv {
  cwd: string;
  user: string;
  host: string;
  umask: string;
  lastExitCode: number;
  envVars: Record<string, string>;
  inodes: Record<number, SimInodeEntry>;
  paths: Record<string, number>; // absolute path -> inode number
  nextInode: number;
  makeBuilt: boolean;
}

export interface CommandResult {
  output: string;
  exitCode: number;
  clear?: boolean;
  reset?: boolean;
  explanation?: string;
}

function addNode(
  env: TerminalEnv,
  path: string,
  entry: Omit<SimInodeEntry, 'inode' | 'links'>
): number {
  const inode = env.nextInode++;
  env.inodes[inode] = {
    inode,
    links: entry.type === 'dir' ? 2 : 1,
    ...entry,
  };
  env.paths[path] = inode;
  return inode;
}

export function createInitialTerminalEnv(startDir = '/home/juser'): TerminalEnv {
  const env: TerminalEnv = {
    cwd: startDir,
    user: 'juser',
    host: 'linuxlab',
    umask: '0022',
    lastExitCode: 0,
    envVars: {
      USER: 'juser',
      HOME: '/home/juser',
      SHELL: '/bin/bash',
      PATH: '/home/juser/bin:/usr/local/bin:/usr/bin:/bin',
      TERM: 'xterm-256color',
      XDG_SESSION_TYPE: 'wayland',
      DBUS_SESSION_BUS_ADDRESS: 'unix:path=/run/user/1000/bus',
    },
    inodes: {},
    paths: {},
    nextInode: 100001,
    makeBuilt: false,
  };

  const t = 'Oct 12 08:00';
  const dirs = [
    '/',
    '/bin',
    '/boot',
    '/boot/grub',
    '/dev',
    '/etc',
    '/etc/systemd',
    '/etc/systemd/system',
    '/etc/pam.d',
    '/home',
    '/home/juser',
    '/home/juser/project',
    '/home/juser/backup',
    '/proc',
    '/run',
    '/sys',
    '/tmp',
    '/usr',
    '/usr/bin',
    '/var',
    '/var/log',
  ];
  for (const d of dirs) {
    addNode(env, d, {
      type: 'dir',
      mode: d === '/tmp' ? '777' : '755',
      owner: d.startsWith('/home/juser') ? 'juser' : 'root',
      group: d.startsWith('/home/juser') ? 'juser' : 'root',
      mtime: t,
      content: '',
    });
  }

  addNode(env, '/bin/ls', {
    type: 'file',
    mode: '755',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: '[ELF 64-bit LSB pie executable, x86-64]',
  });

  addNode(env, '/dev/sda', {
    type: 'block',
    mode: '660',
    owner: 'root',
    group: 'disk',
    mtime: t,
    content: '',
    major: 8,
    minor: 0,
  });
  addNode(env, '/dev/sda1', {
    type: 'block',
    mode: '660',
    owner: 'root',
    group: 'disk',
    mtime: t,
    content: '',
    major: 8,
    minor: 1,
  });
  addNode(env, '/dev/sr0', {
    type: 'block',
    mode: '660',
    owner: 'root',
    group: 'cdrom',
    mtime: t,
    content: '',
    major: 11,
    minor: 0,
  });
  addNode(env, '/dev/null', {
    type: 'char',
    mode: '666',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: '',
    major: 1,
    minor: 3,
  });
  addNode(env, '/dev/zero', {
    type: 'char',
    mode: '666',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: '',
    major: 1,
    minor: 5,
  });

  addNode(env, '/etc/passwd', {
    type: 'file',
    mode: '644',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: [
      'root:x:0:0:root:/root:/bin/bash',
      'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
      'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
      'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
      'juser:x:1000:1000:Brian Lab User:/home/juser:/bin/bash',
    ].join('\n'),
  });

  addNode(env, '/etc/group', {
    type: 'file',
    mode: '644',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: [
      'root:x:0:',
      'disk:x:6:root',
      'sudo:x:27:juser',
      'juser:x:1000:',
    ].join('\n'),
  });

  addNode(env, '/etc/fstab', {
    type: 'file',
    mode: '644',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: [
      '# <file system>                           <mount>  <type>  <options>          <dump> <pass>',
      'UUID=a9011c2b-1234-4abc-9def-001122334455  /        ext4    errors=remount-ro  0      1',
      'UUID=c7720e11-5678-4def-8abc-667788990011  none     swap    sw                 0      0',
      '/dev/mapper/myvg-mylv1                     /data    ext4    defaults           0      2',
    ].join('\n'),
  });

  addNode(env, '/etc/hosts', {
    type: 'file',
    mode: '644',
    owner: 'root',
    group: 'root',
    mtime: t,
    content: '127.0.0.1   localhost\n10.23.2.4   linuxlab.local linuxlab\n10.23.2.1   router.local',
  });

  addNode(env, '/proc/cmdline', {
    type: 'file',
    mode: '444',
    owner: 'root',
    group: 'root',
    mtime: t,
    content:
      'BOOT_IMAGE=/boot/vmlinuz-5.15.0-91-generic root=UUID=a9011c2b-1234-4abc-9def-001122334455 ro quiet',
  });

  addNode(env, '/home/juser/.bash_profile', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: [
      '# ~/.bash_profile: executed by bash for login shells.',
      '[ -f ~/.bashrc ] && . ~/.bashrc',
    ].join('\n'),
  });

  addNode(env, '/home/juser/.bashrc', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: [
      '# ~/.bashrc: executed by bash for non-login interactive shells.',
      'case $- in *i*) ;; *) return ;; esac',
      'export PATH="$HOME/bin:/usr/local/bin:$PATH"',
      "alias ll='ls -la'",
    ].join('\n'),
  });

  addNode(env, '/home/juser/notes.txt', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: [
      'How Linux Works — Personal Lab Notes',
      'Chapter 1: Hardware -> Kernel -> User Space',
      'Chapter 2: Permissions r=4 w=2 x=1',
      'Chapter 4: Directories map filenames to inodes',
    ].join('\n'),
  });

  addNode(env, '/home/juser/project/Makefile', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: [
      'CC = gcc',
      'CFLAGS = -Wall -O2',
      'OBJS = main.o aux.o',
      '',
      'myprog: $(OBJS)',
      '\t$(CC) -o myprog $(OBJS)',
      '',
      'clean:',
      '\trm -f $(OBJS) myprog',
    ].join('\n'),
  });

  addNode(env, '/home/juser/project/main.c', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: '#include <stdio.h>\nvoid helper(void);\nint main(void) { helper(); return 0; }',
  });

  addNode(env, '/home/juser/project/aux.c', {
    type: 'file',
    mode: '644',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: '#include <stdio.h>\nvoid helper(void) { printf("How Linux Works!\\n"); }',
  });

  addNode(env, '/home/juser/project/configure', {
    type: 'file',
    mode: '755',
    owner: 'juser',
    group: 'juser',
    mtime: t,
    content: '#!/bin/sh\necho "checking for gcc... /usr/bin/gcc"\necho "configure: creating ./Makefile (prefix=/usr/local)"',
  });

  if (!env.paths[env.cwd]) {
    env.cwd = '/home/juser';
  }
  return env;
}

export function resolvePath(cwd: string, input: string, home = '/home/juser'): string {
  if (!input || input === '~') return home;
  let raw = input.startsWith('~/') ? `${home}/${input.slice(2)}` : input;
  if (!raw.startsWith('/')) {
    raw = cwd === '/' ? `/${raw}` : `${cwd}/${raw}`;
  }
  const parts = raw.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return '/' + stack.join('/');
}

function parentDirOf(absPath: string): string {
  const idx = absPath.lastIndexOf('/');
  return idx <= 0 ? '/' : absPath.slice(0, idx);
}

/**
 * Dereferences symbolic links up to 8 hops, returning the target inode or null if dangling/looping.
 */
function resolveFollowingSymlinks(
  env: TerminalEnv,
  absPath: string
): { resolvedPath: string; entry: SimInodeEntry } | { error: 'ENOENT' | 'ELOOP' } {
  let currentPath = absPath;
  for (let depth = 0; depth < 8; depth++) {
    const ino = env.paths[currentPath];
    if (!ino || !env.inodes[ino]) return { error: 'ENOENT' };
    const entry = env.inodes[ino];
    if (entry.type !== 'symlink' || !entry.target) {
      return { resolvedPath: currentPath, entry };
    }
    const baseDir = parentDirOf(currentPath);
    currentPath = resolvePath(baseDir, entry.target, env.envVars.HOME);
  }
  return { error: 'ELOOP' };
}

function modeToString(entry: SimInodeEntry): string {
  const prefix =
    entry.type === 'dir'
      ? 'd'
      : entry.type === 'symlink'
        ? 'l'
        : entry.type === 'block'
          ? 'b'
          : entry.type === 'char'
            ? 'c'
            : '-';
  const digits = entry.mode.padStart(3, '0').slice(-3);
  const map = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
  return (
    prefix +
    digits
      .split('')
      .map((d) => map[parseInt(d, 10) || 0])
      .join('')
  );
}

function applySymbolicChmod(currentOctal: string, spec: string): string | null {
  let u = parseInt(currentOctal.padStart(3, '0')[0], 8) || 0;
  let g = parseInt(currentOctal.padStart(3, '0')[1], 8) || 0;
  let o = parseInt(currentOctal.padStart(3, '0')[2], 8) || 0;

  const clauses = spec.split(',');
  for (const clause of clauses) {
    const m = clause.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
    if (!m) return null;
    const who = m[1] || 'a';
    const op = m[2];
    const permsStr = m[3];

    let bits = 0;
    if (permsStr.includes('r')) bits |= 4;
    if (permsStr.includes('w')) bits |= 2;
    if (permsStr.includes('x')) bits |= 1;

    const update = (cur: number) =>
      op === '+' ? cur | bits : op === '-' ? cur & ~bits : bits;

    if (who.includes('a') || who.includes('u')) u = update(u);
    if (who.includes('a') || who.includes('g')) g = update(g);
    if (who.includes('a') || who.includes('o')) o = update(o);
  }
  return `${u.toString(8)}${g.toString(8)}${o.toString(8)}`;
}

function listChildren(env: TerminalEnv, dirPath: string): string[] {
  const prefix = dirPath === '/' ? '/' : `${dirPath}/`;
  const names = new Set<string>();
  for (const p of Object.keys(env.paths)) {
    if (p === dirPath || !p.startsWith(prefix)) continue;
    const rest = p.slice(prefix.length);
    if (!rest.includes('/')) {
      names.add(rest);
    }
  }
  return Array.from(names).sort();
}

/**
 * Splits a shell command line by a delimiter (e.g. '&&' or '|') while respecting single & double quotes.
 */
function splitOutsideQuotes(input: string, delimiter: '&&' | '|'): string[] {
  const parts: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (!inSingle && !inDouble) {
      if (delimiter === '&&' && ch === '&' && input[i + 1] === '&') {
        parts.push(current.trim());
        current = '';
        i += 1;
        continue;
      }
      if (delimiter === '|' && ch === '|' && input[i + 1] !== '|' && input[i - 1] !== '|') {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current.trim().length > 0) parts.push(current.trim());
  return parts;
}

/**
 * Extracts trailing > or >> output redirection outside of quotes.
 */
function parseRedirectionOutsideQuotes(segment: string): {
  cmdPart: string;
  redirectTarget: string | null;
  redirectAppend: boolean;
} {
  let inSingle = false;
  let inDouble = false;
  let redirIdx = -1;
  let append = false;

  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    else if (ch === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble && ch === '>') {
      // ignore 2>&1 style fd duplications
      if (segment[i + 1] === '&') continue;
      redirIdx = i;
      append = segment[i + 1] === '>';
      break;
    }
  }

  if (redirIdx === -1) {
    return { cmdPart: segment, redirectTarget: null, redirectAppend: false };
  }

  const cmdPart = segment.slice(0, redirIdx).trim();
  const targetRaw = segment.slice(redirIdx + (append ? 2 : 1)).trim();
  const redirectTarget = targetRaw.split(/\s+/)[0] || null;
  return { cmdPart, redirectTarget, redirectAppend: append };
}

function tokenizeCommand(line: string, env: TerminalEnv): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }
    if (ch === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && /\s/.test(ch)) {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    if (ch === '$' && !inSingle) {
      const rest = line.slice(i + 1);
      if (rest.startsWith('?')) {
        current += String(env.lastExitCode);
        i += 1;
        continue;
      }
      const match = rest.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      if (match) {
        current += env.envVars[match[1]] ?? '';
        i += match[1].length;
        continue;
      }
    }
    current += ch;
  }
  if (current.length > 0) tokens.push(current);
  return tokens;
}

function runSingleCommand(
  rawCmd: string,
  env: TerminalEnv,
  stdinText: string,
  isPipedOut: boolean
): CommandResult {
  const tokens = tokenizeCommand(rawCmd.trim(), env);
  if (tokens.length === 0) return { output: '', exitCode: 0 };

  const cmd = tokens[0];
  const args = tokens.slice(1);

  if (cmd === 'clear') return { output: '', exitCode: 0, clear: true };
  if (cmd === 'reset') return { output: 'Simulated environment reset to defaults.', exitCode: 0, reset: true };

  if (cmd === 'help') {
    return {
      exitCode: 0,
      output: [
        'Simulated Linux Learning Lab — Supported Commands:',
        '  Files & Dirs:   ls [-la|-li], cd, pwd, cat, echo, touch, mkdir, cp, mv, rm [-r], chmod, umask, ln [-s], file, stat, find, diff, head, tail, grep [-E|-i|-n|-c], sort, wc, man',
        '  Devices & Disk: lsscsi, udevadm, blkid, df, free, pvs, vgs, lvs, dd',
        '  Boot & System:  uname, dmesg, systemctl, journalctl, crontab, uptime, vmstat, ps, lsof, strace, env',
        '  Network & Dev:  ip [addr|route|neigh], ping, host, iptables, ss, netstat, rsync, ldd, make, ./configure, docker',
        '  Shell Controls: pipes (|), &&, redirection (>, >>), single/double quotes, $VAR, $?, clear, reset',
      ].join('\n'),
    };
  }

  if (cmd === 'pwd') {
    return { output: env.cwd, exitCode: 0, explanation: 'Prints the current working directory.' };
  }

  if (cmd === 'whoami') {
    return { output: env.user, exitCode: 0 };
  }

  if (cmd === 'id') {
    return { output: 'uid=1000(juser) gid=1000(juser) groups=1000(juser),27(sudo)', exitCode: 0 };
  }

  if (cmd === 'umask') {
    if (args.length === 0) {
      return { output: env.umask, exitCode: 0, explanation: 'Displays the shell file-creation permission mask.' };
    }
    if (/^[0-7]{3,4}$/.test(args[0])) {
      env.umask = args[0].padStart(4, '0');
      return { output: '', exitCode: 0, explanation: `Updated shell umask to ${env.umask}.` };
    }
    return { output: `bash: umask: ${args[0]}: octal number out of range`, exitCode: 1 };
  }

  if (cmd === 'man') {
    const topic = args[args.length - 1];
    if (!topic) return { output: 'What manual page do you want? (e.g. man 5 passwd)', exitCode: 1 };
    const section = args.length >= 2 ? args[0] : '1';
    const summaries: Record<string, string> = {
      passwd:
        section === '5'
          ? 'PASSWD(5) — File Formats\n/etc/passwd stores 7 colon-separated user account fields: name:x:UID:GID:GECOS:home:shell.'
          : 'PASSWD(1) — User Commands\npasswd changes user account passwords stored in /etc/shadow.',
      fstab: 'FSTAB(5) — File Formats\nStatic filesystem mount table: <fs/UUID> <mount> <type> <options> <dump> <pass>.',
      chmod: 'CHMOD(1) — User Commands\nChange file mode bits using octal (e.g. 755) or symbolic (e.g. u+x,go-w) notation.',
      rsync: 'RSYNC(1) — User Commands\nFast incremental file transfer; trailing slash on source copies directory contents only.',
    };
    return {
      exitCode: 0,
      output:
        summaries[topic] ||
        `${topic.toUpperCase()}(${section}) — Simulated manual summary. Check Table 2-2 in Chapter 2 for all 8 man sections.`,
    };
  }

  if (cmd === 'uname') {
    const all = args.includes('-a');
    return {
      output: all
        ? 'Linux linuxlab 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux'
        : args.includes('-r')
          ? '5.15.0-91-generic'
          : 'Linux',
      exitCode: 0,
      explanation: 'Displays kernel information returned by the uname() system call.',
    };
  }

  if (cmd === 'echo') {
    return { output: args.join(' '), exitCode: 0 };
  }

  if (cmd === 'env' || cmd === 'printenv') {
    return {
      output: Object.entries(env.envVars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n'),
      exitCode: 0,
    };
  }

  if (cmd === 'cd') {
    const target = resolvePath(env.cwd, args[0] || '~', env.envVars.HOME);
    const resolved = resolveFollowingSymlinks(env, target);
    if ('error' in resolved) {
      return { output: `bash: cd: ${args[0]}: No such file or directory`, exitCode: 1 };
    }
    if (resolved.entry.type !== 'dir') {
      return { output: `bash: cd: ${args[0]}: Not a directory`, exitCode: 1 };
    }
    env.cwd = resolved.resolvedPath;
    return { output: '', exitCode: 0 };
  }

  if (cmd === 'ls') {
    let showLong = false;
    let showAll = false;
    let showInode = false;
    const targets: string[] = [];
    for (const a of args) {
      if (a.startsWith('-')) {
        if (a.includes('l')) showLong = true;
        if (a.includes('a')) showAll = true;
        if (a.includes('i')) showInode = true;
      } else {
        targets.push(a);
      }
    }

    const formatLine = (name: string, entry: SimInodeEntry) => {
      const inoPrefix = showInode ? `${entry.inode} ` : '';
      if (!showLong) return `${inoPrefix}${name}`;
      const sizeOrDev =
        entry.type === 'block' || entry.type === 'char'
          ? `${String(entry.major ?? 0).padStart(2)}, ${String(entry.minor ?? 0).padStart(3)}`
          : String(entry.content.length).padStart(6);
      const suffix = entry.type === 'symlink' && entry.target ? ` -> ${entry.target}` : '';
      return `${inoPrefix}${modeToString(entry)} ${String(entry.links).padStart(2)} ${entry.owner.padEnd(6)} ${entry.group.padEnd(6)} ${sizeOrDev} ${entry.mtime} ${name}${suffix}`;
    };

    if (targets.length === 0) targets.push(env.cwd);
    const lines: string[] = [];
    let exitCode = 0;

    for (const t of targets) {
      const resolved = resolvePath(env.cwd, t, env.envVars.HOME);
      const ino = env.paths[resolved];
      if (!ino || !env.inodes[ino]) {
        lines.push(`ls: cannot access '${t}': No such file or directory`);
        exitCode = 2;
        continue;
      }
      const entry = env.inodes[ino];
      if (entry.type === 'dir') {
        const children = listChildren(env, resolved).filter((c) => showAll || !c.startsWith('.'));
        if (showAll && showLong) {
          lines.push(formatLine('.', entry));
        }
        if (showLong) {
          for (const c of children) {
            const childPath = resolved === '/' ? `/${c}` : `${resolved}/${c}`;
            const childEntry = env.inodes[env.paths[childPath]];
            if (childEntry) lines.push(formatLine(c, childEntry));
          }
        } else {
          const items = children.map((c) => {
            const childPath = resolved === '/' ? `/${c}` : `${resolved}/${c}`;
            const ce = env.inodes[env.paths[childPath]];
            return showInode && ce ? `${ce.inode} ${c}` : c;
          });
          // Match real GNU ls: one item per line when piped, spaced columns on TTY
          lines.push(items.join(isPipedOut ? '\n' : '  '));
        }
      } else {
        lines.push(formatLine(t, entry));
      }
    }
    return { output: lines.join('\n'), exitCode };
  }

  if (cmd === 'cat') {
    if (args.length === 0) return { output: stdinText, exitCode: 0 };
    const out: string[] = [];
    let exitCode = 0;
    for (const f of args) {
      const p = resolvePath(env.cwd, f, env.envVars.HOME);
      const resolved = resolveFollowingSymlinks(env, p);
      if ('error' in resolved) {
        out.push(
          resolved.error === 'ELOOP'
            ? `cat: ${f}: Too many levels of symbolic links`
            : `cat: ${f}: No such file or directory`
        );
        exitCode = 1;
        continue;
      }
      if (resolved.entry.type === 'dir') {
        out.push(`cat: ${f}: Is a directory`);
        exitCode = 1;
        continue;
      }
      out.push(resolved.entry.content);
    }
    return { output: out.join('\n'), exitCode };
  }

  if (cmd === 'touch') {
    if (args.length === 0) return { output: 'touch: missing file operand', exitCode: 1 };
    const mask = parseInt(env.umask, 8);
    const defaultMode = (0o666 & ~mask).toString(8).padStart(3, '0');
    for (const f of args) {
      const p = resolvePath(env.cwd, f, env.envVars.HOME);
      if (!env.paths[p]) {
        addNode(env, p, {
          type: 'file',
          mode: defaultMode,
          owner: env.user,
          group: env.user,
          mtime: 'Oct 12 09:30',
          content: '',
        });
      }
    }
    return { output: '', exitCode: 0 };
  }

  if (cmd === 'mkdir') {
    const dirArg = args.find((a) => !a.startsWith('-'));
    if (!dirArg) return { output: 'mkdir: missing operand', exitCode: 1 };
    const p = resolvePath(env.cwd, dirArg, env.envVars.HOME);
    if (env.paths[p]) return { output: `mkdir: cannot create directory '${dirArg}': File exists`, exitCode: 1 };
    const mask = parseInt(env.umask, 8);
    const defaultDirMode = (0o777 & ~mask).toString(8).padStart(3, '0');
    addNode(env, p, {
      type: 'dir',
      mode: defaultDirMode,
      owner: env.user,
      group: env.user,
      mtime: 'Oct 12 09:30',
      content: '',
    });
    return { output: '', exitCode: 0 };
  }

  if (cmd === 'cp') {
    const nonFlags = args.filter((a) => !a.startsWith('-'));
    if (nonFlags.length < 2) return { output: 'cp: missing destination file operand', exitCode: 1 };
    const [srcArg, dstArg] = nonFlags;
    const srcAbs = resolvePath(env.cwd, srcArg, env.envVars.HOME);
    const resolved = resolveFollowingSymlinks(env, srcAbs);
    if ('error' in resolved) {
      return { output: `cp: cannot stat '${srcArg}': No such file or directory`, exitCode: 1 };
    }
    if (resolved.entry.type === 'dir') {
      return { output: `cp: -r not specified; omitting directory '${srcArg}'`, exitCode: 1 };
    }
    let dstAbs = resolvePath(env.cwd, dstArg, env.envVars.HOME);
    const existingDstIno = env.paths[dstAbs];
    if (existingDstIno && env.inodes[existingDstIno]?.type === 'dir') {
      const base = srcAbs.split('/').pop() || 'copy';
      dstAbs = dstAbs === '/' ? `/${base}` : `${dstAbs}/${base}`;
    }
    addNode(env, dstAbs, {
      type: 'file',
      mode: resolved.entry.mode,
      owner: env.user,
      group: env.user,
      mtime: 'Oct 12 09:32',
      content: resolved.entry.content,
    });
    return {
      output: '',
      exitCode: 0,
      explanation: `Copied ${srcArg} to a new inode at ${dstArg}.`,
    };
  }

  if (cmd === 'mv') {
    const nonFlags = args.filter((a) => !a.startsWith('-'));
    if (nonFlags.length < 2) return { output: 'mv: missing destination file operand', exitCode: 1 };
    const [srcArg, dstArg] = nonFlags;
    const srcAbs = resolvePath(env.cwd, srcArg, env.envVars.HOME);
    const srcIno = env.paths[srcAbs];
    if (!srcIno || !env.inodes[srcIno]) {
      return { output: `mv: cannot stat '${srcArg}': No such file or directory`, exitCode: 1 };
    }
    if (srcAbs === '/') return { output: "mv: cannot move '/'", exitCode: 1 };
    let dstAbs = resolvePath(env.cwd, dstArg, env.envVars.HOME);
    const existingDstIno = env.paths[dstAbs];
    if (existingDstIno && env.inodes[existingDstIno]?.type === 'dir') {
      const base = srcAbs.split('/').pop() || 'file';
      dstAbs = dstAbs === '/' ? `/${base}` : `${dstAbs}/${base}`;
    }
    // Same-filesystem rename preserves exact inode!
    delete env.paths[srcAbs];
    env.paths[dstAbs] = srcIno;
    return {
      output: '',
      exitCode: 0,
      explanation: `Renamed ${srcArg} -> ${dstArg} (same filesystem: inode #${srcIno} preserved without copying data blocks).`,
    };
  }

  if (cmd === 'dd') {
    const kv: Record<string, string> = {};
    for (const a of args) {
      const idx = a.indexOf('=');
      if (idx > 0) kv[a.slice(0, idx)] = a.slice(idx + 1);
    }
    const ifPath = kv.if;
    const ofPath = kv.of;
    const count = Math.max(1, Math.min(64, parseInt(kv.count || '1', 10) || 1));
    const bsRaw = kv.bs || '512';
    const mult = bsRaw.toUpperCase().endsWith('M')
      ? 1048576
      : bsRaw.toUpperCase().endsWith('K')
        ? 1024
        : 1;
    const bsNum = (parseInt(bsRaw, 10) || 512) * mult;
    const totalBytes = bsNum * count;

    if (!ifPath || !ofPath) {
      return { output: 'dd: usage: dd if=<source> of=<target> [bs=1M] [count=2]', exitCode: 1 };
    }
    if (ofPath.startsWith('/dev/sd')) {
      return {
        output: `dd: safety block in simulator — writing raw bytes to ${ofPath} would overwrite the disk partition table! Try of=/tmp/blank.img instead.`,
        exitCode: 1,
      };
    }
    const outAbs = resolvePath(env.cwd, ofPath, env.envVars.HOME);
    addNode(env, outAbs, {
      type: 'file',
      mode: '644',
      owner: env.user,
      group: env.user,
      mtime: 'Oct 12 09:33',
      content: `[Simulated dd raw image: ${totalBytes} bytes copied from ${ifPath}]`,
    });
    return {
      exitCode: 0,
      output: `${count}+0 records in\n${count}+0 records out\n${totalBytes} bytes copied`,
      explanation: `dd copied ${count} raw block(s) of ${bsRaw} directly from ${ifPath} to ${ofPath}.`,
    };
  }

  if (cmd === 'chmod') {
    if (args.length < 2) return { output: 'chmod: missing operand (usage: chmod 600 file or chmod g+w file)', exitCode: 1 };
    const [modeArg, fileArg] = args;
    const p = resolvePath(env.cwd, fileArg, env.envVars.HOME);
    const resolved = resolveFollowingSymlinks(env, p);
    if ('error' in resolved) {
      return { output: `chmod: cannot access '${fileArg}': No such file or directory`, exitCode: 1 };
    }
    if (/^[0-7]{3,4}$/.test(modeArg)) {
      resolved.entry.mode = modeArg.slice(-3);
      return { output: '', exitCode: 0, explanation: `Updated ${fileArg} mode to ${modeArg} (${modeToString(resolved.entry)}).` };
    }
    const nextOctal = applySymbolicChmod(resolved.entry.mode, modeArg);
    if (nextOctal) {
      resolved.entry.mode = nextOctal;
      return { output: '', exitCode: 0, explanation: `Applied symbolic mode '${modeArg}' -> ${nextOctal} (${modeToString(resolved.entry)}).` };
    }
    return { output: `chmod: invalid mode: '${modeArg}'`, exitCode: 1 };
  }

  if (cmd === 'ln') {
    const isSym = args.includes('-s');
    const paths = args.filter((a) => !a.startsWith('-'));
    if (paths.length < 2) return { output: 'ln: missing file operand (usage: ln [-s] target linkname)', exitCode: 1 };
    const [targetArg, linkArg] = paths;
    const srcPath = resolvePath(env.cwd, targetArg, env.envVars.HOME);
    const dstPath = resolvePath(env.cwd, linkArg, env.envVars.HOME);
    if (env.paths[dstPath]) return { output: `ln: failed to create link '${linkArg}': File exists`, exitCode: 1 };

    if (isSym) {
      addNode(env, dstPath, {
        type: 'symlink',
        mode: '777',
        owner: env.user,
        group: env.user,
        mtime: 'Oct 12 09:30',
        content: '',
        target: targetArg,
      });
      return { output: '', exitCode: 0, explanation: `Created symbolic link ${linkArg} -> ${targetArg}.` };
    }

    const srcIno = env.paths[srcPath];
    if (!srcIno || !env.inodes[srcIno]) {
      return { output: `ln: failed to access '${targetArg}': No such file or directory`, exitCode: 1 };
    }
    if (env.inodes[srcIno].type === 'dir') {
      return { output: `ln: '${targetArg}': hard link not allowed for directory`, exitCode: 1 };
    }
    env.paths[dstPath] = srcIno;
    env.inodes[srcIno].links += 1;
    return {
      output: '',
      exitCode: 0,
      explanation: `Created hard link ${linkArg} sharing inode ${srcIno} (link count now ${env.inodes[srcIno].links}).`,
    };
  }

  if (cmd === 'rm') {
    const recursive = args.some((a) => a.startsWith('-') && (a.includes('r') || a.includes('R')));
    const targets = args.filter((a) => !a.startsWith('-'));
    if (targets.length === 0) return { output: 'rm: missing operand', exitCode: 1 };
    for (const t of targets) {
      const p = resolvePath(env.cwd, t, env.envVars.HOME);
      if (p === '/') {
        return { output: "rm: it is dangerous to operate recursively on '/' (refused)", exitCode: 1 };
      }
      const ino = env.paths[p];
      if (!ino || !env.inodes[ino]) {
        return { output: `rm: cannot remove '${t}': No such file or directory`, exitCode: 1 };
      }
      if (env.inodes[ino].type === 'dir' && !recursive) {
        return { output: `rm: cannot remove '${t}': Is a directory`, exitCode: 1 };
      }
      if (env.inodes[ino].type === 'dir' && recursive) {
        const prefix = `${p}/`;
        for (const key of Object.keys(env.paths)) {
          if (key === p || key.startsWith(prefix)) {
            const kIno = env.paths[key];
            delete env.paths[key];
            if (env.inodes[kIno]) {
              env.inodes[kIno].links = Math.max(0, env.inodes[kIno].links - 1);
              if (env.inodes[kIno].links === 0) delete env.inodes[kIno];
            }
          }
        }
      } else {
        delete env.paths[p];
        env.inodes[ino].links = Math.max(0, env.inodes[ino].links - 1);
        if (env.inodes[ino].links === 0) {
          delete env.inodes[ino];
        }
      }
    }
    return { output: '', exitCode: 0 };
  }

  if (cmd === 'find') {
    const rootArg = args[0] && !args[0].startsWith('-') ? args[0] : '.';
    const rootAbs = resolvePath(env.cwd, rootArg, env.envVars.HOME);
    const nameIdx = args.indexOf('-name');
    const namePat = nameIdx !== -1 ? args[nameIdx + 1] : null;
    const globRegex = namePat
      ? new RegExp('^' + namePat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
      : null;

    const matches = Object.keys(env.paths)
      .filter((p) => p === rootAbs || p.startsWith(rootAbs === '/' ? '/' : `${rootAbs}/`))
      .filter((p) => (!globRegex ? true : globRegex.test(p.split('/').pop() || '')))
      .sort();
    return { output: matches.join('\n'), exitCode: 0 };
  }

  if (cmd === 'diff') {
    const nonFlags = args.filter((a) => !a.startsWith('-'));
    if (nonFlags.length < 2) return { output: 'diff: missing operand (usage: diff file1 file2)', exitCode: 2 };
    const r1 = resolveFollowingSymlinks(env, resolvePath(env.cwd, nonFlags[0], env.envVars.HOME));
    const r2 = resolveFollowingSymlinks(env, resolvePath(env.cwd, nonFlags[1], env.envVars.HOME));
    if ('error' in r1 || 'error' in r2) {
      return { output: 'diff: No such file or directory', exitCode: 2 };
    }
    if (r1.entry.content === r2.entry.content) return { output: '', exitCode: 0 };
    const l1 = r1.entry.content.split('\n');
    const l2 = r2.entry.content.split('\n');
    const out = [`--- ${nonFlags[0]}`, `+++ ${nonFlags[1]}`];
    const maxLen = Math.max(l1.length, l2.length);
    for (let i = 0; i < maxLen; i++) {
      if (l1[i] !== l2[i]) {
        if (l1[i] !== undefined) out.push(`-${l1[i]}`);
        if (l2[i] !== undefined) out.push(`+${l2[i]}`);
      }
    }
    return { output: out.join('\n'), exitCode: 1 };
  }

  if (cmd === 'grep') {
    const flags = args.filter((a) => a.startsWith('-'));
    const rest = args.filter((a) => !a.startsWith('-'));
    if (rest.length === 0) return { output: 'Usage: grep [OPTION]... PATTERN [FILE]...', exitCode: 2 };
    const pattern = rest[0];
    const ignoreCase = flags.some((f) => f.includes('i'));
    const showLineNum = flags.some((f) => f.includes('n'));
    const countOnly = flags.some((f) => f.includes('c'));
    let source = stdinText;
    if (rest.length >= 2) {
      const p = resolvePath(env.cwd, rest[1], env.envVars.HOME);
      const resolved = resolveFollowingSymlinks(env, p);
      if ('error' in resolved) {
        return { output: `grep: ${rest[1]}: No such file or directory`, exitCode: 2 };
      }
      source = resolved.entry.content;
    }
    let regex: RegExp;
    try {
      regex = new RegExp(pattern, ignoreCase ? 'i' : '');
    } catch {
      return { output: `grep: invalid pattern '${pattern}'`, exitCode: 2 };
    }
    const matched = source
      .split('\n')
      .map((line, idx) => ({ line, idx: idx + 1 }))
      .filter(({ line }) => regex.test(line));
    if (countOnly) {
      return { output: String(matched.length), exitCode: matched.length > 0 ? 0 : 1 };
    }
    return {
      output: matched.map(({ line, idx }) => (showLineNum ? `${idx}:${line}` : line)).join('\n'),
      exitCode: matched.length > 0 ? 0 : 1,
    };
  }

  if (cmd === 'head' || cmd === 'tail') {
    let n = 10;
    const nIdx = args.indexOf('-n');
    if (nIdx !== -1 && args[nIdx + 1]) n = parseInt(args[nIdx + 1], 10) || 10;
    const fileArg = args.find((a, idx) => !a.startsWith('-') && idx !== nIdx + 1);
    let text = stdinText;
    if (fileArg) {
      const p = resolvePath(env.cwd, fileArg, env.envVars.HOME);
      const resolved = resolveFollowingSymlinks(env, p);
      if ('error' in resolved) {
        return { output: `${cmd}: cannot open '${fileArg}': No such file or directory`, exitCode: 1 };
      }
      text = resolved.entry.content;
    }
    const lines = text.split('\n');
    const slice = cmd === 'head' ? lines.slice(0, n) : lines.slice(-n);
    return { output: slice.join('\n'), exitCode: 0 };
  }

  if (cmd === 'sort') {
    const lines = stdinText ? stdinText.split('\n') : [];
    return { output: [...lines].sort().join('\n'), exitCode: 0 };
  }

  if (cmd === 'wc') {
    const text = stdinText;
    const lines = text ? text.split('\n').length : 0;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { output: `  ${lines}  ${words}  ${text.length}`, exitCode: 0 };
  }

  if (cmd === 'file') {
    const f = args[0];
    if (!f) return { output: 'Usage: file <path>', exitCode: 1 };
    const p = resolvePath(env.cwd, f, env.envVars.HOME);
    const ino = env.paths[p];
    if (!ino || !env.inodes[ino]) return { output: `${f}: cannot open (No such file or directory)`, exitCode: 1 };
    const e = env.inodes[ino];
    if (e.type === 'symlink') return { output: `${f}: symbolic link to ${e.target}`, exitCode: 0 };
    if (e.type === 'dir') return { output: `${f}: directory`, exitCode: 0 };
    if (e.type === 'block') return { output: `${f}: block special (${e.major}/${e.minor})`, exitCode: 0 };
    if (e.type === 'char') return { output: `${f}: character special (${e.major}/${e.minor})`, exitCode: 0 };
    if (e.content.startsWith('[ELF')) return { output: `${f}: ELF 64-bit LSB pie executable, x86-64, dynamically linked`, exitCode: 0 };
    return { output: `${f}: ASCII text`, exitCode: 0 };
  }

  if (cmd === 'stat') {
    const f = args[0];
    if (!f) return { output: 'stat: missing operand', exitCode: 1 };
    const p = resolvePath(env.cwd, f, env.envVars.HOME);
    const ino = env.paths[p];
    if (!ino || !env.inodes[ino]) return { output: `stat: cannot stat '${f}': No such file or directory`, exitCode: 1 };
    const e = env.inodes[ino];
    return {
      exitCode: 0,
      output: `  File: ${f}${e.type === 'symlink' && e.target ? ` -> ${e.target}` : ''}\n  Size: ${e.content.length}\tType: ${e.type}\nInode: ${e.inode}\tLinks: ${e.links}\nAccess: (0${e.mode}/${modeToString(e)})  Uid: (${e.owner})  Gid: (${e.group})`,
    };
  }

  if (cmd === './configure') {
    const prefixArg = args.find((a) => a.startsWith('--prefix=')) || '--prefix=/usr/local';
    return {
      exitCode: 0,
      output: [
        'checking for gcc... /usr/bin/gcc',
        'checking whether the C compiler works... yes',
        'checking for stdio.h... yes',
        `configure: creating ./config.status (${prefixArg})`,
        'config.status: creating Makefile',
      ].join('\n'),
      explanation: `GNU Autoconf probed the toolchain and generated a Makefile targeting ${prefixArg}.`,
    };
  }

  if (cmd === 'ps') {
    return {
      exitCode: 0,
      output: [
        'UID        PID  PPID  C STIME TTY          TIME CMD',
        'root         1     0  0 08:00 ?        00:00:02 /sbin/init',
        'root       312     1  0 08:00 ?        00:00:00 /lib/systemd/systemd-journald',
        'root       488     1  0 08:00 ?        00:00:00 /lib/systemd/systemd-udevd',
        'root       712     1  0 08:00 ?        00:00:00 sshd: /usr/sbin/sshd -D',
        'juser     1420  1418  0 08:04 pts/0    00:00:00 -bash',
        'juser     1588  1420  0 09:30 pts/0    00:00:00 ps ' + args.join(' '),
      ].join('\n'),
    };
  }

  if (cmd === 'lsscsi') {
    return {
      exitCode: 0,
      output: [
        '[0:0:0:0]    disk    ATA      Samsung SSD 860  3B6Q  /dev/sda',
        '[1:0:0:0]    cd/dvd  HL-DT-ST DVDRAM GH24NSC0  LK00  /dev/sr0',
        '[2:0:0:0]    disk    SanDisk  Ultra USB 3.0    1.00  /dev/sdb',
      ].join('\n'),
    };
  }

  if (cmd === 'udevadm') {
    return {
      exitCode: 0,
      output: [
        'P: /devices/pci0000:00/0000:00:1f.2/ata1/host0/target0:0:0/0:0:0:0/block/sda',
        'N: sda',
        'S: disk/by-id/ata-Samsung_SSD_860_EVO_500GB',
        'E: DEVNAME=/dev/sda',
        'E: DEVTYPE=disk',
        'E: MAJOR=8',
        'E: MINOR=0',
      ].join('\n'),
    };
  }

  if (cmd === 'blkid') {
    return {
      exitCode: 0,
      output: [
        '/dev/sda1: UUID="a9011c2b-1234-4abc-9def-001122334455" TYPE="ext4" PARTUUID="11223344-01"',
        '/dev/sda2: UUID="c7720e11-5678-4def-8abc-667788990011" TYPE="swap"',
        '/dev/mapper/myvg-mylv1: UUID="d8831f44-9999-4111-8222-aaabbbcccddd" TYPE="ext4"',
      ].join('\n'),
    };
  }

  if (cmd === 'df') {
    return {
      exitCode: 0,
      output: [
        'Filesystem              Size  Used Avail Use% Mounted on',
        '/dev/sda1                48G   12G   34G  26% /',
        'tmpfs                   7.8G  2.4M  7.8G   1% /run',
        '/dev/mapper/myvg-mylv1   20G  4.1G   15G  22% /data',
      ].join('\n'),
    };
  }

  if (cmd === 'pvs') {
    return {
      exitCode: 0,
      output: '  PV         VG   Fmt  Attr PSize  PFree\n  /dev/sdb1  myvg lvm2 a--  20.00g 10.00g\n  /dev/sdc1  myvg lvm2 a--  20.00g 10.00g',
    };
  }

  if (cmd === 'vgs') {
    return {
      exitCode: 0,
      output: '  VG   #PV #LV #SN Attr   VSize  VFree\n  myvg   2   2   0 wz--n- 40.00g 20.00g',
    };
  }

  if (cmd === 'lvs') {
    return {
      exitCode: 0,
      output: '  LV    VG   Attr       LSize\n  mylv1 myvg -wi-ao---- 10.00g\n  mylv2 myvg -wi-ao---- 10.00g',
    };
  }

  if (cmd === 'dmesg') {
    return {
      exitCode: 0,
      output: [
        '[    0.000000] Linux version 5.15.0-91-generic (gcc 11.4.0)',
        '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-91-generic root=UUID=a9011c2b-1234-4abc-9def-001122334455 ro quiet',
        '[    0.421009] scsi host0: ahci',
        '[    0.489212] sd 0:0:0:0: [sda] Attached SCSI disk',
        '[    0.614300] EXT4-fs (sda1): mounted filesystem with ordered data mode.',
        '[    0.640122] systemd[1]: Detected architecture x86-64.',
      ].join('\n'),
    };
  }

  if (cmd === 'systemctl') {
    const sub = args[0];
    const unitMeta: Record<
      string,
      { desc: string; exec: string; pid: number; proc: string; after: string; mem: string }
    > = {
      'ssh.service': {
        desc: 'OpenBSD Secure Shell server',
        exec: '/usr/sbin/sshd -D',
        pid: 712,
        proc: 'sshd',
        after: 'network.target auditd.service',
        mem: '4.8M',
      },
      'cups.service': {
        desc: 'CUPS Scheduler',
        exec: '/usr/sbin/cupsd -l',
        pid: 814,
        proc: 'cupsd',
        after: 'network.target',
        mem: '6.2M',
      },
      'cron.service': {
        desc: 'Regular background program processing daemon',
        exec: '/usr/sbin/cron -f',
        pid: 625,
        proc: 'cron',
        after: 'remote-fs.target nss-user-lookup.target',
        mem: '2.1M',
      },
      'docker.service': {
        desc: 'Docker Application Container Engine',
        exec: '/usr/bin/dockerd -H fd://',
        pid: 942,
        proc: 'dockerd',
        after: 'network-online.target containerd.service',
        mem: '64.5M',
      },
    };
    const normalizeUnit = (u?: string) => {
      if (!u) return 'ssh.service';
      return u.endsWith('.service') ? u : `${u}.service`;
    };
    if (sub === 'status') {
      const unit = normalizeUnit(args[1]);
      const meta = unitMeta[unit] || unitMeta['ssh.service'];
      return {
        exitCode: 0,
        output: [
          `● ${unit} - ${meta.desc}`,
          `     Loaded: loaded (/lib/systemd/system/${unit}; enabled; vendor preset: enabled)`,
          '     Active: active (running) since Mon 08:00:04 UTC; 1h 30min ago',
          `   Main PID: ${meta.pid} (${meta.proc})`,
          '      Tasks: 1 (limit: 4915)',
          `     Memory: ${meta.mem}`,
          `     CGroup: /system.slice/${unit}`,
          `             └─${meta.pid} ${meta.exec}`,
        ].join('\n'),
      };
    }
    if (sub === 'cat') {
      const unit = normalizeUnit(args[1]);
      const meta = unitMeta[unit] || unitMeta['ssh.service'];
      return {
        exitCode: 0,
        output: [
          `# /lib/systemd/system/${unit}`,
          '[Unit]',
          `Description=${meta.desc}`,
          `After=${meta.after}`,
          '[Service]',
          'Type=simple',
          `ExecStart=${meta.exec}`,
          'Restart=on-failure',
          '[Install]',
          'WantedBy=multi-user.target',
        ].join('\n'),
      };
    }
    return {
      exitCode: 0,
      output: [
        'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION',
        'cron.service             loaded active running Regular background program processing daemon',
        'cups.service             loaded active running CUPS Scheduler',
        'docker.service           loaded active running Docker Application Container Engine',
        'ssh.service              loaded active running OpenBSD Secure Shell server',
        'systemd-journald.service loaded active running Journal Service',
        'systemd-udevd.service    loaded active running Rule-based Manager for Device Events and Files',
      ].join('\n'),
    };
  }

  if (cmd === 'journalctl') {
    return {
      exitCode: 0,
      output: [
        'Oct 12 08:00:04 linuxlab systemd[1]: Started OpenBSD Secure Shell server.',
        'Oct 12 08:04:11 linuxlab sshd[1415]: Accepted publickey for juser from 10.23.2.15 port 51204 ssh2',
        'Oct 12 08:04:11 linuxlab sshd[1415]: pam_unix(sshd:session): session opened for user juser(uid=1000)',
        'Oct 12 09:00:01 linuxlab CRON[1510]: (juser) CMD (/usr/local/bin/backup.sh)',
      ].join('\n'),
    };
  }

  if (cmd === 'crontab') {
    if (args.includes('-l')) {
      return {
        exitCode: 0,
        output: '# m h dom mon dow command\n30 2 * * 0 /usr/local/bin/backup.sh\n*/15 * * * * /home/juser/bin/healthcheck.sh',
      };
    }
    return { output: 'Simulated lab tip: use `crontab -l` to inspect scheduled jobs.', exitCode: 0 };
  }

  if (cmd === 'uptime') {
    return { output: ' 09:30:14 up 1:30,  1 user,  load average: 0.18, 0.24, 0.19', exitCode: 0 };
  }

  if (cmd === 'free') {
    return {
      exitCode: 0,
      output: [
        '               total        used        free      shared  buff/cache   available',
        'Mem:            15Gi       3.2Gi       2.1Gi       240Mi       9.8Gi        11Gi',
        'Swap:          2.0Gi          0B       2.0Gi',
      ].join('\n'),
    };
  }

  if (cmd === 'vmstat') {
    return {
      exitCode: 0,
      output: [
        'procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----',
        ' r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st',
        ' 1  0      0 2201400 310200 9981200  0    0     4    12  145  280  6  2 92  0  0',
      ].join('\n'),
    };
  }

  if (cmd === 'lsof') {
    if (args.some((a) => a.includes('-i'))) {
      return {
        exitCode: 0,
        output: [
          'COMMAND  PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
          'sshd     712  root    3u  IPv4  18210      0t0  TCP *:22 (LISTEN)',
          'nginx    905  www     6u  IPv4  21902      0t0  TCP *:80 (LISTEN)',
          'sshd    1415  root    4u  IPv4  29104      0t0  TCP 10.23.2.4:22->10.23.2.15:51204 (ESTABLISHED)',
        ].join('\n'),
      };
    }
    return {
      exitCode: 0,
      output: [
        'COMMAND  PID  USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME',
        'bash    1420 juser  cwd    DIR    8,1     4096 100010 /home/juser',
        'bash    1420 juser    0u   CHR  136,0      0t0      3 /dev/pts/0',
        'sshd     712  root    3u  IPv4  18210      0t0    TCP *:22 (LISTEN)',
      ].join('\n'),
    };
  }

  if (cmd === 'strace') {
    const target = args[0] || 'ls';
    return {
      exitCode: 0,
      output: [
        `execve("/bin/${target}", ["${target}"], 0x7ffd8a2c /* 18 vars */) = 0`,
        'openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3',
        'openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3',
        'openat(AT_FDCWD, ".", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3',
        'write(1, "notes.txt  project  backup\\n", 27) = 27',
        'exit_group(0)                           = ?',
      ].join('\n'),
    };
  }

  if (cmd === 'ip') {
    const sub = args[0] || 'addr';
    if (sub.startsWith('r')) {
      return {
        exitCode: 0,
        output: [
          'default via 10.23.2.1 dev eth0 proto dhcp metric 100',
          '10.23.2.0/24 dev eth0 proto kernel scope link src 10.23.2.4',
          '172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1',
        ].join('\n'),
      };
    }
    if (sub.startsWith('n')) {
      return {
        exitCode: 0,
        output: '10.23.2.1 dev eth0 lladdr 00:1a:2b:3c:4d:5e REACHABLE\n10.23.2.15 dev eth0 lladdr 00:1a:2b:aa:bb:cc STALE',
      };
    }
    return {
      exitCode: 0,
      output: [
        '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN',
        '    inet 127.0.0.1/8 scope host lo',
        '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP',
        '    inet 10.23.2.4/24 brd 10.23.2.255 scope global eth0',
        '3: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP',
        '    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0',
      ].join('\n'),
    };
  }

  if (cmd === 'ping') {
    const dest = args.find((a) => !a.startsWith('-') && !/^\d+$/.test(a)) || '10.23.2.1';
    return {
      exitCode: 0,
      output: [
        `PING ${dest} (${dest}) 56(84) bytes of data.`,
        `64 bytes from ${dest}: icmp_seq=1 ttl=64 time=0.42 ms`,
        `64 bytes from ${dest}: icmp_seq=2 ttl=64 time=0.39 ms`,
        `--- ${dest} ping statistics ---`,
        '2 packets transmitted, 2 received, 0% packet loss',
      ].join('\n'),
    };
  }

  if (cmd === 'host') {
    const name = args[0] || 'example.com';
    return { output: `${name} has address 93.184.216.34\n${name} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946`, exitCode: 0 };
  }

  if (cmd === 'iptables') {
    return {
      exitCode: 0,
      output: [
        'Chain INPUT (policy DROP)',
        'target     prot opt source               destination',
        'ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED',
        'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22',
        'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80',
        '',
        'Chain FORWARD (policy DROP)',
        'ACCEPT     all  --  172.17.0.0/16        0.0.0.0/0',
        '',
        'Chain OUTPUT (policy ACCEPT)',
      ].join('\n'),
    };
  }

  if (cmd === 'ss' || cmd === 'netstat') {
    return {
      exitCode: 0,
      output: [
        'Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process',
        'tcp    LISTEN  0       128            0.0.0.0:22          0.0.0.0:*     users:(("sshd",pid=712,fd=3))',
        'tcp    LISTEN  0       511            0.0.0.0:80          0.0.0.0:*     users:(("nginx",pid=905,fd=6))',
        'udp    UNCONN  0       0           127.0.0.53:53          0.0.0.0:*     users:(("systemd-resolve",pid=510,fd=12))',
      ].join('\n'),
    };
  }

  if (cmd === 'rsync') {
    const dryRun = args.some((a) => a.startsWith('-') && a.includes('n')) || args.includes('--dry-run');
    const nonFlags = args.filter((a) => !a.startsWith('-'));
    const src = nonFlags[0] || 'project/';
    const dst = nonFlags[1] || 'backup/';
    const trailing = src.endsWith('/');
    return {
      exitCode: 0,
      output: [
        'sending incremental file list',
        trailing ? './' : `${src}/`,
        trailing ? 'Makefile' : `${src}/Makefile`,
        trailing ? 'aux.c' : `${src}/aux.c`,
        trailing ? 'main.c' : `${src}/main.c`,
        '',
        `sent 418 bytes  received 82 bytes  1000.00 bytes/sec${dryRun ? ' (DRY RUN)' : ''}`,
      ].join('\n'),
      explanation: trailing
        ? `Trailing slash on '${src}' copies its CONTENTS directly into '${dst}'.`
        : `No trailing slash on '${src}' copies the directory ITSELF into '${dst}/${src}'.`,
    };
  }

  if (cmd === 'ldd') {
    const bin = args[0] || '/bin/ls';
    return {
      exitCode: 0,
      output: [
        `\tlinux-vdso.so.1 (0x00007ffc3b9f0000)`,
        `\tlibselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1`,
        `\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6`,
        `\t/lib64/ld-linux-x86-64.so.2`,
        `# Simulated dynamic dependencies for ${bin}`,
      ].join('\n'),
    };
  }

  if (cmd === 'make') {
    if (args.includes('clean')) {
      env.makeBuilt = false;
      return { output: 'rm -f main.o aux.o myprog', exitCode: 0 };
    }
    if (env.makeBuilt) {
      return { output: "make: 'myprog' is up to date.", exitCode: 0 };
    }
    env.makeBuilt = true;
    return {
      exitCode: 0,
      output: [
        'gcc -Wall -O2 -c main.c -o main.o',
        'gcc -Wall -O2 -c aux.c -o aux.o',
        'gcc -o myprog main.o aux.o',
      ].join('\n'),
    };
  }

  if (cmd === 'docker') {
    if (args[0] === 'ps') {
      return {
        exitCode: 0,
        output: [
          'CONTAINER ID   IMAGE          COMMAND                  STATUS         PORTS                  NAMES',
          '8a41f02b9c11   nginx:alpine   "nginx -g \'daemon..."    Up 2 hours     0.0.0.0:8080->80/tcp   web-edge',
          '3f19c701ab42   redis:7        "docker-entrypoint..."   Up 2 hours     6379/tcp               cache-01',
        ].join('\n'),
      };
    }
    return { output: 'Simulated Docker CLI: try `docker ps` to inspect active containers.', exitCode: 0 };
  }

  return {
    output: `bash: ${cmd}: command not found (type 'help' to see commands supported in this simulated lab)`,
    exitCode: 127,
  };
}

export function executeSimulatedCommand(rawInput: string, env: TerminalEnv): CommandResult {
  const trimmed = rawInput.trim();
  if (!trimmed) return { output: '', exitCode: 0 };

  const chains = splitOutsideQuotes(trimmed, '&&');
  const allOutputs: string[] = [];
  let lastExit = 0;
  let lastExplanation: string | undefined;

  for (const chainSegment of chains) {
    const { cmdPart, redirectTarget, redirectAppend } = parseRedirectionOutsideQuotes(chainSegment);
    const pipeStages = splitOutsideQuotes(cmdPart, '|');
    let currentOutput = '';

    for (let idx = 0; idx < pipeStages.length; idx++) {
      const stage = pipeStages[idx];
      const isPipedOut = idx < pipeStages.length - 1 || redirectTarget !== null;
      const res = runSingleCommand(stage, env, currentOutput, isPipedOut);
      if (res.clear || res.reset) return res;
      currentOutput = res.output;
      lastExit = res.exitCode;
      env.lastExitCode = lastExit;
      if (res.explanation) lastExplanation = res.explanation;
    }

    if (redirectTarget) {
      const targetPath = resolvePath(env.cwd, redirectTarget, env.envVars.HOME);
      const existingIno = env.paths[targetPath];
      if (existingIno && env.inodes[existingIno]) {
        env.inodes[existingIno].content = redirectAppend
          ? `${env.inodes[existingIno].content}\n${currentOutput}`.trim()
          : currentOutput;
      } else {
        addNode(env, targetPath, {
          type: 'file',
          mode: '644',
          owner: env.user,
          group: env.user,
          mtime: 'Oct 12 09:35',
          content: currentOutput,
        });
      }
    } else if (currentOutput) {
      allOutputs.push(currentOutput);
    }

    if (lastExit !== 0) break;
  }

  return {
    output: allOutputs.join('\n'),
    exitCode: lastExit,
    explanation: lastExplanation,
  };
}
