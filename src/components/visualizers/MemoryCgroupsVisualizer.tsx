import React, { useState } from 'react';
import { Activity, Layers } from 'lucide-react';

export const MemoryCgroupsVisualizer: React.FC = () => {
  const [tab, setTab] = useState<'memory' | 'cgroups'>('memory');
  const [workingSetGb, setWorkingSetGb] = useState(6);
  const [cgroupVer, setCgroupVer] = useState<'v1' | 'v2'>('v2');

  const totalRamGb = 8;
  const usedActive = Math.min(workingSetGb, totalRamGb);
  const pageCacheGb = Math.max(0, totalRamGb - workingSetGb);
  const swapUsedGb = Math.max(0, workingSetGb - totalRamGb);
  const isThrashing = workingSetGb > totalRamGb + 1;
  const vmstatSiSo = isThrashing ? Math.round((workingSetGb - totalRamGb) * 1420) : swapUsedGb > 0 ? 180 : 0;
  const cpuWaitPct = isThrashing ? Math.min(78, (workingSetGb - totalRamGb) * 16) : swapUsedGb > 0 ? 12 : 1;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {tab === 'memory' ? (
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: Virtual Memory / Paging Simulator &amp; cgroups v1 vs. v2
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setTab('memory')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              tab === 'memory' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Paging &amp; Swap (vmstat)
          </button>
          <button
            type="button"
            onClick={() => setTab('cgroups')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              tab === 'cgroups' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            cgroups v1 vs v2 (Figs 8-1 &amp; 8-2)
          </button>
        </div>
      </div>

      {tab === 'memory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-700 dark:text-slate-300">
                  Active Application Working Set (Physical RAM = 8 GB)
                </span>
                <span className="font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  {workingSetGb} GB
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={14}
                step={1}
                value={workingSetGb}
                onChange={(e) => setWorkingSetGb(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Physical RAM Allocation (8 GB)</div>
              <div className="h-7 rounded-lg overflow-hidden flex border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-semibold">
                <div
                  style={{ width: `${(usedActive / totalRamGb) * 100}%` }}
                  className="bg-sky-600 text-white flex items-center justify-center transition-all"
                >
                  App Pages ({usedActive}G)
                </div>
                {pageCacheGb > 0 && (
                  <div
                    style={{ width: `${(pageCacheGb / totalRamGb) * 100}%` }}
                    className="bg-emerald-500 text-slate-950 flex items-center justify-center transition-all"
                  >
                    Page Cache ({pageCacheGb}G)
                  </div>
                )}
              </div>

              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">Disk Swap Space (8 GB)</div>
              <div className="h-6 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[11px] font-mono">
                {swapUsedGb > 0 ? (
                  <div
                    style={{ width: `${Math.min(100, (swapUsedGb / 8) * 100)}%` }}
                    className="h-full bg-rose-600 text-white flex items-center px-2 font-semibold transition-all"
                  >
                    Swapped Out ({swapUsedGb}G)
                  </div>
                ) : (
                  <div className="h-full flex items-center px-2 text-slate-400">0 GB swapped (nominal)</div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Simulated vmstat Telemetry</span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isThrashing
                    ? 'text-rose-600 dark:text-rose-400'
                    : swapUsedGb > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isThrashing ? '▲ THRASHING' : swapUsedGb > 0 ? '▲ PAGING' : '● NOMINAL'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center">
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500">si / so</div>
                <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">{vmstatSiSo} KB/s</div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500">iowait (wa)</div>
                <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">{cpuWaitPct}%</div>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="text-[10px] text-slate-500">Major Faults</div>
                <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                  {isThrashing ? 'HIGH' : swapUsedGb > 0 ? 'MOD' : 'LOW'}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isThrashing
                ? 'Active working set exceeds physical RAM: the kernel constantly evicts active pages to swap and triggers major page faults on disk—CPU stalls waiting on I/O.'
                : swapUsedGb > 0
                  ? 'Page cache is exhausted and inactive pages are spilling into swap. Minor latency spikes appear.'
                  : 'Plenty of physical RAM: Linux uses spare RAM as disk page cache (buff/cache) and reclaims it automatically without touching swap.'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2 leading-relaxed">
              <strong className="font-mono text-slate-700 dark:text-slate-300">[Environment-Dependent]</strong>{' '}
              Actual reclaim balance between anonymous pages and page cache depends on <code className="font-mono">vm.swappiness</code> (default 60 on many kernels), and modern desktops often back swap with compressed in-RAM <code className="font-mono">zram</code> before touching disk.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Compare how PID 1204 (web worker) is organized under cgroups v1 vs. cgroups v2:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCgroupVer('v1')}
                className={`px-3 py-1 text-xs font-mono rounded border cursor-pointer ${
                  cgroupVer === 'v1' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                cgroups v1 (Fig 8-1)
              </button>
              <button
                type="button"
                onClick={() => setCgroupVer('v2')}
                className={`px-3 py-1 text-xs font-mono rounded border cursor-pointer ${
                  cgroupVer === 'v2' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                cgroups v2 Unified (Fig 8-2)
              </button>
            </div>
          </div>

          {cgroupVer === 'v1' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              {[
                { tree: '/sys/fs/cgroup/cpu/', group: 'web.slice -> PID 1204', note: 'Separate CPU hierarchy' },
                { tree: '/sys/fs/cgroup/memory/', group: 'apps/web -> PID 1204', note: 'Independent Memory tree' },
                { tree: '/sys/fs/cgroup/blkio/', group: 'default -> PID 1204', note: 'Cannot coordinate buffered writeback with memory!' },
              ].map((t) => (
                <div key={t.tree} className="p-3.5 rounded-lg border border-amber-300/70 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-1.5">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{t.tree}</div>
                  <div className="text-sky-700 dark:text-sky-400">{t.group}</div>
                  <div className="text-[11px] font-sans text-slate-600 dark:text-slate-400">{t.note}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 font-mono text-xs space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                /sys/fs/cgroup/system.slice/nginx.service/ (Single Unified Hierarchy)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">cgroup.procs</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">PID 1204</div>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">cgroup.controllers</div>
                  <div className="text-sky-700 dark:text-sky-400 font-semibold">cpu memory io pids</div>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-slate-500">memory.max</div>
                  <div className="text-slate-900 dark:text-slate-100 font-semibold">536870912 (512M)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
