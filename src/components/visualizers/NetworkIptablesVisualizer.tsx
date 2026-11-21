import React, { useState } from 'react';
import { Network, ShieldAlert, Server, Plus } from 'lucide-react';

interface NetVisProps {
  mode: 'network_iptables' | 'socket_accept_fork';
}

const ROUTES = [
  { prefix: '10.23.2.0', len: 24, via: 'Direct LAN (dev eth0, ARP lookup)', mask: 0xffffff00, net: 0x0a170200 },
  { prefix: '10.23.0.0', len: 16, via: 'Corporate router via 10.23.2.254', mask: 0xffff0000, net: 0x0a170000 },
  { prefix: '172.17.0.0', len: 16, via: 'Docker bridge (dev docker0)', mask: 0xffff0000, net: 0xac110000 },
  { prefix: '0.0.0.0', len: 0, via: 'Default Gateway via 10.23.2.1 (Internet)', mask: 0x00000000, net: 0x00000000 },
];

function ipToInt(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = ((n << 8) | v) >>> 0;
  }
  return n;
}

export const NetworkIptablesVisualizer: React.FC<NetVisProps> = ({ mode }) => {
  // Ch 9 state
  const [ch9Tab, setCh9Tab] = useState<'routes' | 'iptables'>('routes');
  const [destIp, setDestIp] = useState('10.23.2.132');

  // iptables tracer state (mirrors Figs 9-6 & 9-7)
  const [pktOrigin, setPktOrigin] = useState<'incoming_local' | 'incoming_routed' | 'local_outbound'>('incoming_local');
  const [pktPort, setPktPort] = useState<number>(22);
  const [allowHttp, setAllowHttp] = useState(true);
  const [defaultDrop, setDefaultDrop] = useState(true);

  // Ch 10 accept/fork server state (mirrors Fig 10-1)
  const [clients, setClients] = useState<Array<{ id: number; srcPort: number; childPid: number }>>([
    { id: 1, srcPort: 51204, childPid: 1415 },
  ]);

  if (mode === 'socket_accept_fork') {
    const spawnClient = () => {
      if (clients.length >= 4) return;
      const nextId = (clients[clients.length - 1]?.id ?? 0) + 1;
      setClients((prev) => [
        ...prev,
        { id: nextId, srcPort: 51200 + nextId * 17, childPid: 1414 + nextId },
      ]);
    };

    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Interactive Lab: Concurrent Server accept() / fork() Socket Model (Figure 10-1)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={spawnClient}
              disabled={clients.length >= 4}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Incoming Client
            </button>
            <button
              type="button"
              onClick={() => setClients([{ id: 1, srcPort: 51204, childPid: 1415 }])}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-5 p-4 rounded-lg border border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 space-y-2">
            <div className="font-mono text-xs font-bold text-sky-800 dark:text-sky-300">
              Parent Daemon: sshd (PID 712)
            </div>
            <div className="text-xs font-mono text-slate-700 dark:text-slate-300">
              Listening Socket: TCP 0.0.0.0:22 (LISTEN)
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stays in an infinite <code className="font-mono">accept()</code> loop. Whenever a TCP handshake completes, it calls <code className="font-mono">fork()</code> so a dedicated child serves the client while PID 712 immediately accepts the next client.
            </p>
          </div>

          <div className="md:col-span-7 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Forked Child Workers ({clients.length} active connections)
            </div>
            {clients.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2 font-mono text-xs"
              >
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">PID {c.childPid}</span>
                  <span className="text-slate-500 ml-2">
                    10.23.2.4:22 &lt;-&gt; 10.23.2.{14 + c.id}:{c.srcPort} (ESTABLISHED)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setClients((prev) => prev.filter((x) => x.id !== c.id))}
                  className="text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ch 9 Route matcher
  const parsedIp = ipToInt(destIp);
  const matchedRoutes =
    parsedIp === null
      ? []
      : ROUTES.filter((r) => ((parsedIp & r.mask) >>> 0) === r.net).sort((a, b) => b.len - a.len);
  const winningRoute = matchedRoutes[0] ?? null;

  // iptables evaluation
  const chainName =
    pktOrigin === 'incoming_local' ? 'INPUT' : pktOrigin === 'incoming_routed' ? 'FORWARD' : 'OUTPUT';
  let iptablesVerdict: 'ACCEPT' | 'DROP' = 'ACCEPT';
  let matchedRuleDesc = '';

  if (chainName === 'OUTPUT') {
    iptablesVerdict = 'ACCEPT';
    matchedRuleDesc = 'OUTPUT default policy ACCEPT (local process traffic permitted)';
  } else if (chainName === 'FORWARD') {
    iptablesVerdict = defaultDrop ? 'DROP' : 'ACCEPT';
    matchedRuleDesc = defaultDrop
      ? 'No FORWARD allow rule matched -> default policy DROP'
      : 'FORWARD default policy ACCEPT';
  } else {
    if (pktPort === 22) {
      iptablesVerdict = 'ACCEPT';
      matchedRuleDesc = 'Rule #2 matched: ACCEPT tcp dpt:22 (SSH)';
    } else if (pktPort === 80 && allowHttp) {
      iptablesVerdict = 'ACCEPT';
      matchedRuleDesc = 'Rule #3 matched: ACCEPT tcp dpt:80 (HTTP)';
    } else {
      iptablesVerdict = defaultDrop ? 'DROP' : 'ACCEPT';
      matchedRuleDesc = defaultDrop
        ? `No INPUT rule matched tcp dpt:${pktPort} -> default policy DROP`
        : `No rule matched -> default policy ACCEPT`;
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {ch9Tab === 'routes' ? (
            <Network className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          )}
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
            Interactive Lab: Longest-Prefix Route Matcher &amp; iptables Packet Tracer
          </h4>
        </div>
        <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-950">
          <button
            type="button"
            onClick={() => setCh9Tab('routes')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              ch9Tab === 'routes' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Routing Table (Fig 9-2)
          </button>
          <button
            type="button"
            onClick={() => setCh9Tab('iptables')}
            className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
              ch9Tab === 'iptables' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            iptables Chains (Figs 9-6 &amp; 9-7)
          </button>
        </div>
      </div>

      {ch9Tab === 'routes' ? (
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination IPv4:
            </label>
            <input
              type="text"
              value={destIp}
              onChange={(e) => setDestIp(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-sm text-slate-900 dark:text-slate-100 w-44"
              placeholder="e.g. 10.23.2.132"
            />
            <div className="flex flex-wrap gap-1.5">
              {['10.23.2.132', '10.23.9.5', '172.17.0.2', '8.8.8.8'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setDestIp(sample)}
                  className="px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-400 cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {ROUTES.map((r) => {
              const isMatch = matchedRoutes.some((m) => m.prefix === r.prefix && m.len === r.len);
              const isWinner = winningRoute && winningRoute.prefix === r.prefix && winningRoute.len === r.len;
              return (
                <div
                  key={`${r.prefix}/${r.len}`}
                  className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 ${
                    isWinner
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100'
                      : isMatch
                        ? 'border-sky-300 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-950/20 text-slate-700 dark:text-slate-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="font-bold">
                      {r.prefix}/{r.len}
                    </span>
                    <span className="ml-3 font-sans">{r.via}</span>
                  </div>
                  <span className="text-[11px] font-bold">
                    {isWinner ? '● SELECTED (LONGEST PREFIX)' : isMatch ? 'matches (less specific)' : 'no match'}
                  </span>
                </div>
              );
            })}
            {parsedIp === null && (
              <div className="text-rose-600 dark:text-rose-400 font-sans text-xs">
                Enter a valid dotted-quad IPv4 address (e.g., 10.23.2.132).
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="lg:col-span-6 p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">1. Packet Direction</div>
              <div className="grid grid-cols-1 gap-1.5">
                {(
                  [
                    { id: 'incoming_local', label: 'Network -> Addressed to THIS host (INPUT chain)' },
                    { id: 'incoming_routed', label: 'Network -> Destined for ANOTHER host (FORWARD chain)' },
                    { id: 'local_outbound', label: 'Local process -> Outbound to network (OUTPUT chain)' },
                  ] as const
                ).map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setPktOrigin(o.id)}
                    className={`px-3 py-2 text-xs text-left rounded-lg border cursor-pointer ${
                      pktOrigin === o.id
                        ? 'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">TCP Destination Port:</span>
              {[22, 80, 443, 3306].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPktPort(p)}
                  className={`px-2.5 py-1 font-mono rounded border cursor-pointer ${
                    pktPort === p ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  :{p}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={allowHttp} onChange={(e) => setAllowHttp(e.target.checked)} className="rounded text-sky-600" />
                Enable INPUT rule: <code className="font-mono">ACCEPT tcp --dport 80</code>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={defaultDrop} onChange={(e) => setDefaultDrop(e.target.checked)} className="rounded text-sky-600" />
                Set INPUT/FORWARD default policy to <code className="font-mono">DROP</code>
              </label>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 bg-slate-50/40 dark:bg-slate-950/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                Active Chain: {chainName}
              </span>
              <span
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  iptablesVerdict === 'ACCEPT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                VERDICT: {iptablesVerdict}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
              {matchedRuleDesc}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Mirrors Figures 9-6 &amp; 9-7: Routing happens BEFORE INPUT/FORWARD selection, and each chain stops at the first matching rule.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
