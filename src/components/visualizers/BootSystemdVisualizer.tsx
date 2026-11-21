import React, { useState } from 'react';
import { Power, Cpu, Zap } from 'lucide-react';

interface BootSystemdProps {
  mode: 'boot' | 'systemd';
}

const BOOT_STAGES = [
  {
    id: 1,
    name: '1. Firmware (UEFI / BIOS)',
    detail: 'Initializes CPU/RAM/PCI buses. UEFI reads FAT32 EFI System Partition (ESP) and executes grubx64.efi; legacy BIOS reads MBR sector 0.',
  },
  {
    id: 2,
    name: '2. Bootloader (GRUB 2)',
    detail: 'Displays boot menu (Figure 5-1), loads compressed kernel image (/boot/vmlinuz-...) and initramfs into RAM, and passes kernel command-line parameters.',
  },
  {
    id: 3,
    name: '3. Kernel + initramfs',
    detail: 'Kernel decompresses, unpacks initramfs in RAM, loads storage/LVM/crypto drivers, mounts the real root filesystem read-only (ro), and pivots root.',
  },
  {
    id: 4,
    name: '4. PID 1 (/sbin/init -> systemd)',
    detail: 'Kernel spawns PID 1 in user space. systemd checks/remounts root rw and starts targets and services in parallel.',
  },
];

export const BootSystemdVisualizer: React.FC<BootSystemdProps> = ({ mode }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [paramRo, setParamRo] = useState(true);
  const [paramQuiet, setParamQuiet] = useState(true);
  const [paramEmergency, setParamEmergency] = useState(false);

  // systemd timeline state
  const [socketActivation, setSocketActivation] = useState(true);

  if (mode === 'boot') {
    const cmdline = `linux /boot/vmlinuz-5.15.0-91-generic root=UUID=a9011c2b... ${paramRo ? 'ro' : 'rw'}${
      paramQuiet ? ' quiet' : ''
    }${paramEmergency ? ' init=/bin/sh' : ''}`;

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50/70 dark:bg-slate-900">
          <Power className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: 4-Stage Boot Sequence &amp; GRUB Parameter Sandbox
          </h4>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BOOT_STAGES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStageIdx(idx)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                    stageIdx === idx
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 hover:border-sky-400'
                  }`}
                >
                  <div className="text-xs font-semibold">{s.name}</div>
                </button>
              ))}
            </div>
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50">
              <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1">
                {BOOT_STAGES[stageIdx].name}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {BOOT_STAGES[stageIdx].detail}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-3">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Interactive GRUB Line Editor (mirrors Figure 5-2)
            </div>
            <div className="p-3 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs break-all leading-relaxed">
              {cmdline}
            </div>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={paramRo} onChange={(e) => setParamRo(e.target.checked)} className="rounded text-sky-600" />
                <span><code className="font-mono">ro</code> — Mount root read-only initially (allows safe fsck)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={paramQuiet} onChange={(e) => setParamQuiet(e.target.checked)} className="rounded text-sky-600" />
                <span><code className="font-mono">quiet</code> — Hide verbose kernel boot messages</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={paramEmergency} onChange={(e) => setParamEmergency(e.target.checked)} className="rounded text-sky-600" />
                <span><code className="font-mono">init=/bin/sh</code> — Recovery override (skip systemd, drop to root shell)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {paramEmergency
                ? 'Effect: Kernel skips systemd entirely and hands PID 1 directly to /bin/sh for emergency password/fstab recovery.'
                : !paramQuiet
                  ? 'Effect: Full kernel hardware probe messages print live to the console—helpful for spotting hangs.'
                  : 'Effect: Standard clean production boot with fsck safety before user-space remount.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // systemd sequential vs parallel timeline
  const totalTime = socketActivation ? '4.2s' : '7.8s';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: Sequential vs. systemd Socket-Activated Boot (Figures 6-2 &amp; 6-3)
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setSocketActivation(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              !socketActivation ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sequential (Fig 6-2)
          </button>
          <button
            type="button"
            onClick={() => setSocketActivation(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              socketActivation ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            systemd Parallel (Fig 6-3)
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Scenario: <strong>Service B (App)</strong> depends on a socket provided by <strong>Service A (Logger/DBus)</strong>.
          </span>
          <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 tabular-nums">
            Total Boot Time: {totalTime}
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {socketActivation && (
            <div className="grid grid-cols-12 items-center gap-2">
              <div className="col-span-3 text-slate-700 dark:text-slate-300">resource.socket</div>
              <div className="col-span-9 bg-slate-100 dark:bg-slate-950 h-7 rounded relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                  0.2s
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-12 items-center gap-2">
            <div className="col-span-3 text-slate-700 dark:text-slate-300">Service A (provider)</div>
            <div className="col-span-9 bg-slate-100 dark:bg-slate-950 h-7 rounded relative overflow-hidden">
              <div
                style={{ left: socketActivation ? '10%' : '0%', width: '48%' }}
                className="absolute top-0 bottom-0 bg-emerald-600 text-white flex items-center px-2 text-[11px] transition-all duration-300"
              >
                Initializing (3.8s)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            <div className="col-span-3 text-slate-700 dark:text-slate-300">Service B (consumer)</div>
            <div className="col-span-9 bg-slate-100 dark:bg-slate-950 h-7 rounded relative overflow-hidden">
              {!socketActivation && (
                <div
                  style={{ left: '0%', width: '48%' }}
                  className="absolute top-0 bottom-0 bg-slate-300/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-[10px]"
                >
                  BLOCKED waiting on Service A
                </div>
              )}
              <div
                style={{ left: socketActivation ? '10%' : '48%', width: '50%' }}
                className="absolute top-0 bottom-0 bg-sky-600 text-white flex items-center px-2 text-[11px] transition-all duration-300"
              >
                Starting in {socketActivation ? 'parallel (kernel buffers socket)' : 'sequence (4.0s)'}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
          <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <span>
            {socketActivation
              ? 'With socket activation (Figure 6-3), systemd opens the listening socket upfront in milliseconds and starts Service A and Service B simultaneously. Early requests from B sit safely in the kernel socket buffer until A is ready.'
              : 'In sequential boot (Figure 6-2), Service B sits completely idle while Service A initializes—multiplying total boot time across deep dependency trees.'}
          </span>
        </div>
      </div>
    </div>
  );
};
