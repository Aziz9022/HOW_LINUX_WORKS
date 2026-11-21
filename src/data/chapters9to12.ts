import { ChapterModule } from './types';

export const CHAPTERS_9_TO_12: ChapterModule[] = [
  {
    number: 9,
    id: 'ch-9',
    part: 'Part II: Core System Internals',
    title: 'Understanding Your Network and Its Configuration',
    subtitle: 'IPv4/IPv6, Subnets, Routing Tables, ARP, DNS, TCP/UDP, NAT, and iptables Firewalls',
    sectionRange: '9.1 – 9.28 (9.11 restored from chapter body)',
    status: 'VALIDATED',
    estimatedMinutes: 65,
    prerequisites: [6, 7],
    overview:
      'Chapter 9 is the cornerstone networking chapter of How Linux Works. It builds the entire TCP/IP stack from the ground up: packets and layers, IPv4 CIDR subnets and IPv6 structure, longest-prefix routing decisions, ARP and Ethernet MAC addresses, DNS and DHCP, TCP/UDP transport, Network Address Translation (NAT), and packet filtering with iptables chains (INPUT, FORWARD, OUTPUT).',
    learningObjectives: [
      'Calculate IPv4 subnet masks, network prefixes (CIDR), and determine whether two hosts share a local subnet.',
      'Trace how the Linux kernel selects a next hop using longest-prefix matching in the routing table (ip route).',
      'Explain TCP reliable ordered delivery (ports, segments, acknowledgments) vs. UDP datagrams, plus ARP and DNS resolution.',
      'Trace incoming, forwarded, and locally generated packets through iptables INPUT, FORWARD, and OUTPUT chains.',
    ],
    visualizerId: 'network_iptables',
    visualizerTitle: 'Interactive IPv4 Subnet/Route Matcher & iptables Packet Chain Tracer',
    sections: [
      {
        id: 'ch9-9.1',
        number: '9.1–9.10',
        title: 'Network Layers, IPv4/IPv6 Addressing, Subnets, Routing & ICMP',
        subsections: [
          '9.1 Network Basics & 9.2 Packets (Figure 9-1)',
          '9.3 Network Layers (Physical, Network/IP, Transport/TCP-UDP, Application)',
          '9.4 The Internet Layer: IPv4 Addresses, Subnets & CIDR (Figure 9-2, Table 9-1)',
          '9.5 Routes and the Kernel Routing Table (ip route, Default Gateway)',
          '9.6–9.10 IPv6 Structure (Figure 9-3), Basic ICMP/DNS Tools (ping, traceroute, host)',
        ],
        bookGroundedSummary:
          'Networks move data in discrete packets across layered protocols (Figure 9-1). Every IPv4 address pairs a host identifier with a subnet prefix (Figure 9-2), and the kernel’s routing table uses longest-prefix matching to decide whether to deliver directly on the LAN or forward to a gateway router.',
        detailedExplanation: [
          'In a typical LAN (Figures 9-1 & 9-2), hosts like `10.23.2.4` and `10.23.2.132` share subnet `10.23.2.0/24` (netmask `255.255.255.0`), while the router (`10.23.2.1`) connects them to external networks. CIDR notation `/24` states that the first 24 bits identify the network and the remaining 8 bits identify hosts.',
          'When sending a packet to destination IP `D`, the Linux kernel scans its routing table (`ip route show`) for all matching network prefixes and picks the **most specific (longest prefix)** match. If no specific subnet matches, the packet falls back to the `default` (`0.0.0.0/0`) route pointing to your gateway router.',
          'IPv6 expands addresses from 32 bits to 128 bits written in 8 colon-separated hexadecimal groups (Figure 9-3): typically a 64-bit network/subnet prefix followed by a 64-bit interface identifier.',
          'Diagnostic sequence taught by the book: verify local interface (`ip addr`), inspect routes (`ip route`), test local gateway reachability (`ping`), check DNS resolution (`host` / `dig`), and trace hops (`traceroute`).',
        ],
        figureIds: ['fig-9-1', 'fig-9-2', 'fig-9-3'],
        table: {
          id: 'table-9-1',
          number: 'Table 9-1',
          title: 'Common IPv4 Subnet Masks & CIDR Notation',
          headers: ['CIDR', 'Netmask', 'Host Bits', 'Usable Host Addresses'],
          rows: [
            ['/8', '255.0.0.0', '24', '16,777,214'],
            ['/16', '255.255.0.0', '16', '65,534'],
            ['/24', '255.255.255.0', '8', '254'],
            ['/25', '255.255.255.128', '7', '126'],
            ['/32', '255.255.255.255', '0', '1 (single host route)'],
          ],
        },
      },
      {
        id: 'ch9-9.11',
        number: '9.11–9.22',
        title: 'Network Interfaces, Physical Layer, ARP, DHCP, DNS & Transport (TCP/UDP)',
        subsections: [
          '9.11 Introduction to Network Interface Configuration (restored from body)',
          '9.12–9.17 Manual & Boot-Time Configuration, NetworkManager, Hostname Resolution (/etc/hosts, /etc/resolv.conf, nsswitch.conf)',
          '9.18 Localhost (127.0.0.1 / lo)',
          '9.19–9.22 Transport Layer: TCP (Figure 9-4), UDP, Ports & Services (/etc/services)',
          '9.23–9.24 Physical Layer, Ethernet MAC Addresses, ARP (ip neigh) & Routers (Figure 9-5)',
        ],
        bookGroundedSummary:
          'Ethernet delivers frames locally using hardware MAC addresses discovered via ARP, while TCP provides reliable ordered byte streams across ports (Figure 9-4) and routers stitch distinct subnets together (Figure 9-5).',
        detailedExplanation: [
          'IP addresses route packets globally across routers (Figure 9-5), but on a single Ethernet/Wi-Fi segment, frames must be addressed to a 48-bit hardware MAC address. When Host A wants to reach `10.23.2.1` on its own LAN, it broadcasts an **ARP** ("Who has 10.23.2.1?") request and caches the MAC reply (inspectable via `ip neigh` or `arp -n`).',
          'At the transport layer, **TCP** establishes a stateful connection (three-way handshake: SYN -> SYN-ACK -> ACK), divides data into numbered segments, retransmits lost packets, and delivers an ordered byte stream to applications identified by 16-bit port numbers (Figure 9-4). **UDP** sends lightweight connectionless datagrams without retransmission (used by DNS, DHCP, streaming).',
          'Hostname lookup follows `/etc/nsswitch.conf` (`hosts: files dns`), checking `/etc/hosts` first and then querying DNS resolvers listed in `/etc/resolv.conf` (or local `systemd-resolved`).',
        ],
        figureIds: ['fig-9-4', 'fig-9-5'],
        sourceNotes: [
          'Source Audit Note: Heading 9.11 ("Introduction to Network Interface Configuration") exists in the body HTML but was omitted from the Calibre TOC; restored here.',
        ],
      },
      {
        id: 'ch9-9.25',
        number: '9.25–9.28',
        title: 'Firewalls (iptables & nftables), NAT, Masquerading & Wireless',
        subsections: [
          '9.25 Firewalls (iptables Chains, INPUT/FORWARD/OUTPUT, Figures 9-6 & 9-7)',
          '9.26 Network Address Translation (NAT) and IP Masquerading',
          '9.27 Wireless Ethernet & 9.28 Summary',
        ],
        bookGroundedSummary:
          'Linux’s Netfilter framework filters packets through ordered rule chains: incoming packets destined for the host traverse INPUT, packets routed across interfaces traverse FORWARD (Figure 9-6), and locally originated packets traverse OUTPUT (Figure 9-7).',
        detailedExplanation: [
          'Follow Figures 9-6 and 9-7 carefully: when an external packet arrives at a network interface, the kernel first makes a routing decision. If the destination IP belongs to THIS host, the packet enters the **INPUT** chain; if it is destined for another network (and `net.ipv4.ip_forward=1`), it enters the **FORWARD** chain. Packets generated by a local process skip INPUT and traverse **OUTPUT**.',
          'Within each chain, rules are evaluated **top-to-bottom**, and the FIRST matching rule determines the verdict (`ACCEPT`, `DROP` silently, or `REJECT` with ICMP error). If no rule matches, the chain’s default policy applies.',
          'Because IPv4 addresses are scarce, routers perform **NAT / IP Masquerading**: rewriting private RFC 1918 source addresses (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) to the router’s single public IP and tracking port mappings in a state table so return packets reach the right internal host.',
        ],
        figureIds: ['fig-9-6', 'fig-9-7'],
        codeExamples: [
          {
            title: 'Inspecting interfaces, routes, and iptables filter chains',
            command: 'ip -4 addr show eth0 && ip route show && iptables -L -n -v',
            output: `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.23.2.4/24 brd 10.23.2.255 scope global eth0
default via 10.23.2.1 dev eth0
10.23.2.0/24 dev eth0 proto kernel scope link src 10.23.2.4
Chain INPUT (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22`,
            explanation:
              'Here INPUT defaults to DROP, permits established return traffic first, and explicitly allows incoming TCP port 22 (SSH).',
          },
        ],
        supplementalNote:
          'Modern Linux distributions increasingly use `nftables` (`nft list ruleset`) as the successor to `iptables`—as Brian Ward notes in Section 9.25.1—though `iptables` commands often remain available via the `iptables-nft` compatibility layer.',
      },
    ],
    glossary: [
      { term: 'CIDR & Longest-Prefix Match', definition: 'Classless Inter-Domain Routing (/N mask); routers pick the route with the largest matching prefix length N.', sectionRef: '9.4–9.5' },
      { term: 'ARP (Address Resolution Protocol)', definition: 'LAN protocol mapping an IPv4 address to its link-layer Ethernet MAC address.', sectionRef: '9.23' },
      { term: 'iptables Filter Chains', definition: 'Ordered Netfilter rule lists: INPUT (to local host), FORWARD (routed through host), OUTPUT (from local host).', sectionRef: '9.25' },
      { term: 'NAT / Masquerading', definition: 'Translating private LAN IPv4 addresses/ports to a router’s public IP for outbound internet access.', sectionRef: '9.26' },
    ],
    terminalLab: {
      intro: 'Inspect network interfaces, routing tables, DNS lookups, and firewall rules in the simulated Linux network stack.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch9-t1',
          title: 'Inspect IPv4 addresses and routes',
          instruction: 'View the host’s IP address and routing table using ip addr and ip route.',
          hint: 'Run ip route',
          expectedPattern: '^ip\\s+(addr|a|route|r)',
          commandExplanation: 'iproute2 (`ip addr`, `ip route`, `ip neigh`) is the modern Linux interface to the kernel network stack.',
          sampleCommand: 'ip route',
        },
        {
          id: 'ch9-t2',
          title: 'Test DNS lookup and gateway reachability',
          instruction: 'Ping the default gateway 10.23.2.1 or resolve a hostname with host.',
          hint: 'Run ping -c 2 10.23.2.1',
          expectedPattern: '^(ping|host)\\b',
          commandExplanation: 'ping sends ICMP Echo Requests to verify IP-layer connectivity; host queries DNS records.',
          sampleCommand: 'ping -c 2 10.23.2.1',
        },
        {
          id: 'ch9-t3',
          title: 'Inspect iptables firewall rules',
          instruction: 'Display the numeric iptables filter table using iptables -L -n.',
          hint: 'Run iptables -L -n',
          expectedPattern: '^iptables\\s+-L',
          commandExplanation: '-L lists chains (INPUT, FORWARD, OUTPUT); -n skips slow reverse DNS lookups.',
          sampleCommand: 'iptables -L -n',
        },
      ],
    },
    assessments: [
      {
        id: 'ch9-q1',
        type: 'scenario',
        sectionRef: '9.5',
        prompt: 'A Linux host has routes: `default via 10.23.2.1`, `10.23.0.0/16 via 10.23.2.254`, and `10.23.2.0/24 dev eth0`. Which route does the kernel choose for a packet addressed to `10.23.2.88`?',
        options: [
          'default via 10.23.2.1',
          '10.23.0.0/16 via 10.23.2.254',
          '10.23.2.0/24 dev eth0 (direct LAN delivery)',
          'The packet is dropped due to route ambiguity.',
        ],
        correctOptionIndex: 2,
        hint: 'All three routes match 10.23.2.88—apply longest-prefix matching (/24 vs /16 vs /0).',
        explanation: '/24 is more specific than /16 and /0, so the kernel delivers directly onto eth0 using ARP.',
      },
      {
        id: 'ch9-q2',
        type: 'mcq',
        sectionRef: '9.25',
        prompt: 'According to Figures 9-6 and 9-7, which iptables filter chain processes an incoming packet from eth0 whose destination IP belongs to a DIFFERENT server behind this Linux router?',
        options: ['INPUT', 'FORWARD', 'OUTPUT', 'LOCAL'],
        correctOptionIndex: 1,
        hint: 'Packets arriving on one interface to be routed out another never enter local processes.',
        explanation: 'Packets routed through a Linux box traverse the FORWARD chain; INPUT is only for packets addressed to the host itself.',
      },
      {
        id: 'ch9-q3',
        type: 'true_false',
        sectionRef: '9.25',
        prompt: 'True or False: In an iptables chain, if Rule #1 is ACCEPT and Rule #2 is DROP for the same TCP port, iptables evaluates all rules and applies the strictest one (DROP).',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'How does rule evaluation order work in an iptables chain?',
        explanation: 'False. iptables stops on the FIRST matching terminating target (ACCEPT/DROP/REJECT). Rule order is critical.',
      },
      {
        id: 'ch9-q4',
        type: 'fill_blank',
        sectionRef: '9.23',
        prompt: 'Which protocol resolves an IPv4 address on the local Ethernet segment to a 48-bit hardware MAC address?',
        acceptedAnswers: ['arp', 'address resolution protocol'],
        hint: 'Three-letter acronym.',
        explanation: 'ARP (Address Resolution Protocol) discovers MAC addresses for local-subnet IPv4 destinations.',
      },
    ],
    flashcards: [
      {
        id: 'fc-9-1',
        chapterNumber: 9,
        sectionRef: '9.25',
        front: 'Distinguish iptables INPUT, FORWARD, and OUTPUT chains (Figures 9-6 & 9-7).',
        back: 'INPUT: incoming packets addressed to this host\nFORWARD: incoming packets routed onward to another host\nOUTPUT: packets generated by local processes on this host',
        tags: ['iptables', 'firewall'],
      },
      {
        id: 'fc-9-2',
        chapterNumber: 9,
        sectionRef: '9.4',
        front: 'How many usable host addresses exist in a /24 IPv4 subnet (255.255.255.0)?',
        back: '254 (2^8 = 256 total minus 1 network address .0 and 1 broadcast address .255).',
        tags: ['networking', 'cidr'],
      },
    ],
    keyTakeaways: [
      'IPv4 CIDR prefixes define subnet membership; kernel routing always picks the longest-prefix match.',
      'ARP bridges IPv4 addresses to Ethernet MAC addresses on local links; routers connect separate subnets.',
      'TCP guarantees ordered, reliable streams across ports; UDP sends fast connectionless datagrams.',
      'iptables evaluates INPUT, FORWARD, and OUTPUT chains top-to-bottom on first match.',
    ],
  },

  {
    number: 10,
    id: 'ch-10',
    part: 'Part II: Core System Internals',
    title: 'Network Applications and Services',
    subtitle: 'Server Socket Architecture (accept/fork), SSH, Diagnostics (lsof, ss/netstat, tcpdump), and Security',
    sectionRange: '10.1 – 10.10',
    status: 'VALIDATED',
    estimatedMinutes: 45,
    prerequisites: [8, 9],
    overview:
      'Chapter 10 moves up to the application layer to explain how real Linux network servers listen for and scale client connections (accept/fork, sockets), how OpenSSH authenticates and encrypts traffic, and how to diagnose listening services and live wire traffic with lsof, netstat/ss, tcpdump, and nmap.',
    learningObjectives: [
      'Trace how a network daemon binds a listening socket, accepts client connections, and spawns worker processes or threads.',
      'Explain OpenSSH host keys, client public-key authentication, and SSH port forwarding.',
      'Inspect listening TCP/UDP ports and established connections using lsof -i and netstat/ss.',
      'Explain how tcpdump captures live packets and apply practical host-hardening practices.',
    ],
    visualizerId: 'socket_accept_fork',
    visualizerTitle: 'Interactive Concurrent Server Socket (listen / accept / fork) Visualizer',
    sections: [
      {
        id: 'ch10-10.1',
        number: '10.1–10.4',
        title: 'Basics of Network Services, accept()/fork() Servers, SSH & Diagnostics',
        subsections: [
          '10.1 The Basics of Services (Listening Sockets, accept/fork, Figure 10-1)',
          '10.2 A Closer Look (Web Servers, HTTP)',
          '10.3 Secure Shell (SSH: sshd, Host Keys, ~/.ssh/authorized_keys, scp, Tunneling)',
          '10.4 Pre-systemd Network Connection Servers (inetd/xinetd) & systemd Socket Activation',
        ],
        bookGroundedSummary:
          'Network servers listen on a well-known port and handle concurrent clients using patterns like the classic accept()/fork() loop (Figure 10-1). OpenSSH exemplifies secure remote administration via asymmetric keys and encrypted channels.',
        detailedExplanation: [
          'Look at Figure 10-1: A parent server process (such as `sshd`) creates a listening socket bound to TCP port 22. When Client 1 connects, `accept()` returns a brand-new dedicated connection socket, and the server calls `fork()` (building directly on Chapter 1’s process creation model) so a child process handles Client 1 while the parent immediately loops back to `accept()` Client 2!',
          'OpenSSH protects both directions of trust: (1) **Host keys** (`/etc/ssh/ssh_host_*`, verified against `~/.ssh/known_hosts`) prove you are talking to the genuine server and prevent man-in-the-middle attacks; (2) **User public-key authentication** matches your private key (`~/.ssh/id_ed25519` or `id_rsa`, mode `600`) against public keys listed in the server’s `~/.ssh/authorized_keys`.',
          'Because SSH encrypts an entire session, it can tunnel arbitrary TCP ports safely across untrusted networks: local forwarding (`ssh -L 8080:internal-db:80 bastion`) exposes a remote service on your laptop’s localhost port 8080, while remote forwarding (`ssh -R ...`) exposes a local service on the remote host.',
        ],
        figureIds: ['fig-10-1'],
      },
      {
        id: 'ch10-10.5',
        number: '10.5–10.10',
        title: 'Diagnostic Tools (lsof, netstat/ss, tcpdump), Sockets, RPC & Network Security',
        subsections: [
          '10.5 Diagnostic Tools (lsof -i, netstat -ntulp / ss, tcpdump, nmap, Tables 10-1 to 10-3)',
          '10.6 Remote Procedure Call (RPC)',
          '10.7 Network Security (Defense in Depth, Least Exposure)',
          '10.8–10.10 Looking Forward, Unix Domain Sockets & Socket Layers',
        ],
        bookGroundedSummary:
          'Diagnosing network applications combines three viewpoints: local socket/process bindings (lsof -i, netstat/ss), raw packets on the wire (tcpdump), and external port reachability (nmap), plus Unix domain sockets for fast local IPC.',
        detailedExplanation: [
          '`lsof -i` and `netstat -ntulp` (or modern `ss -ntulp`) map every listening port and established TCP connection directly to its owning PID and program name. Adding `-n` prevents reverse DNS delays and shows raw numeric IPs and ports.',
          '`tcpdump` captures and decodes raw packets directly from a network interface using BPF filter expressions—for example `tcpdump -ni eth0 -c 20 "tcp port 80 and host 10.23.2.15"`. Watching live packets lets you immediately separate firewall drops (SYN arrives, no SYN-ACK leaves) from closed ports (TCP RST) or routing problems (no packet arrives at all).',
          'For local inter-process communication on the same host (e.g., systemd, D-Bus in Chapter 14, or the Docker daemon `/var/run/docker.sock` in Chapter 17), Linux uses **Unix domain sockets**—special filesystem entries governed by standard Chapter 2 file permissions without TCP/IP header overhead.',
        ],
        table: {
          id: 'table-10-1',
          number: 'Table 10-1',
          title: 'Essential Network Application Diagnostic Tools',
          headers: ['Tool', 'Primary Role', 'Common Invocation'],
          rows: [
            ['lsof -i', 'Map open network sockets to processes/PIDs', 'lsof -nP -iTCP -sTCP:LISTEN'],
            ['netstat / ss', 'Inspect listening ports, connections & socket states', 'ss -ntulp  (book classic: netstat -ntulp)'],
            ['tcpdump', 'Capture & filter live packets on an interface', 'tcpdump -ni eth0 port 22'],
            ['nmap', 'Scan open ports from a remote or local vantage', 'nmap -sT 10.23.2.4'],
          ],
        },
        supplementalNote:
          'While Chapter 10 demonstrates `netstat` (from `net-tools`), most modern Linux distributions ship `ss` (from `iproute2`) by default with nearly identical flags (`ss -ntulp`).',
      },
    ],
    glossary: [
      { term: 'Listening Socket', definition: 'A server socket bound to an IP and port waiting in LISTEN state for incoming client connections via accept().', sectionRef: '10.1' },
      { term: 'Unix Domain Socket', definition: 'Local-only IPC socket represented as a filesystem path (e.g., /run/docker.sock) protected by standard file permissions.', sectionRef: '10.9' },
      { term: 'SSH Host Key', definition: 'Cryptographic key pair identifying an SSH server, cached by clients in ~/.ssh/known_hosts to detect impersonation.', sectionRef: '10.3' },
    ],
    terminalLab: {
      intro: 'Inspect listening TCP/UDP services and active network sockets in the simulated host.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch10-t1',
          title: 'List listening sockets and owning processes',
          instruction: 'Run ss -ntulp (or netstat -ntulp) to see which daemons are listening on which ports.',
          hint: 'Run ss -ntulp',
          expectedPattern: '^(ss|netstat)\\b',
          commandExplanation: '-n numeric, -t TCP, -u UDP, -l listening, -p process name/PID.',
          sampleCommand: 'ss -ntulp',
        },
        {
          id: 'ch10-t2',
          title: 'Use lsof to inspect open network connections',
          instruction: 'Run lsof -i to view processes with open IPv4/IPv6 network sockets.',
          hint: 'Run lsof -i',
          expectedPattern: '^lsof\\s+.*-i',
          commandExplanation: 'lsof -i filters open files specifically to internet network sockets.',
          sampleCommand: 'lsof -i',
        },
      ],
    },
    assessments: [
      {
        id: 'ch10-q1',
        type: 'mcq',
        sectionRef: '10.1',
        prompt: 'In the classic concurrent server design shown in Figure 10-1, why does the server call fork() immediately after accept() returns?',
        options: [
          'To close the listening port so no other clients can connect.',
          'So a dedicated child process handles the newly accepted client connection while the parent immediately returns to accept() additional clients.',
          'Because TCP sockets cannot transmit data from a parent process.',
          'To force the kernel to flush DNS caches.',
        ],
        correctOptionIndex: 1,
        hint: 'Trace the parent and child paths in Figure 10-1.',
        explanation: 'Forking (or spawning a worker/event loop) keeps the parent free to accept new connections concurrently without blocking on a slow client.',
      },
      {
        id: 'ch10-q2',
        type: 'scenario',
        sectionRef: '10.3',
        prompt: 'When you connect to a server via SSH, you get a loud warning: `REMOTE HOST IDENTIFICATION HAS CHANGED!`. What triggered this check?',
        options: [
          'Your user password expired.',
          'The server’s public host key no longer matches the key previously recorded for that host in your ~/.ssh/known_hosts file.',
          'Port 22 was blocked by iptables.',
          'Your ~/.ssh/id_rsa permissions are 600.',
        ],
        correctOptionIndex: 1,
        hint: 'Recall the role of host keys vs. user keys in OpenSSH.',
        explanation: 'SSH compares the server’s presented host key against ~/.ssh/known_hosts; a mismatch indicates either an OS reinstall/key rotation or a potential man-in-the-middle attack.',
      },
      {
        id: 'ch10-q3',
        type: 'command_write',
        sectionRef: '10.5',
        prompt: 'Write the lsof command flag to restrict output exclusively to open network sockets (IPv4/IPv6).',
        acceptedAnswers: ['lsof -i', 'lsof -ni', 'lsof -nP -i'],
        hint: 'Single letter flag standing for "internet".',
        explanation: '`lsof -i` filters open descriptors exclusively to network sockets.',
      },
      {
        id: 'ch10-q4',
        type: 'true_false',
        sectionRef: '10.9',
        prompt: 'True or False: Unix domain sockets require an active Ethernet interface and IPv4 address to communicate between two local processes.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'How are Unix domain sockets addressed?',
        explanation: 'False. Unix domain sockets operate entirely inside the local kernel via filesystem paths and require no network hardware or IP stack.',
      },
    ],
    flashcards: [
      {
        id: 'fc-10-1',
        chapterNumber: 10,
        sectionRef: '10.3',
        front: 'What permissions must your private SSH key (~/.ssh/id_ed25519) have, and why?',
        back: '600 (-rw-------). OpenSSH refuses to use private keys readable by group or other users.',
        tags: ['ssh', 'security'],
      },
      {
        id: 'fc-10-2',
        chapterNumber: 10,
        sectionRef: '10.5',
        front: 'What do the flags in `ss -ntulp` (or `netstat -ntulp`) stand for?',
        back: '-n numeric (no DNS), -t TCP, -u UDP, -l listening sockets, -p show owning process/PID.',
        tags: ['diagnostics', 'networking'],
      },
    ],
    keyTakeaways: [
      'Concurrent daemons separate a persistent listening socket from per-client connection sockets (e.g., via accept()/fork()).',
      'OpenSSH verifies server identity with host keys and authenticates users securely with public-key cryptography.',
      'Combine ss/netstat/lsof (local bindings) with tcpdump (wire capture) to diagnose any network service issue.',
    ],
  },

  {
    number: 11,
    id: 'ch-11',
    part: 'Part III: Automation, Services & Tooling',
    title: 'Introduction to Shell Scripts',
    subtitle: 'Shebangs, Quoting, Exit Codes, Conditionals, Loops, Functions, sed/awk, and Safe Idioms',
    sectionRange: '11.1 – 11.14',
    status: 'VALIDATED',
    estimatedMinutes: 50,
    prerequisites: [2],
    overview:
      'Shell scripts glue together Linux’s rich ecosystem of small single-purpose utilities into repeatable automation. Chapter 11 covers how the kernel executes scripts via #!, quoting pitfalls that break filenames with spaces, exit codes ($?), conditionals and test operators, loops, subshells, functions, and text processors like sed, awk, and xargs.',
    learningObjectives: [
      'Explain how the kernel interprets the #! (shebang) line and why scripts need execute permission.',
      'Predict exact output under unquoted, double-quoted ("..."), and single-quoted (\'...\') shell expansions.',
      'Write reliable conditionals using exit codes ($?), [ ... ] test operators (Tables 11-1 to 11-3), and case/for/while loops.',
      'Avoid classic shell bugs: unquoted variables, subshell variable loss, insecure /tmp files (use mktemp), and knowing when to switch to Python.',
    ],
    visualizerId: 'shell_quoting',
    visualizerTitle: 'Interactive Shell Quoting, Variable & Glob Expansion Sandbox',
    sections: [
      {
        id: 'ch11-11.1',
        number: '11.1–11.6',
        title: 'Script Basics, Quoting, Positional Parameters, Exit Codes & Conditionals',
        subsections: [
          '11.1 Shell Script Basics (#!/bin/sh, chmod +x)',
          '11.2 Quoting and Literals (Single vs. Double Quotes, Escaping)',
          '11.3 Special Variables ($1, $#, $@, $?, $$)',
          '11.4 Exit Codes (0 = success, non-zero = failure)',
          '11.5 Conditionals (if/elif/else, [ ] test operators, Tables 11-1 to 11-3, case)',
        ],
        bookGroundedSummary:
          'When you run an executable script starting with `#!/bin/sh`, the kernel launches `/bin/sh` with your script path as an argument. Every command returns an integer exit code (0 = true/success, non-zero = false/failure) that drives shell control flow.',
        detailedExplanation: [
          'Always double-quote variable expansions (`"$var"`, `"$1"`, `"$@"`)! Leaving `$filename` unquoted causes word splitting on spaces and unexpected wildcard globbing if a filename contains `*` or `?`.',
          'In Bourne shell conditionals, `if` does NOT evaluate boolean expressions directly—it runs a command and takes the `then` branch if that command’s **exit status (`$?`) is 0**. The `[` in `if [ -f "$file" ]; then` is actually a command (synonym for `test`) whose final argument must be `]`!',
          'Be careful to distinguish string comparisons (`=`, `!=`) from numeric comparisons (`-eq`, `-ne`, `-lt`, `-gt`), and file tests (`-f` regular file, `-d` directory, `-e` exists, `-r`/`-w`/`-x` permissions).',
        ],
        table: {
          id: 'table-11-1',
          number: 'Tables 11-1 to 11-3',
          title: 'Essential Shell Test (`[ ]`) Operators',
          headers: ['Category', 'Operator', 'Meaning'],
          rows: [
            ['File tests', '-f / -d / -e', 'Exists and is regular file / directory / any type'],
            ['String tests', '= / != / -z / -n', 'Equal / Not equal / Empty string / Non-empty string'],
            ['Numeric tests', '-eq / -ne / -lt / -gt', 'Integer equal / not equal / less than / greater than'],
            ['Logical', '&& / || / !', 'Run next if previous succeeded (0) / failed (!=0) / negate'],
          ],
        },
      },
      {
        id: 'ch11-11.7',
        number: '11.7–11.14',
        title: 'Loops, Command Substitution, Subshells, Functions, sed/awk & When Not to Use Shell',
        subsections: [
          '11.6–11.7 Loops (for, while) & Command Substitution ($(...))',
          '11.8 Managing Temporary Files (mktemp, trap)',
          '11.9 Here Documents (<<EOF) & 11.10 Important Shell Script Utilities (basename, awk, sed, xargs)',
          '11.11 Subshells & 11.12 Including Files (. / source)',
          '11.13 Reading User Input & 11.14 When (Not) to Use Shell Scripts',
        ],
        bookGroundedSummary:
          'Powerful shell idioms combine $(...) command substitution, safe temporary files via mktemp + trap, pipelines with sed/awk/xargs, and clear boundaries for when a task belongs in Python or C instead.',
        detailedExplanation: [
          'Command substitution `$(command)` captures a command’s stdout into a string (preferred over legacy backticks `` `...` `` because it nests cleanly).',
          'Watch out for **subshells**: commands inside `( ... )` or stages of a pipeline run in a forked child shell, meaning variables assigned inside a subshell vanish when the subshell exits! For instance, `cat list.txt | while read line; do count=$((count+1)); done; echo "$count"` often prints an empty/zero value in POSIX `sh`/bash because the `while` loop ran in a piped subshell; redirect input instead (`while read -r line; do ...; done < list.txt`).',
          'Classic text-processing utilities in shell pipelines (Section 11.10): `sed` performs stream edits (`sed \'s/old/new/g\'`), `awk` extracts and aggregates whitespace-delimited columns (`awk \'{print $1, $3}\'`), `basename`/`dirname` manipulate paths cleanly, and `xargs` turns stdin lines into command arguments (pair `find ... -print0 | xargs -0` to survive spaces in filenames).',
          'Never hardcode predictable temporary filenames like `/tmp/myscript.tmp` (which invites symlink attacks and race conditions). Use `TMPFILE=$(mktemp)` paired with `trap \'rm -f "$TMPFILE"\' EXIT` so temporary files are unique and automatically cleaned up even on interruption.',
          'Know the shell’s limits (Section 11.14): shell scripts excel at orchestrating external commands and files, but once you need complex data structures, heavy arithmetic, JSON/binary parsing, or multi-hundred-line logic, switch to a general-purpose language like Python.',
        ],
        codeExamples: [
          {
            title: 'Safe quoting, mktemp, and exit-status check in a Bourne shell script',
            command: `#!/bin/sh
TMP=$(mktemp) || exit 1
trap 'rm -f "$TMP"' EXIT
for f in *.log; do
  [ -f "$f" ] && grep -c "ERROR" "$f" >> "$TMP"
done`,
            explanation:
              'Creates an atomic temp file, ensures cleanup via trap, quotes every expansion, and guards against an empty glob match with `[ -f "$f" ]`.',
          },
        ],
      },
    ],
    glossary: [
      { term: 'Shebang (#!)', definition: 'First-line header (e.g., #!/bin/sh) instructing the kernel which interpreter binary should execute the script.', sectionRef: '11.1' },
      { term: 'Exit Code ($?)', definition: 'Integer status returned by every command on termination: 0 denotes success (true); 1–255 denotes failure (false).', sectionRef: '11.4' },
      { term: 'Subshell', definition: 'A forked child shell environment (e.g., inside parentheses or a pipeline) whose variable and directory changes do not propagate back to the parent shell.', sectionRef: '11.11' },
    ],
    terminalLab: {
      intro: 'Test quoting, variable expansion, exit statuses, and text-processing pipelines in the simulated shell.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch11-t1',
          title: 'Compare single vs. double quotes',
          instruction: 'Run echo "$USER" and echo \'$USER\' to verify how single quotes suppress variable expansion.',
          hint: 'Run echo "$USER" && echo \'$USER\'',
          expectedPattern: 'echo.*\\$USER',
          commandExplanation: 'Double quotes expand $USER while preserving whitespace; single quotes print the literal characters $USER.',
          sampleCommand: 'echo "$USER" && echo \'$USER\'',
        },
        {
          id: 'ch11-t2',
          title: 'Inspect the last command’s exit status',
          instruction: 'Run echo $? after a command to inspect its numeric exit code.',
          hint: 'Run echo $?',
          expectedPattern: 'echo\\s+\\$\\?',
          commandExplanation: '$? holds 0 when the preceding command succeeded and a non-zero integer on failure.',
          sampleCommand: 'echo $?',
        },
      ],
    },
    assessments: [
      {
        id: 'ch11-q1',
        type: 'debug',
        sectionRef: '11.2',
        prompt: 'A script runs `rm $FILE` where `FILE="my report.txt"`. What happens and how do you fix it?',
        options: [
          'It deletes "my report.txt" cleanly.',
          'Unquoted $FILE splits into two arguments ("my" and "report.txt"), failing or deleting the wrong files! Fix: quote it as `rm "$FILE"`.',
          'Single quotes `rm \'$FILE\'` will expand the variable safely.',
          'Shell variables cannot contain spaces.',
        ],
        correctOptionIndex: 1,
        hint: 'What happens during word splitting after unquoted variable expansion?',
        explanation: 'Unquoted expansion splits on whitespace (IFS). Always double-quote variable references (`"$FILE"`) so filenames with spaces remain a single argument.',
      },
      {
        id: 'ch11-q2',
        type: 'mcq',
        sectionRef: '11.4–11.5',
        prompt: 'In Bourne shell (`if command; then ...`), what exit status causes the `then` branch to execute?',
        options: ['1 (true)', '0 (success)', 'Any positive integer', 'Only -1'],
        correctOptionIndex: 1,
        hint: 'Shell exit codes are the opposite of C/Python booleans!',
        explanation: 'In Unix/Linux, exit code 0 means success ("true" in shell conditionals), while non-zero values indicate specific error codes.',
      },
      {
        id: 'ch11-q3',
        type: 'fill_blank',
        sectionRef: '11.8',
        prompt: 'Which utility safely creates a unique, unpredictable temporary file or directory in /tmp for shell scripts?',
        acceptedAnswers: ['mktemp'],
        hint: 'Short for "make temp".',
        explanation: '`mktemp` atomically creates a uniquely named temp file with 600 permissions, preventing race conditions and symlink attacks.',
      },
      {
        id: 'ch11-q4',
        type: 'true_false',
        sectionRef: '11.11',
        prompt: 'True or False: Changing directory inside parentheses `(cd /tmp && ls)` leaves your parent shell sitting in `/tmp` afterward.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Parentheses launch a subshell.',
        explanation: 'False. The `cd /tmp` only affects the temporary child subshell; the parent shell’s working directory remains unchanged.',
      },
    ],
    flashcards: [
      {
        id: 'fc-11-1',
        chapterNumber: 11,
        sectionRef: '11.2',
        front: 'Contrast single quotes (\'...\') vs. double quotes ("...") in the Bourne shell.',
        back: 'Single quotes preserve EVERY character literally (no $VAR, no globs). Double quotes prevent word splitting and globbing while still expanding $VAR and $(...).',
        tags: ['shell', 'quoting'],
      },
      {
        id: 'fc-11-2',
        chapterNumber: 11,
        sectionRef: '11.3',
        front: 'What do the special shell variables $#, $@, and $? represent?',
        back: '$# = number of positional arguments\n$@ = all positional arguments (preserves quoting as "$@")\n$? = exit status of the last command',
        tags: ['shell', 'variables'],
      },
    ],
    keyTakeaways: [
      'Always double-quote variable expansions ("$var") to survive spaces and wildcards.',
      'Shell conditionals test command exit status (0 = success, non-zero = failure).',
      'Use $(...) for substitution, mktemp + trap for temp files, and switch to Python when scripts outgrow command orchestration.',
    ],
  },

  {
    number: 12,
    id: 'ch-12',
    part: 'Part III: Automation, Services & Tooling',
    title: 'Network File Transfer and Sharing',
    subtitle: 'Quick HTTP Sharing, scp/sftp, rsync Delta Sync & Trailing-Slash Rules, Samba, and SSHFS/NFS',
    sectionRange: '12.1 – 12.8 (12.3 restored from chapter body)',
    status: 'VALIDATED',
    estimatedMinutes: 40,
    prerequisites: [9, 10],
    overview:
      'Chapter 12 covers practical ways to move and share files across Linux and mixed-OS networks: lightweight HTTP servers, encrypted SSH copies (scp/sftp), high-efficiency incremental synchronization with rsync (including its famous trailing-slash semantics), Samba/SMB for Windows/macOS sharing, and SSHFS/NFS network mounts.',
    learningObjectives: [
      'Choose the right transfer tool (HTTP, scp/sftp, rsync, Samba, SSHFS/NFS) for ad-hoc transfers vs. ongoing sharing.',
      'Predict the exact directory layout created by `rsync -a dir host:dest` vs. `rsync -a dir/ host:dest` (Figures 12-1 & 12-2).',
      'Use rsync safely with dry-run (`-n`), archive mode (`-a`), and deletion mirroring (`--delete`).',
      'Explain how Samba (smbd/nmbd, smb.conf) and SSHFS (over FUSE + SSH) share filesystems across hosts.',
    ],
    visualizerId: 'rsync_slash',
    visualizerTitle: 'Interactive rsync Trailing-Slash & --delete Directory Simulator',
    sections: [
      {
        id: 'ch12-12.1',
        number: '12.1–12.2',
        title: 'Quick Copy (HTTP, scp/sftp) & Mastering rsync (Figures 12-1 & 12-2)',
        subsections: [
          '12.1 Quick Copy (Simple HTTP Server, scp, sftp)',
          '12.2 rsync (Archive Mode, Trailing Slash Semantics, --delete, -n Dry Run)',
        ],
        bookGroundedSummary:
          'For quick one-off copies over SSH, `scp` works fine—but for synchronizing directory trees, resuming interrupted transfers, or repeating backups efficiently, `rsync` is the gold standard.',
        detailedExplanation: [
          '`rsync` compares source and destination files by timestamp/size (or rolling block checksums) and transfers ONLY the changed deltas over SSH by default. Archive mode (`-a`) recursively copies directories while preserving symlinks, permissions, timestamps, and ownership.',
          'The single most important detail in `rsync` is the **trailing slash** on a source directory (Figures 12-1 and 12-2):',
          '• **Without trailing slash** (`rsync -a dir host:dest_dir`, Figure 12-1): copies the directory `dir` ITSELF into `dest_dir`, producing `dest_dir/dir/...`.\n• **With trailing slash** (`rsync -a dir/ host:dest_dir`, Figure 12-2): copies only the CONTENTS inside `dir` directly into `dest_dir`, producing `dest_dir/file1, dest_dir/file2`.',
          'Because `--delete` removes files at the destination that do not exist in the source, ALWAYS preview first using `-n` (`--dry-run`) combined with `-v` (`rsync -anv --delete ...`) before running a destructive sync!',
        ],
        figureIds: ['fig-12-1', 'fig-12-2'],
        codeExamples: [
          {
            title: 'Safe dry-run incremental mirror with rsync',
            command: 'rsync -anv --delete ./site/ web01:/var/www/html/',
            output: `sending incremental file list
index.html
deleting obsolete-page.html
sent 142 bytes  received 28 bytes  340.00 bytes/sec (DRY RUN)`,
            explanation:
              '-a (archive), -n (dry run—changes nothing!), -v (verbose), and trailing slash on ./site/ syncs contents directly into /var/www/html/.',
          },
        ],
        supplementalNote:
          'Source Audit Note: Section 12.1 shows Python 2’s `python -m SimpleHTTPServer` for quick ad-hoc HTTP serving; on modern Linux systems with Python 3, use `python3 -m http.server 8000`.',
      },
      {
        id: 'ch12-12.3',
        number: '12.3–12.8',
        title: 'File Sharing: Samba (SMB/CIFS), SSHFS (FUSE), NFS & Network Storage',
        subsections: [
          '12.3 Introduction to File Sharing (restored from body)',
          '12.4 Sharing Files with Samba (smb.conf, smbpasswd, smbclient)',
          '12.5 SSHFS (Mounting Remote Directories over SSH via FUSE)',
          '12.6 NFS (Network File System) & 12.7–12.8 Choosing a Solution',
        ],
        bookGroundedSummary:
          'When multiple hosts need live mounted access to shared files, Linux provides Samba (for cross-platform Windows/macOS SMB shares), SSHFS (zero-config encrypted FUSE mounts over existing SSH), and NFS (traditional Unix-to-Unix network mounts).',
        detailedExplanation: [
          '**Samba** implements the SMB/CIFS protocol via `smbd` configured in `/etc/samba/smb.conf` (`[global]` server identity/workgroup plus per-share `[sharename]` stanzas defining `path`, `read only`, and `valid users`). Because SMB uses its own challenge-response password hashing incompatible with `/etc/shadow`, Samba maintains separate user credentials managed via `smbpasswd`.',
          '**SSHFS** builds on FUSE (Filesystem in Userspace from Chapter 4) and SFTP over SSH: any user with SSH login access can mount a remote directory locally (`sshfs user@host:/path /mnt/remote`) with zero server-side daemon reconfiguration and full SSH encryption—and unmount cleanly with `fusermount -u /mnt/remote`.',
          '**NFS** (Network File System) exports directories defined in `/etc/exports` for high-performance Unix/Linux LAN sharing, though classic NFS relies on matching UIDs/GIDs across hosts and careful firewalling (or Kerberos in NFSv4).',
          'Decision guide (Section 12.7): use `rsync` for repeatable one-way/backup synchronization, `SSHFS` for ad-hoc encrypted interactive mounts when only port 22 is open, `Samba` whenever Windows/macOS clients participate, and `NFS` for persistent high-throughput Linux-to-Linux LAN shares.',
        ],
        table: {
          id: 'table-12-1',
          number: 'Table 12-1 [Supplemental Comparison]',
          title: 'Choosing a Linux Network File Transfer or Sharing Tool',
          headers: ['Tool / Protocol', 'Transport & Auth', 'Best Use Case'],
          rows: [
            ['rsync (-a / -n)', 'SSH (default) or rsync daemon', 'Incremental backups, mirroring directories, resuming large transfers'],
            ['scp / sftp', 'SSH (TCP port 22)', 'Simple one-off encrypted file copies or interactive transfer sessions'],
            ['SSHFS (FUSE)', 'SFTP over SSH', 'Zero-server-config encrypted remote mounts for individual users'],
            ['Samba (SMB/CIFS)', 'TCP 445 + smbpasswd', 'Cross-platform LAN file/printer sharing with Windows and macOS'],
            ['NFS', 'TCP 2049 (NFSv4) / RPC', 'High-throughput persistent Linux/Unix LAN mounts'],
          ],
        },
        sourceNotes: [
          'Source Audit Note: Heading 12.3 ("Introduction to File Sharing") exists in the body HTML but was omitted from the Calibre TOC; restored here.',
        ],
      },
    ],
    glossary: [
      { term: 'rsync Archive Mode (-a)', definition: 'Shorthand (-rlptgoD) enabling recursive sync while preserving symlinks, permissions, timestamps, group/owner, and special files.', sectionRef: '12.2' },
      { term: 'Samba (SMB/CIFS)', definition: 'Open-source SMB server/client suite allowing Linux machines to share files and printers seamlessly with Windows and macOS.', sectionRef: '12.4' },
      { term: 'SSHFS', definition: 'FUSE-based client that mounts a remote filesystem over an encrypted SSH/SFTP connection with no extra server daemon.', sectionRef: '12.5' },
    ],
    terminalLab: {
      intro: 'Practice safe rsync dry-runs and inspect trailing-slash directory sync behavior in the simulated terminal.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch12-t1',
          title: 'Preview an rsync sync with trailing slash (Figure 12-2)',
          instruction: 'Run a dry-run sync of the project directory contents with trailing slash: rsync -anv project/ backup/',
          hint: 'Run rsync -anv project/ backup/',
          expectedPattern: '^rsync\\s+.*-.*n.*project/',
          commandExplanation: 'The trailing slash copies contents of project/ directly into backup/, while -n simulates changes safely.',
          sampleCommand: 'rsync -anv project/ backup/',
        },
        {
          id: 'ch12-t2',
          title: 'Compare rsync WITHOUT a trailing slash (Figure 12-1)',
          instruction: 'Run rsync -anv project backup/ (no slash after project) and compare the output paths.',
          hint: 'Run rsync -anv project backup/',
          expectedPattern: '^rsync\\s+.*project\\s+backup',
          commandExplanation: 'Omitting the trailing slash copies the directory `project` itself inside `backup/`, creating `backup/project/...`.',
          sampleCommand: 'rsync -anv project backup/',
        },
      ],
    },
    assessments: [
      {
        id: 'ch12-q1',
        type: 'mcq',
        sectionRef: '12.2',
        prompt: 'You run `rsync -a photos host:backups` (NO trailing slash on `photos`, Figure 12-1). Where do the files inside `photos` end up on `host`?',
        options: [
          'Directly inside `backups/` (e.g., `backups/img1.jpg`)',
          'Inside a subdirectory `backups/photos/` (e.g., `backups/photos/img1.jpg`)',
          'rsync refuses to run without a trailing slash.',
          'They overwrite `host:backups` as a single tarball.',
        ],
        correctOptionIndex: 1,
        hint: 'Compare Figure 12-1 (no slash) with Figure 12-2 (trailing slash).',
        explanation: 'Without a trailing slash, rsync copies the directory itself into the destination (`backups/photos/`). Adding `photos/` copies only its contents directly into `backups/`.',
      },
      {
        id: 'ch12-q2',
        type: 'command_write',
        sectionRef: '12.2',
        prompt: 'Which single-letter rsync flag performs a dry run (showing what would be copied or deleted without modifying any files)?',
        acceptedAnswers: ['-n', '--dry-run'],
        hint: 'Often paired with -av as -anv.',
        explanation: '`-n` (`--dry-run`) simulates the entire transfer safely before committing changes.',
      },
      {
        id: 'ch12-q3',
        type: 'scenario',
        sectionRef: '12.5',
        prompt: 'You need to temporarily mount a remote Linux server’s `/var/www` directory on your laptop over an untrusted network, and only SSH (port 22) is open on the server. Which tool fits best?',
        options: ['NFSv3', 'Samba', 'SSHFS', 'FTP'],
        correctOptionIndex: 2,
        hint: 'Which FUSE client tunnels filesystem operations directly over SSH?',
        explanation: 'SSHFS mounts remote directories securely over existing SSH access with zero extra server ports or daemons.',
      },
      {
        id: 'ch12-q4',
        type: 'true_false',
        sectionRef: '12.4',
        prompt: 'True or False: Because Samba runs on Linux, it automatically authenticates Windows SMB clients directly against the salted hashes in `/etc/shadow` without needing separate Samba passwords.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Recall the purpose of `smbpasswd` in Section 12.4.',
        explanation: 'False. SMB/CIFS uses its own challenge-response password hashes incompatible with Unix `/etc/shadow`, so Samba maintains separate user credentials via `smbpasswd` (unless integrated with a central directory like Active Directory/LDAP).',
      },
    ],
    flashcards: [
      {
        id: 'fc-12-1',
        chapterNumber: 12,
        sectionRef: '12.2',
        front: 'What is the difference between `rsync -a src dest` and `rsync -a src/ dest`?',
        back: '`src` (no trailing slash) creates `dest/src/...`. `src/` (trailing slash) copies the contents of `src` directly into `dest/...`.',
        tags: ['rsync', 'transfer'],
      },
      {
        id: 'fc-12-2',
        chapterNumber: 12,
        sectionRef: '12.4',
        front: 'Why does Samba require `smbpasswd` instead of reading `/etc/shadow` directly?',
        back: 'SMB authentication uses a distinct challenge-response hash format incompatible with standard Unix salted hashes in `/etc/shadow`.',
        tags: ['samba', 'sharing'],
      },
    ],
    keyTakeaways: [
      'rsync transfers only changed deltas and preserves metadata with -a; always verify trailing slashes and test --delete with -n first.',
      'Use Samba for Windows/macOS SMB shares, SSHFS for instant encrypted mounts over SSH, and NFS for native Unix LAN shares.',
    ],
  },
];
