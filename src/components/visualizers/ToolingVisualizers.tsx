import React, { useState } from 'react';
import { Code2, RefreshCw, GitBranch, Box, Play } from 'lucide-react';

interface ToolingVisProps {
  mode: 'shell_quoting' | 'rsync_slash' | 'make_graph' | 'docker_netns_overlay';
}

export const ToolingVisualizers: React.FC<ToolingVisProps> = ({ mode }) => {
  // Ch 11 Quoting state
  const [quoteMode, setQuoteMode] = useState<'unquoted' | 'double' | 'single'>('double');

  // Ch 12 rsync state
  const [trailingSlash, setTrailingSlash] = useState(false);
  const [withDelete, setWithDelete] = useState(false);
  const [dryRun, setDryRun] = useState(true);

  // Ch 15 make state
  const [touched, setTouched] = useState<'none' | 'main.c' | 'aux.c' | 'both'>('aux.c');

  // Ch 17 docker state
  const [dockerTab, setDockerTab] = useState<'netns' | 'overlay'>('netns');
  const [wroteFile, setWroteFile] = useState(false);

  if (mode === 'shell_quoting') {
    const fileVar = 'my report.txt';
    const commandText =
      quoteMode === 'unquoted'
        ? 'rm $FILE *.log'
        : quoteMode === 'double'
          ? 'rm "$FILE" "*.log"'
          : "rm '$FILE' '*.log'";
    const argv =
      quoteMode === 'unquoted'
        ? ['rm', 'my', 'report.txt', 'app.log', 'sys.log']
        : quoteMode === 'double'
          ? ['rm', 'my report.txt', '*.log']
          : ['rm', '$FILE', '*.log'];

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Lab: Shell Quoting, Word Splitting &amp; Globbing Sandbox
            </h4>
          </div>
          <div className="flex gap-1.5">
            {(
              [
                { id: 'unquoted', label: 'Unquoted' },
                { id: 'double', label: 'Double Quotes ("...")' },
                { id: 'single', label: "Single Quotes ('...')" },
              ] as const
            ).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setQuoteMode(q.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded border cursor-pointer ${
                  quoteMode === q.id
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Given: <strong className="text-slate-900 dark:text-slate-100">FILE="{fileVar}"</strong> and directory contains <code className="text-slate-900 dark:text-slate-100">app.log</code>, <code className="text-slate-900 dark:text-slate-100">sys.log</code>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-sm">
            $ {commandText}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Exact argument array (<code className="font-mono">argv[]</code>) received by <code className="font-mono">rm</code>:
            </div>
            <div className="flex flex-wrap gap-2">
              {argv.map((arg, i) => (
                <div
                  key={`${arg}-${i}`}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-xs"
                >
                  <span className="text-slate-400 mr-1.5">argv[{i}]</span>
                  <span className="font-semibold text-sky-700 dark:text-sky-400">"{arg}"</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {quoteMode === 'unquoted'
              ? 'Danger! Unquoted $FILE split into TWO separate filenames ("my" and "report.txt") and *.log expanded to every log file!'
              : quoteMode === 'double'
                ? 'Safe for variables: Double quotes expanded $FILE into a single intact argument "my report.txt" while suppressing globbing.'
                : 'Literal mode: Single quotes stopped BOTH $FILE expansion and *.log globbing.'}
          </p>
        </div>
      </div>
    );
  }

  if (mode === 'rsync_slash') {
    const flags = dryRun ? '-anv' : '-av';
    const cmd = `rsync ${flags}${withDelete ? ' --delete' : ''} dir${trailingSlash ? '/' : ''} host:dest_dir`;
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Lab: rsync Trailing-Slash, -n Dry Run &amp; --delete Simulator (Figures 12-1 &amp; 12-2)
            </h4>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} className="rounded text-emerald-600" />
              Dry run (<code>-n</code>)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={trailingSlash} onChange={(e) => setTrailingSlash(e.target.checked)} className="rounded text-sky-600" />
              Add trailing slash (<code>dir/</code>)
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
              <input type="checkbox" checked={withDelete} onChange={(e) => setWithDelete(e.target.checked)} className="rounded text-rose-600" />
              Include <code>--delete</code>
            </label>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-900 text-sky-300 font-mono text-xs sm:text-sm space-y-1">
            <div>$ {cmd}</div>
            <div className="text-slate-400 pt-1">sending incremental file list</div>
            {trailingSlash ? (
              <>
                {withDelete && (
                  <div className="text-rose-400">
                    deleting stale.txt{dryRun ? ' (DRY RUN — no files changed)' : ''}
                  </div>
                )}
                <div className="text-emerald-300">file1.txt</div>
                <div className="text-emerald-300">file2.txt</div>
              </>
            ) : (
              <>
                <div className="text-emerald-300">dir/</div>
                <div className="text-emerald-300">dir/file1.txt</div>
                <div className="text-emerald-300">dir/file2.txt</div>
              </>
            )}
            {dryRun && (
              <div className="text-amber-300 pt-1">
                sent 118 bytes  received 24 bytes (DRY RUN — remove -n after verifying)
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-1">
              <div className="font-sans font-semibold text-slate-700 dark:text-slate-300 mb-2">Source (local)</div>
              <div>dir/</div>
              <div className="pl-4 text-sky-700 dark:text-sky-400">├── file1.txt</div>
              <div className="pl-4 text-sky-700 dark:text-sky-400">└── file2.txt</div>
            </div>
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-1">
              <div className="font-sans font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {dryRun ? 'Projected' : 'Actual'} Result on host:dest_dir ({trailingSlash ? 'Figure 12-2' : 'Figure 12-1'})
              </div>
              <div>dest_dir/</div>
              {trailingSlash ? (
                <>
                  <div className="pl-4 text-emerald-700 dark:text-emerald-400">├── file1.txt</div>
                  <div className="pl-4 text-emerald-700 dark:text-emerald-400">├── file2.txt</div>
                  <div className={`pl-4 ${withDelete ? 'line-through text-rose-600' : 'text-slate-500'}`}>
                    └── stale.txt {withDelete ? (dryRun ? '(WOULD BE DELETED by --delete)' : '(DELETED by --delete!)') : '(kept)'}
                  </div>
                </>
              ) : (
                <>
                  <div className="pl-4 text-emerald-700 dark:text-emerald-400">├── dir/</div>
                  <div className="pl-8 text-emerald-700 dark:text-emerald-400">├── file1.txt</div>
                  <div className="pl-8 text-emerald-700 dark:text-emerald-400">└── file2.txt</div>
                  <div className="pl-4 text-slate-500">└── stale.txt (outside dest_dir/dir/)</div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'make_graph') {
    const rebuildMainO = touched === 'main.c' || touched === 'both';
    const rebuildAuxO = touched === 'aux.c' || touched === 'both';
    const rebuildMyprog = rebuildMainO || rebuildAuxO;

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Lab: Makefile Dependency Graph &amp; Incremental Rebuilder (Figure 15-1)
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {(
              [
                { id: 'none', label: 'No edits' },
                { id: 'aux.c', label: 'touch aux.c' },
                { id: 'main.c', label: 'touch main.c' },
                { id: 'both', label: 'touch both' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTouched(opt.id)}
                className={`px-2.5 py-1 font-mono rounded border cursor-pointer ${
                  touched === opt.id ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-7 flex flex-col items-center gap-3 font-mono text-xs">
            <div
              className={`px-5 py-2.5 rounded-lg border font-bold ${
                rebuildMyprog
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              myprog — {rebuildMyprog ? 'RELINK REQUIRED' : 'UP TO DATE'}
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-full text-center px-3 py-2 rounded-lg border font-semibold ${
                    rebuildMainO
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  main.o ({rebuildMainO ? 'REBUILD' : 'cached'})
                </div>
                <div
                  className={`w-full text-center px-3 py-1.5 rounded border ${
                    rebuildMainO ? 'border-sky-500 bg-sky-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  main.c {rebuildMainO ? '(MODIFIED)' : ''}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-full text-center px-3 py-2 rounded-lg border font-semibold ${
                    rebuildAuxO
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  aux.o ({rebuildAuxO ? 'REBUILD' : 'cached'})
                </div>
                <div
                  className={`w-full text-center px-3 py-1.5 rounded border ${
                    rebuildAuxO ? 'border-sky-500 bg-sky-600 text-white' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  aux.c {rebuildAuxO ? '(MODIFIED)' : ''}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 p-4 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs space-y-1.5">
            <div className="text-slate-400 flex items-center gap-1.5">
              <Play className="w-3 h-3" /> $ make
            </div>
            {!rebuildMyprog && <div>make: 'myprog' is up to date.</div>}
            {rebuildMainO && <div>gcc -Wall -O2 -c main.c -o main.o</div>}
            {rebuildAuxO && <div>gcc -Wall -O2 -c aux.c -o aux.o</div>}
            {rebuildMyprog && <div>gcc -o myprog main.o aux.o</div>}
          </div>
        </div>
      </div>
    );
  }

  // Ch 17 Docker netns & OverlayFS visualizer
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: Docker Bridge Network (Fig 17-1) &amp; OverlayFS Layers
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setDockerTab('netns')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              dockerTab === 'netns' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bridge Network (Fig 17-1)
          </button>
          <button
            type="button"
            onClick={() => setDockerTab('overlay')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              dockerTab === 'overlay' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            OverlayFS Copy-on-Write
          </button>
        </div>
      </div>

      {dockerTab === 'netns' ? (
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs items-center">
          <div className="p-4 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 space-y-1">
            <div className="font-bold text-sky-800 dark:text-sky-300">Container netns</div>
            <div>eth0: 172.17.0.2/16</div>
            <div className="text-slate-500">default via 172.17.0.1</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1 text-center">
            <div className="font-bold text-slate-900 dark:text-slate-100">veth pair &lt;-&gt; docker0</div>
            <div className="text-emerald-700 dark:text-emerald-400">bridge 172.17.0.1/16</div>
            <div className="text-[11px] font-sans text-slate-500">Virtual Ethernet patch cable crossing netns boundary</div>
          </div>
          <div className="p-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
            <div className="font-bold text-amber-800 dark:text-amber-300">Host netns + NAT</div>
            <div>enp0s3: 10.23.2.4/24</div>
            <div className="text-slate-500">iptables MASQUERADE -&gt; Internet</div>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Click to simulate modifying <code className="font-mono">/etc/nginx/nginx.conf</code> inside a running container:
            </span>
            <button
              type="button"
              onClick={() => setWroteFile((w) => !w)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
            >
              {wroteFile ? 'Reset Container Layer' : 'Modify /etc/nginx/nginx.conf'}
            </button>
          </div>
          <div className="space-y-2 font-mono text-xs">
            <div className={`p-3 rounded-lg border ${wroteFile ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30' : 'border-dashed border-slate-300 dark:border-slate-700'}`}>
              <span className="font-bold">Upper Layer (Writable Container Diff):</span>{' '}
              {wroteFile ? 'Copied-up /etc/nginx/nginx.conf (modified copy shadows lower layer)' : '(empty — zero extra disk space used)'}
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <span className="font-bold text-sky-700 dark:text-sky-400">Lower Layer 2 (Read-Only):</span> nginx binaries + default /etc/nginx/nginx.conf (UNTOUCHED, shared by all containers)
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <span className="font-bold text-slate-700 dark:text-slate-300">Lower Layer 1 (Read-Only):</span> Alpine Linux base rootfs (UNTOUCHED)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
