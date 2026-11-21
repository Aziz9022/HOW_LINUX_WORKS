import React, { useState } from 'react';
import { Shield, Clock, Users } from 'lucide-react';

type PamControl = 'requisite' | 'required' | 'sufficient' | 'optional';

interface PamRule {
  id: number;
  module: string;
  control: PamControl;
  passes: boolean;
}

const PASSWD_FIELDS = [
  { val: 'juser', label: 'Username', desc: 'Human-readable login identifier mapped to UID.' },
  { val: 'x', label: 'Password Placeholder', desc: 'Actual salted hash lives in root-only /etc/shadow.' },
  { val: '1000', label: 'UID', desc: 'Numeric User ID enforced by the kernel (0 = root).' },
  { val: '1000', label: 'Primary GID', desc: 'Default group ID assigned to new files.' },
  { val: 'Brian Lab User', label: 'GECOS / Comment', desc: 'Full name or account metadata.' },
  { val: '/home/juser', label: 'Home Directory', desc: 'Initial $HOME working directory upon login.' },
  { val: '/bin/bash', label: 'Login Shell', desc: 'Program launched on login (/usr/sbin/nologin for pseudo-users).' },
];

export const ConfigCronPamVisualizer: React.FC = () => {
  const [tab, setTab] = useState<'pam' | 'cron' | 'passwd'>('pam');

  // PAM Simulator state (mirrors Fig 7-4; pam_deny.so unconditionally fails in real PAM)
  const [rules, setRules] = useState<PamRule[]>([
    { id: 1, module: 'pam_env.so', control: 'required', passes: true },
    { id: 2, module: 'pam_unix.so (local password)', control: 'sufficient', passes: false },
    { id: 3, module: 'pam_ldap.so (directory)', control: 'sufficient', passes: true },
    { id: 4, module: 'pam_deny.so (always fails)', control: 'requisite', passes: false },
  ]);

  // Cron simulator state (mirrors Fig 7-3)
  const [cronMin, setCronMin] = useState('30');
  const [cronHour, setCronHour] = useState('2');
  const [cronDom, setCronDom] = useState('*');
  const [cronMon, setCronMon] = useState('*');
  const [cronDow, setCronDow] = useState('0');

  // Evaluate PAM stack strictly per Figure 7-4 semantics
  const evaluatePam = () => {
    let priorRequiredFailed = false;
    let verdict: 'GRANTED' | 'DENIED' = 'GRANTED';
    const trace: Array<{ id: number; status: 'EXECUTED' | 'SKIPPED'; note: string }> = [];
    let halted = false;

    for (const r of rules) {
      if (halted) {
        trace.push({ id: r.id, status: 'SKIPPED', note: 'Skipped (stack already terminated)' });
        continue;
      }
      if (r.control === 'requisite') {
        if (!r.passes) {
          verdict = 'DENIED';
          halted = true;
          trace.push({ id: r.id, status: 'EXECUTED', note: 'FAIL -> Immediate DENY (aborts stack)' });
        } else {
          trace.push({ id: r.id, status: 'EXECUTED', note: 'PASS -> Continue to next rule' });
        }
      } else if (r.control === 'required') {
        if (!r.passes) {
          priorRequiredFailed = true;
          trace.push({ id: r.id, status: 'EXECUTED', note: 'FAIL -> Recorded (continues remaining rules)' });
        } else {
          trace.push({ id: r.id, status: 'EXECUTED', note: 'PASS -> Continue to next rule' });
        }
      } else if (r.control === 'sufficient') {
        if (r.passes && !priorRequiredFailed) {
          verdict = 'GRANTED';
          halted = true;
          trace.push({ id: r.id, status: 'EXECUTED', note: 'PASS (no prior required failures) -> Immediate GRANT' });
        } else if (r.passes && priorRequiredFailed) {
          trace.push({ id: r.id, status: 'EXECUTED', note: 'PASS ignored because an earlier required rule failed' });
        } else {
          trace.push({ id: r.id, status: 'EXECUTED', note: 'FAIL ignored (sufficient failure is non-fatal)' });
        }
      } else {
        trace.push({ id: r.id, status: 'EXECUTED', note: r.passes ? 'PASS (optional)' : 'FAIL (optional, ignored)' });
      }
    }
    if (!halted) {
      verdict = priorRequiredFailed ? 'DENIED' : 'GRANTED';
    }
    return { verdict, trace };
  };

  const pamResult = evaluatePam();

  const describeCron = () => {
    const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = [
      '',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const mStr =
      cronMin === '*'
        ? 'every minute'
        : cronMin.startsWith('*/')
          ? `every ${cronMin.slice(2)} minutes`
          : `at minute :${cronMin.padStart(2, '0')}`;
    const hStr = cronHour === '*' ? 'of every hour' : `during hour ${cronHour.padStart(2, '0')}:00`;
    const monStr =
      cronMon === '*' ? 'every month' : `in ${monthNames[Number(cronMon)] ?? `month ${cronMon}`}`;

    let dayClause: string;
    if (cronDom !== '*' && cronDow !== '*') {
      const dowLabel = dowNames[Number(cronDow)] ?? `weekday ${cronDow}`;
      dayClause = `on day ${cronDom} of the month OR on every ${dowLabel} (Vixie cron applies OR when both day-of-month and day-of-week are restricted)`;
    } else if (cronDom !== '*') {
      dayClause = `on day ${cronDom} of the month`;
    } else if (cronDow !== '*') {
      dayClause = `every ${dowNames[Number(cronDow)] ?? `weekday ${cronDow}`}`;
    } else {
      dayClause = 'every day';
    }
    return `Runs ${mStr} ${hStr}, ${dayClause}, ${monStr}.`;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {tab === 'pam' ? (
            <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : tab === 'cron' ? (
            <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: PAM Rule Stack, Crontab &amp; /etc/passwd Inspector
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          {(
            [
              { id: 'pam', label: 'PAM Stack (Fig 7-4)' },
              { id: 'cron', label: 'Crontab (Fig 7-3)' },
              { id: 'passwd', label: '/etc/passwd (Fig 7-1)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                tab === t.id ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'pam' && (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Toggle each module’s control flag or PASS/FAIL result to observe PAM evaluation order:
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-mono font-bold border ${
                pamResult.verdict === 'GRANTED'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
              }`}
            >
              FINAL VERDICT: {pamResult.verdict}
            </span>
          </div>

          <div className="space-y-2">
            {rules.map((r, idx) => {
              const stepTrace = pamResult.trace[idx];
              return (
                <div
                  key={r.id}
                  className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-3 text-xs ${
                    stepTrace.status === 'SKIPPED'
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/30 opacity-60'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="text-slate-400">#{r.id}</span>
                    <select
                      value={r.control}
                      onChange={(e) => {
                        const val = e.target.value as PamControl;
                        setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, control: val } : x)));
                      }}
                      className="rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-sky-700 dark:text-sky-400"
                    >
                      <option value="required">required</option>
                      <option value="requisite">requisite</option>
                      <option value="sufficient">sufficient</option>
                      <option value="optional">optional</option>
                    </select>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{r.module}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">{stepTrace.note}</span>
                    <button
                      type="button"
                      disabled={r.module.startsWith('pam_deny.so')}
                      title={
                        r.module.startsWith('pam_deny.so')
                          ? 'In real Linux PAM, pam_deny.so unconditionally returns FAIL as a catch-all guard.'
                          : 'Toggle module PASS/FAIL outcome'
                      }
                      onClick={() =>
                        setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, passes: !x.passes } : x)))
                      }
                      className={`px-2.5 py-1 rounded font-mono font-semibold ${
                        r.module.startsWith('pam_deny.so') ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                      } ${
                        r.passes
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {r.passes ? 'PASS' : 'FAIL'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'cron' && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Minute (0-59)', val: cronMin, set: setCronMin, opts: ['0', '15', '30', '*/15', '*'] },
              { label: 'Hour (0-23)', val: cronHour, set: setCronHour, opts: ['0', '2', '6', '12', '*'] },
              { label: 'Day of Month', val: cronDom, set: setCronDom, opts: ['*', '1', '15'] },
              { label: 'Month (1-12)', val: cronMon, set: setCronMon, opts: ['*', '1', '3', '6', '12'] },
              { label: 'Day of Week (0=Sun)', val: cronDow, set: setCronDow, opts: ['*', '0', '1', '5'] },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {field.label}
                </label>
                <select
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 font-mono text-sm text-slate-900 dark:text-slate-100"
                >
                  {field.opts.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-slate-900 text-sky-300 font-mono text-sm">
            {cronMin} {cronHour} {cronDom} {cronMon} {cronDow} /usr/local/bin/backup.sh
          </div>
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{describeCron()}</div>
        </div>
      )}

      {tab === 'passwd' && (
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-900 text-emerald-300 font-mono text-xs sm:text-sm overflow-x-auto">
            juser:x:1000:1000:Brian Lab User:/home/juser:/bin/bash
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PASSWD_FIELDS.map((f, idx) => (
              <div
                key={f.label}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
              >
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Field {idx + 1}</div>
                <div className="font-mono text-sm font-bold text-sky-700 dark:text-sky-400 mt-0.5">{f.val}</div>
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1">{f.label}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
