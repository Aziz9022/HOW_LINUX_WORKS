import React, { useState } from 'react';
import { Layers, Play, RotateCcw, StepForward, Cpu, ShieldCheck, Terminal } from 'lucide-react';

const FORK_STEPS = [
  {
    step: 0,
    title: '1. Shell Awaits Command',
    activeLayer: 'user',
    shellState: 'PID 1420 (bash) — Reading "ls -l" from stdin',
    childState: 'Not yet created',
    kernelAction: 'Idle in user space; shell parses tokens and checks $PATH for /bin/ls.',
  },
  {
    step: 1,
    title: '2. Shell Invokes fork() Syscall',
    activeLayer: 'kernel',
    shellState: 'PID 1420 (bash) — Calls fork(), receives child PID 1512',
    childState: 'PID 1512 (copy of bash) — Receives return value 0',
    kernelAction:
      'CPU switches to Kernel Mode. Kernel clones process descriptors & Copy-on-Write page tables so parent and child share memory safely until modified.',
  },
  {
    step: 2,
    title: '3. Child Invokes execve("/bin/ls")',
    activeLayer: 'kernel',
    shellState: 'PID 1420 (bash) — Calls wait() and sleeps until child exits',
    childState: 'PID 1512 — Memory image replaced with /bin/ls ELF binary',
    kernelAction:
      'Kernel discards bash memory segments in PID 1512, maps /bin/ls code + libc.so, and jumps to ls main() in User Mode.',
  },
  {
    step: 3,
    title: '4. ls Executes, Writes Output & Exits',
    activeLayer: 'hardware',
    shellState: 'PID 1420 (bash) — Woken by kernel when PID 1512 exits (status 0)',
    childState: 'PID 1512 (ls) — Completed & reaped; prompt returns to bash',
    kernelAction:
      'ls calls getdents64() & write(1, ...); kernel reads directory blocks from storage hardware and writes bytes to terminal.',
  },
];

const LAYERS = [
  {
    id: 'user',
    name: 'User Space (Unprivileged User Mode)',
    badge: 'RESTRICTED',
    components: ['Interactive Shell (bash)', 'Graphical Desktop', 'Servers / Daemons (sshd, nginx)', 'Diagnostic Logging'],
    detail:
      'User processes live in isolated virtual address spaces. They cannot touch hardware or another process’s RAM directly—every privileged operation must go through a kernel system call.',
  },
  {
    id: 'kernel',
    name: 'Linux Kernel (Privileged Kernel Mode)',
    badge: 'PRIVILEGED',
    components: ['System Calls (fork, exec, read)', 'Process Management (Scheduler)', 'Memory Management (Virtual RAM)', 'Device Drivers'],
    detail:
      'The kernel runs with full CPU privilege. It multiplexes CPU cores via context switches, enforces memory isolation via the hardware MMU, and translates generic I/O into hardware commands.',
  },
  {
    id: 'hardware',
    name: 'Physical Hardware',
    badge: 'PHYSICAL',
    components: ['Processor (CPU + MMU)', 'Main Memory (RAM)', 'Storage Disks', 'Network Ports'],
    detail:
      'Physical silicon executing instructions and storing state. Only the kernel interacts directly with hardware registers, interrupts, and DMA controllers.',
  },
];

export const ArchitectureForkVisualizer: React.FC = () => {
  const [stepIdx, setStepIdx] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState<string>('kernel');

  const current = FORK_STEPS[stepIdx];
  const layerInfo = LAYERS.find((l) => l.id === selectedLayer) || LAYERS[1];

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: 3-Layer Abstraction &amp; fork() / exec() Step-Through
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = (stepIdx + 1) % FORK_STEPS.length;
              setStepIdx(next);
              setSelectedLayer(FORK_STEPS[next].activeLayer);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors cursor-pointer"
          >
            {stepIdx === FORK_STEPS.length - 1 ? <Play className="w-3.5 h-3.5" /> : <StepForward className="w-3.5 h-3.5" />}
            {stepIdx === FORK_STEPS.length - 1 ? 'Restart Flow' : 'Next Step'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStepIdx(0);
              setSelectedLayer('user');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        {/* Left Stage (7 cols): Interactive Layer Stack & Process Flow */}
        <div className="lg:col-span-7 p-5 space-y-5">
          <div className="space-y-2.5">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Click any layer to inspect responsibilities (mirrors Figure 1-1)
            </div>
            {LAYERS.map((layer) => {
              const isSelected = selectedLayer === layer.id;
              const isActiveInStep = current.activeLayer === layer.id;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 dark:border-sky-500/70'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {layer.name}
                    </span>
                    <span className="text-[11px] font-mono tracking-wide text-slate-500 dark:text-slate-400">
                      {isActiveInStep ? 'ACTIVE IN CURRENT STEP' : layer.badge}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {layer.components.map((comp) => (
                      <div
                        key={comp}
                        className="text-xs px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {comp}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* fork/exec visual pipeline */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Process Spawn Pipeline (mirrors Figure 1-2)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FORK_STEPS.map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    setStepIdx(s.step);
                    setSelectedLayer(s.activeLayer);
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    stepIdx === s.step
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : stepIdx > s.step
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-slate-800 dark:text-slate-200'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-[11px] font-mono opacity-80">Step {s.step + 1}</div>
                  <div className="text-xs font-semibold mt-0.5 leading-snug">
                    {s.title.replace(/^\d+\.\s*/, '')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Concept & State Deck (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-1.5">
              <Terminal className="w-3.5 h-3.5" />
              {current.title}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {current.kernelAction}
            </p>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">PARENT PROCESS</div>
              <div className="text-slate-900 dark:text-slate-100">{current.shellState}</div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">CHILD PROCESS</div>
              <div className={stepIdx >= 1 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}>
                {current.childState}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
              {selectedLayer === 'kernel' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
              )}
              Selected Layer: {layerInfo.name}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {layerInfo.detail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
