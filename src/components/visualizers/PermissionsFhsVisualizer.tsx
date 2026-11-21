import React, { useState } from 'react';
import { FolderTree, Lock } from 'lucide-react';

interface PermState {
  u: [boolean, boolean, boolean];
  g: [boolean, boolean, boolean];
  o: [boolean, boolean, boolean];
}

const FHS_NODES = [
  { path: '/', role: 'Root Directory', detail: 'Top of the single unified Linux directory hierarchy. Every mounted partition attaches somewhere beneath /.' },
  { path: '/bin', role: 'Essential User Binaries', detail: 'Core user commands (ls, cp, cat, sh) required during early boot and recovery (symlinked to /usr/bin on merged-/usr distros).' },
  { path: '/dev', role: 'Device Nodes', detail: 'Special block and character files managed by devtmpfs/udevd representing disks (/dev/sda), terminals (/dev/tty*), and pseudo-devices (/dev/null).' },
  { path: '/etc', role: 'Host Configuration', detail: 'System-wide text configuration files: /etc/passwd, /etc/fstab, /etc/systemd/system, /etc/ssh/sshd_config.' },
  { path: '/home', role: 'User Home Directories', detail: 'Personal storage and dotfiles (.bashrc, .ssh) for normal non-root user accounts.' },
  { path: '/proc', role: 'Kernel & Process Virtual FS', detail: 'In-memory virtual filesystem exposing live per-PID info (/proc/<pid>), boot parameters (/proc/cmdline), and sysctl tunables.' },
  { path: '/run', role: 'Transient Runtime State', detail: 'tmpfs cleared on every boot holding PID files, daemon sockets, and active lockfiles.' },
  { path: '/sys', role: 'sysfs Device Hierarchy', detail: 'Structured kernel object hierarchy documenting buses, block devices, drivers, and cgroups.' },
  { path: '/usr', role: 'Static User Programs & Data', detail: 'Largest static tree: /usr/bin (most commands), /usr/lib (shared libraries), /usr/share (docs/man pages), /usr/local (locally compiled software).' },
  { path: '/var', role: 'Variable Persistent Data', detail: 'Data that grows or changes during operation: /var/log (logs), /var/spool (cron/print queues), /var/cache, and databases.' },
];

function tripletOctal(t: [boolean, boolean, boolean]): number {
  return (t[0] ? 4 : 0) + (t[1] ? 2 : 0) + (t[2] ? 1 : 0);
}

function tripletSym(t: [boolean, boolean, boolean]): string {
  return `${t[0] ? 'r' : '-'}${t[1] ? 'w' : '-'}${t[2] ? 'x' : '-'}`;
}

export const PermissionsFhsVisualizer: React.FC = () => {
  const [tab, setTab] = useState<'chmod' | 'fhs'>('chmod');
  const [isDir, setIsDir] = useState(false);
  const [perms, setPerms] = useState<PermState>({
    u: [true, true, false],
    g: [true, false, false],
    o: [true, false, false],
  });
  const [umask, setUmask] = useState<'022' | '027' | '077' | '002'>('022');
  const [selectedFhs, setSelectedFhs] = useState(FHS_NODES[3]);

  const toggleBit = (scope: keyof PermState, idx: 0 | 1 | 2) => {
    setPerms((prev) => {
      const copy: [boolean, boolean, boolean] = [...prev[scope]] as [boolean, boolean, boolean];
      copy[idx] = !copy[idx];
      return { ...prev, [scope]: copy };
    });
  };

  const octal = `${tripletOctal(perms.u)}${tripletOctal(perms.g)}${tripletOctal(perms.o)}`;
  const modeStr = `${isDir ? 'd' : '-'}${tripletSym(perms.u)}${tripletSym(perms.g)}${tripletSym(perms.o)}`;

  // umask computation
  const baseOctal = isDir ? 0o777 : 0o666;
  const maskVal = parseInt(umask, 8);
  const resultingOctal = (baseOctal & ~maskVal).toString(8).padStart(3, '0');

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {tab === 'chmod' ? (
            <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <FolderTree className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: File Mode / umask Calculator &amp; FHS Directory Tree
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setTab('chmod')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'chmod'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Permissions &amp; umask
          </button>
          <button
            type="button"
            onClick={() => setTab('fhs')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              tab === 'fhs'
                ? 'bg-sky-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            FHS Hierarchy Explorer
          </button>
        </div>
      </div>

      {tab === 'chmod' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Entry Type:</span>
                <button
                  type="button"
                  onClick={() => setIsDir(false)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer ${
                    !isDir
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Regular File (-)
                </button>
                <button
                  type="button"
                  onClick={() => setIsDir(true)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border cursor-pointer ${
                    isDir
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Directory (d)
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '644', u: [true, true, false], g: [true, false, false], o: [true, false, false] },
                  { label: '600', u: [true, true, false], g: [false, false, false], o: [false, false, false] },
                  { label: '755', u: [true, true, true], g: [true, false, true], o: [true, false, true] },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setPerms({
                        u: preset.u as [boolean, boolean, boolean],
                        g: preset.g as [boolean, boolean, boolean],
                        o: preset.o as [boolean, boolean, boolean],
                      })
                    }
                    className="px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 hover:border-sky-400 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: 'u', label: 'User (Owner)' },
                  { key: 'g', label: 'Group' },
                  { key: 'o', label: 'Other (World)' },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{label}</span>
                    <span className="text-sm font-mono font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                      {tripletOctal(perms[key])}
                    </span>
                  </div>
                  {(
                    [
                      { idx: 0, bit: 'r (4)', desc: isDir ? 'List names' : 'Read file' },
                      { idx: 1, bit: 'w (2)', desc: isDir ? 'Add/remove' : 'Modify' },
                      { idx: 2, bit: 'x (1)', desc: isDir ? 'Traverse/cd' : 'Execute' },
                    ] as const
                  ).map((item) => (
                    <label
                      key={item.bit}
                      className="flex items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <span className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={perms[key][item.idx]}
                          onChange={() => toggleBit(key, item.idx)}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="font-mono">{item.bit}</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Resulting File Mode (Figure 2-1)
              </div>
              <div className="text-2xl font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100">
                {modeStr}
              </div>
              <div className="text-xs font-mono text-sky-700 dark:text-sky-400 pt-1">
                $ chmod {octal} {isDir ? 'mydir/' : 'script.sh'}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  umask New-Creation Simulator
                </span>
                <select
                  value={umask}
                  onChange={(e) => setUmask(e.target.value as '022' | '027' | '077' | '002')}
                  className="text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2 py-1 text-slate-800 dark:text-slate-200"
                >
                  <option value="022">umask 022 (standard)</option>
                  <option value="027">umask 027 (no world)</option>
                  <option value="077">umask 077 (private)</option>
                  <option value="002">umask 002 (group collab)</option>
                </select>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Base <code className="font-mono text-slate-900 dark:text-slate-100">{isDir ? '777' : '666'}</code> minus mask{' '}
                <code className="font-mono text-slate-900 dark:text-slate-100">{umask}</code> creates new{' '}
                {isDir ? 'directories' : 'files'} with octal mode{' '}
                <strong className="font-mono text-emerald-700 dark:text-emerald-400">{resultingOctal}</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Select a top-level directory (Figure 2-2) to inspect its FHS role:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FHS_NODES.map((node) => {
                const active = selectedFhs.path === node.path;
                return (
                  <button
                    key={node.path}
                    type="button"
                    onClick={() => setSelectedFhs(node)}
                    className={`px-3 py-2.5 rounded-lg border font-mono text-sm font-semibold text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 hover:border-sky-400'
                    }`}
                  >
                    {node.path}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-2">
            <div className="font-mono text-lg font-bold text-sky-700 dark:text-sky-400">{selectedFhs.path}</div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedFhs.role}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedFhs.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
};
