import React, { useState } from 'react';
import { HardDrive, Link2, RotateCcw, Plus, Trash2 } from 'lucide-react';

interface StorageVisualizerProps {
  mode: 'scsi' | 'lvm_inodes';
}

const SCSI_PATHS = [
  {
    id: 'sata',
    label: 'SATA SSD (/dev/sda)',
    steps: [
      'User Process (read / write / mount)',
      'Block Device Interface (/dev/sda, Major 8, Minor 0)',
      'SCSI Upper Driver: sd (Disk Driver)',
      'SCSI Middle Layer: Protocol & Host Management',
      'ATA Bridge + libata Translator',
      'SATA Host Controller Driver -> Physical SATA SSD',
    ],
  },
  {
    id: 'usb',
    label: 'USB Flash Drive (/dev/sdb)',
    steps: [
      'User Process (read / write)',
      'Block Device Interface (/dev/sdb, Major 8, Minor 16)',
      'SCSI Upper Driver: sd (Disk Driver)',
      'SCSI Middle Layer: Protocol & Host Management',
      'USB Storage Bridge -> USB Storage Driver -> USB Core',
      'USB Host Controller Driver -> Physical USB Flash Drive',
    ],
  },
  {
    id: 'optical_burn',
    label: 'Optical Disc Burner (/dev/sg0 vs /dev/sr0)',
    steps: [
      'User Process B (Burning App — raw SCSI commands)',
      'Bypasses Block Device Interface! Opens /dev/sg0 (Character)',
      'SCSI Upper Driver: sg (Generic Pass-Through Driver)',
      'SCSI Middle Layer: Protocol & Host Management',
      'Lower-Layer Driver (libata / SATA)',
      'Optical Drive Hardware (Note: reading data uses /dev/sr0 block driver)',
    ],
  },
];

export const StorageLvmInodeVisualizer: React.FC<StorageVisualizerProps> = ({ mode }) => {
  // SCSI mode state
  const [selectedScsi, setSelectedScsi] = useState(SCSI_PATHS[0]);

  // LVM & Inodes tabbed state (Ch 4)
  const [ch4Tab, setCh4Tab] = useState<'lvm' | 'inodes'>('lvm');
  // LVM state mirroring Figs 4-7 and 4-8 (20 extents across 2 PVs of 10GB each = 20GB VG)
  const [lv1Gb, setLv1Gb] = useState(10);
  const [lv2Exists, setLv2Exists] = useState(true);
  const [lv2Gb, setLv2Gb] = useState(8);

  // Inode / Hard-link state mirroring Figs 4-9 & 4-10
  const [dirEntries, setDirEntries] = useState<
    Array<{ name: string; inode: number; isSymlink?: boolean; symTarget?: string }>
  >([
    { name: 'report.txt', inode: 524291 },
    { name: 'report_link.txt', inode: 524291 },
    { name: 'shortcut.txt', inode: 524308, isSymlink: true, symTarget: 'report.txt' },
  ]);
  const [openByProcess, setOpenByProcess] = useState(false);

  if (mode === 'scsi') {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Lab: Linux SCSI &amp; Optical Driver Path Tracer (Figures 3-2 &amp; 3-3)
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SCSI_PATHS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedScsi(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                  selectedScsi.id === p.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-2 max-w-2xl mx-auto">
            {selectedScsi.steps.map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-full px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center justify-between ${
                    i === 2
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{step}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Layer {i + 1}</span>
                </div>
                {i < selectedScsi.steps.length - 1 && (
                  <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ch 4 calculations
  const totalVgGb = 20;
  const freeVgGb = totalVgGb - lv1Gb - (lv2Exists ? lv2Gb : 0);
  const blocks = Array.from({ length: totalVgGb }, (_, idx) => {
    if (idx < lv1Gb) return 'mylv1';
    if (lv2Exists && idx < lv1Gb + lv2Gb) return 'mylv2';
    return 'free';
  });

  const hardLinkCount = dirEntries.filter((d) => !d.isSymlink && d.inode === 524291).length;
  const blocksFreed = hardLinkCount === 0 && !openByProcess;
  const symlinkBroken = !dirEntries.some((d) => d.name === 'report.txt');

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {ch4Tab === 'lvm' ? (
            <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <Link2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: LVM Extent Allocator &amp; Inode Link-Count Simulator
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setCh4Tab('lvm')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              ch4Tab === 'lvm' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            LVM Pool (Figs 4-4..4-8)
          </button>
          <button
            type="button"
            onClick={() => setCh4Tab('inodes')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              ch4Tab === 'inodes' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Inodes &amp; unlink() (Figs 4-9..4-10)
          </button>
        </div>
      </div>

      {ch4Tab === 'lvm' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Volume Group <strong className="font-mono text-slate-900 dark:text-slate-100">myvg</strong> (20 GB across PV1 /dev/sdb1 + PV2 /dev/sdc1)</span>
              <span className="font-mono tabular-nums">Free: {freeVgGb} GB</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'PV 1: /dev/sdb1 (10 GB)', slice: blocks.slice(0, 10) },
                { name: 'PV 2: /dev/sdc1 (10 GB)', slice: blocks.slice(10, 20) },
              ].map((pv) => (
                <div
                  key={pv.name}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {pv.name}
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {pv.slice.map((owner, idx) => (
                      <div
                        key={idx}
                        className={`h-8 rounded flex items-center justify-center text-[10px] font-mono font-semibold border ${
                          owner === 'mylv1'
                            ? 'bg-sky-600 text-white border-sky-700'
                            : owner === 'mylv2'
                              ? 'bg-amber-500 text-slate-950 border-amber-600'
                              : 'bg-white dark:bg-slate-900 text-slate-400 border-dashed border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {owner === 'free' ? 'free' : owner.replace('my', '')}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Notice how expanding <code className="font-mono">mylv1</code> past 10 GB seamlessly spans extents from PV1 onto PV2 (mirroring Figure 4-8).
            </p>
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-sky-700 dark:text-sky-400 font-mono">mylv1 size</span>
                <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{lv1Gb} GB</span>
              </div>
              <input
                type="range"
                min={2}
                max={lv2Exists ? totalVgGb - lv2Gb : totalVgGb}
                value={lv1Gb}
                onChange={(e) => setLv1Gb(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {lv2Exists ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-amber-700 dark:text-amber-400 font-mono">mylv2 size</span>
                  <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{lv2Gb} GB</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={totalVgGb - lv1Gb}
                  value={lv2Gb}
                  onChange={(e) => setLv2Gb(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    setLv2Exists(false);
                    setLv2Gb(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  lvremove myvg/mylv2 (free extents)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const avail = Math.min(6, totalVgGb - lv1Gb);
                  if (avail >= 2) {
                    setLv2Exists(true);
                    setLv2Gb(avail);
                  } else {
                    setLv1Gb(10);
                    setLv2Exists(true);
                    setLv2Gb(8);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recreate mylv2
              </button>
            )}

            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
              <div>$ lvextend -L {lv1Gb}G -r /dev/myvg/mylv1</div>
              <div className="text-slate-500"># -r resizes the ext4 filesystem alongside the LV</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-7 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Directory Table (/home/juser)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={blocksFreed}
                  onClick={() => {
                    const num = dirEntries.length + 1;
                    setDirEntries((prev) => [...prev, { name: `hard_${num}.txt`, inode: 524291 }]);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Add Hard Link (ln)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirEntries([
                      { name: 'report.txt', inode: 524291 },
                      { name: 'report_link.txt', inode: 524291 },
                      { name: 'shortcut.txt', inode: 524308, isSymlink: true, symTarget: 'report.txt' },
                    ]);
                    setOpenByProcess(false);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {dirEntries.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40"
                >
                  <div className="font-mono text-xs space-y-0.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {entry.name}
                      {entry.isSymlink && (
                        <span className="ml-2 text-amber-600 dark:text-amber-400">
                          -&gt; {entry.symTarget} {symlinkBroken ? '(DANGLING!)' : '(valid)'}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Points to Inode #{entry.inode} ({entry.isSymlink ? 'symlink inode' : 'shared data inode'})
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDirEntries((prev) => prev.filter((e) => e.name !== entry.name))}
                    className="px-2.5 py-1 text-xs font-mono rounded border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    rm / unlink
                  </button>
                </div>
              ))}
              {dirEntries.length === 0 && (
                <div className="text-xs font-mono text-slate-500 p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center">
                  Directory empty — all filenames unlinked.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-4">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">Inode #524291</span>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    blocksFreed
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {blocksFreed ? '● RECLAIMED (FREED)' : '● DATA ALLOCATED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  Link Count: <strong className="tabular-nums">{hardLinkCount}</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  Open FDs: <strong className="tabular-nums">{openByProcess ? 1 : 0}</strong>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={openByProcess}
                  onChange={(e) => setOpenByProcess(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600"
                />
                Hold file open in a running daemon process
              </label>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {blocksFreed
                ? 'Both link count (0) and open file descriptors (0) hit zero: the kernel frees the inode and disk data blocks!'
                : hardLinkCount === 0 && openByProcess
                  ? 'All filenames are deleted (link count = 0), YET disk space is still occupied because a running process still holds an open descriptor to inode #524291!'
                  : 'Notice that deleting report.txt leaves report_link.txt completely intact—only the symlink breaks because symlinks store a pathname, not an inode number.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
