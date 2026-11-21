import React, { useState, useRef, useEffect } from 'react';
import { Terminal, RotateCcw, CheckCircle2, Circle, Lightbulb, Play } from 'lucide-react';
import { LabTask } from '../data/types';
import {
  createInitialTerminalEnv,
  executeSimulatedCommand,
  TerminalEnv,
} from '../sim/linuxShell';

interface TerminalLine {
  id: number;
  kind: 'cmd' | 'out' | 'err' | 'note';
  prompt?: string;
  text: string;
}

interface TerminalLabProps {
  title?: string;
  intro?: string;
  initialDir?: string;
  tasks?: LabTask[];
  completedTaskIds?: string[];
  onCompleteTask?: (taskId: string) => void;
  standalone?: boolean;
}

export const TerminalLab: React.FC<TerminalLabProps> = ({
  title = 'Practical Linux Laboratory',
  intro,
  initialDir = '/home/juser',
  tasks = [],
  completedTaskIds = [],
  onCompleteTask,
  standalone = false,
}) => {
  const [env, setEnv] = useState<TerminalEnv>(() => createInitialTerminalEnv(initialDir));
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 1,
      kind: 'note',
      text: "Simulated Linux Learning Environment ready. Type 'help' for available commands or try a guided task.",
    },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histCursor, setHistCursor] = useState<number>(-1);
  const [openHintId, setOpenHintId] = useState<string | null>(null);

  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextLineId = useRef(2);

  useEffect(() => {
    setEnv(createInitialTerminalEnv(initialDir));
    setLines([
      {
        id: nextLineId.current++,
        kind: 'note',
        text: `Simulated Linux Learning Environment (${initialDir}). Type 'help' for supported commands.`,
      },
    ]);
  }, [initialDir]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [lines]);

  const formatPrompt = (e: TerminalEnv) => {
    const shortDir = e.cwd.startsWith(e.envVars.HOME)
      ? '~' + e.cwd.slice(e.envVars.HOME.length)
      : e.cwd;
    return `${e.user}@${e.host}:${shortDir || '/'}$`;
  };

  const runCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    const promptStr = formatPrompt(env);

    if (!trimmed) {
      setLines((prev) => [...prev, { id: nextLineId.current++, kind: 'cmd', prompt: promptStr, text: '' }]);
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev.slice(0, 49)]);
    setHistCursor(-1);

    // Clone env cleanly so React state stays immutable
    const nextEnv: TerminalEnv = {
      ...env,
      envVars: { ...env.envVars },
      inodes: Object.fromEntries(
        Object.entries(env.inodes).map(([k, v]) => [Number(k), { ...v }])
      ),
      paths: { ...env.paths },
    };

    const result = executeSimulatedCommand(trimmed, nextEnv);

    if (result.clear) {
      setLines([]);
      setInput('');
      return;
    }

    if (result.reset) {
      setEnv(createInitialTerminalEnv(initialDir));
      setLines([
        {
          id: nextLineId.current++,
          kind: 'note',
          text: 'Simulated environment reset to clean initial state.',
        },
      ]);
      setInput('');
      return;
    }

    const appended: TerminalLine[] = [
      { id: nextLineId.current++, kind: 'cmd', prompt: promptStr, text: trimmed },
    ];
    if (result.output) {
      appended.push({
        id: nextLineId.current++,
        kind: result.exitCode === 0 ? 'out' : 'err',
        text: result.output,
      });
    }
    if (result.explanation) {
      appended.push({
        id: nextLineId.current++,
        kind: 'note',
        text: `Tip: ${result.explanation}`,
      });
    }

    // Evaluate chapter lab objectives against executed command
    if (result.exitCode === 0 && tasks.length > 0 && onCompleteTask) {
      for (const task of tasks) {
        if (!completedTaskIds.includes(task.id)) {
          try {
            const re = new RegExp(task.expectedPattern, 'i');
            if (re.test(trimmed)) {
              onCompleteTask(task.id);
              appended.push({
                id: nextLineId.current++,
                kind: 'note',
                text: `✓ Lab objective completed: ${task.title} — ${task.commandExplanation}`,
              });
            }
          } catch {
            // ignore invalid pattern
          }
        }
      }
    }

    setEnv(nextEnv);
    setLines((prev) => [...prev, ...appended]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIdx = Math.min(histCursor + 1, cmdHistory.length - 1);
        setHistCursor(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histCursor > 0) {
        const nextIdx = histCursor - 1;
        setHistCursor(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else {
        setHistCursor(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{title}</h4>
          </div>
          <p className="text-[11px] font-mono text-amber-700 dark:text-amber-400">
            SIMULATED LINUX ENVIRONMENT — Safe in-browser shell; does not run on your host OS
          </p>
        </div>
        <button
          type="button"
          onClick={() => runCommand('reset')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Lab
        </button>
      </div>

      {intro && (
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/50">
          {intro}
        </div>
      )}

      <div className={`grid grid-cols-1 ${tasks.length > 0 ? 'lg:grid-cols-12' : ''} divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800`}>
        {/* Guided Objectives Sidebar */}
        {tasks.length > 0 && (
          <div className="lg:col-span-5 p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Guided Lab Tasks ({completedTaskIds.filter((id) => tasks.some((t) => t.id === id)).length}/{tasks.length})
            </div>
            <div className="space-y-2.5">
              {tasks.map((task) => {
                const done = completedTaskIds.includes(task.id);
                const hintOpen = openHintId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border text-xs space-y-2 ${
                      done
                        ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1 flex-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{task.instruction}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pl-6">
                      <button
                        type="button"
                        onClick={() => setOpenHintId(hintOpen ? null : task.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        <Lightbulb className="w-3 h-3" />
                        {hintOpen ? 'Hide Hint' : 'Show Hint'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInput(task.sampleCommand);
                          inputRef.current?.focus();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300 hover:text-sky-600 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        Load command
                      </button>
                    </div>
                    {hintOpen && (
                      <div className="ml-6 p-2 rounded bg-slate-100 dark:bg-slate-950 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
                        Hint: {task.hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Terminal Screen */}
        <div
          className={`${tasks.length > 0 ? 'lg:col-span-7' : ''} bg-[#0D1117] text-slate-100 flex flex-col ${
            standalone ? 'min-h-[460px]' : 'min-h-[340px] max-h-[440px]'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          <div
            role="log"
            aria-live="polite"
            aria-label="Simulated Linux terminal output"
            className="flex-1 p-4 font-mono text-xs sm:text-[13px] overflow-y-auto space-y-2 leading-relaxed"
          >
            {lines.map((line) => (
              <div key={line.id} className="whitespace-pre-wrap break-words">
                {line.kind === 'cmd' && (
                  <div>
                    <span className="text-emerald-400 font-semibold">{line.prompt} </span>
                    <span className="text-white">{line.text}</span>
                  </div>
                )}
                {line.kind === 'out' && <div className="text-slate-200">{line.text}</div>}
                {line.kind === 'err' && <div className="text-rose-400">{line.text}</div>}
                {line.kind === 'note' && <div className="text-sky-300">{line.text}</div>}
              </div>
            ))}
            <div ref={outputEndRef} />
          </div>

          <div className="px-4 py-2.5 border-t border-slate-800 bg-[#090D12] flex items-center gap-2 font-mono text-xs sm:text-[13px]">
            <span className="text-emerald-400 font-semibold shrink-0">{formatPrompt(env)}</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Simulated Linux terminal command input"
              placeholder="Type a Linux command (e.g. help, ls -la, ip route, lvs)..."
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => runCommand(input)}
              className="px-2.5 py-1 text-[11px] font-sans font-medium rounded bg-sky-600 text-white hover:bg-sky-700 cursor-pointer"
            >
              Run
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
