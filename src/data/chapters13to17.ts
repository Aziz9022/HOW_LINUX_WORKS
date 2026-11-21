import { ChapterModule } from './types';

export const CHAPTERS_13_TO_17: ChapterModule[] = [
  {
    number: 13,
    id: 'ch-13',
    part: 'Part III: Automation, Services & Tooling',
    title: 'User Environments',
    subtitle: 'Login vs. Non-Login Shells, Startup Files (.bashrc, .bash_profile), PATH, Aliases, and Safe Defaults',
    sectionRange: '13.1 – 13.7',
    status: 'VALIDATED',
    estimatedMinutes: 30,
    prerequisites: [2, 11],
    overview:
      'Every time you log in or open a terminal window, your shell reads a specific sequence of startup files that establish your PATH, aliases, prompt, and environment variables. Chapter 13 explains the crucial difference between login and non-login interactive shells, how to organize startup files without breaking remote commands like scp/rsync, and sensible rules for keeping your environment clean.',
    learningObjectives: [
      'Distinguish login interactive shells from non-login interactive and non-interactive shells.',
      'Trace which bash startup files (/etc/profile, ~/.bash_profile, ~/.profile, ~/.bashrc) execute in each scenario.',
      'Explain why printing text unconditionally from .bashrc breaks non-interactive SSH tools like scp and rsync.',
      'Configure PATH ordering, aliases, umask, and prompts cleanly without circular sourcing loops.',
    ],
    sections: [
      {
        id: 'ch13-13.1',
        number: '13.1–13.4',
        title: 'Guidelines for Startup Files, When to Edit & Shell Startup File Elements',
        subsections: [
          '13.1 Guidelines for Creating Startup Files (Simplicity & Readability)',
          '13.2 When Should You Alter Startup Files?',
          '13.3 Shell Startup File Elements ($PATH, PS1, Aliases, umask)',
          '13.4 Startup File Order and Examples (Login vs. Non-Login)',
        ],
        bookGroundedSummary:
          'Keep startup files short, modular, and free of side effects. Understand bash’s split between login shells (.bash_profile / .profile) and interactive non-login shells (.bashrc).',
        detailedExplanation: [
          'A **login shell** (such as SSH login or virtual console login) reads `/etc/profile` followed by the first found of `~/.bash_profile`, `~/.bash_login`, or `~/.profile`. Crucially, a login shell does NOT automatically read `~/.bashrc` unless `.bash_profile` explicitly sources it (`[ -f ~/.bashrc ] && . ~/.bashrc`)!',
          'A **non-login interactive shell** (such as opening a new terminal tab inside a desktop environment) skips `.bash_profile` and reads `~/.bashrc` directly.',
          'Order inside `$PATH` matters: directories are searched left-to-right. Placing `~/bin` or `/usr/local/bin` before `/usr/bin` lets personal or local tools override distribution defaults—whereas putting `.` (current working directory) in `$PATH` is a classic security hazard because running `ls` inside a shared directory could execute a malicious `./ls` binary.',
        ],
        table: {
          id: 'table-13-1',
          number: 'Table 13-1 [Supplemental Reference]',
          title: 'Bash Startup File Execution Matrix',
          headers: ['Shell Invocation Mode', 'Example', 'Files Read by Bash'],
          rows: [
            ['Interactive Login Shell', 'SSH login, console login, `bash -l`', '`/etc/profile`, then first of `~/.bash_profile`, `~/.bash_login`, `~/.profile`'],
            ['Interactive Non-Login Shell', 'New desktop terminal tab', '`/etc/bash.bashrc` (distro-dependent), then `~/.bashrc`'],
            ['Non-Interactive Shell', 'Running a script (`./job.sh`)', 'None by default (unless `$BASH_ENV` is set)'],
            ['Non-Interactive Remote SSH', '`scp`, `rsync` over SSH', 'May read `~/.bashrc` — MUST produce ZERO stdout!'],
          ],
        },
        codeExamples: [
          {
            title: 'Clean ~/.bash_profile sourcing ~/.bashrc + safe PATH update',
            command: `# ~/.bash_profile
[ -f ~/.bashrc ] && . ~/.bashrc

# ~/.bashrc (guard interactive-only settings!)
case $- in
  *i*) ;;
  *) return ;;
esac
export PATH="$HOME/bin:/usr/local/bin:$PATH"
alias ll='ls -la'`,
            explanation:
              'Checking `$-` for `i` guarantees interactive prompts or echoes never run during non-interactive SSH sessions (which would corrupt Chapter 12 scp/rsync streams).',
          },
        ],
      },
      {
        id: 'ch13-13.5',
        number: '13.5–13.7',
        title: 'Default User Settings (/etc/skel), Pitfalls & Further Startup Topics',
        subsections: [
          '13.5 Default User Settings (/etc/skel)',
          '13.6 Startup File Pitfalls (Output on stdout, Missing PATH entries, Broken loops)',
          '13.7 Further Startup Topics (Desktop sessions, GUI environment variables)',
        ],
        bookGroundedSummary:
          'When a new user account is created, default dotfiles are copied from /etc/skel. Avoid printing text in .bashrc, never clobber $PATH without preserving existing paths, and never place "." in $PATH.',
        detailedExplanation: [
          'Classic pitfall #1: Writing `echo "Welcome back!"` at the top of `~/.bashrc`. When `scp` or `rsync` connects over SSH, bash may read `.bashrc`; unexpected bytes printed to stdout corrupt the binary transfer protocol immediately.',
          'Classic pitfall #2: Writing `PATH=/home/juser/bin` instead of `PATH="$HOME/bin:$PATH"`. Omitting `:$PATH` wipes out `/usr/bin` and `/bin`, making even `ls` and `vi` disappear until you type `/bin/vi`!',
          'Classic pitfall #3: Setting overly aggressive aliases (like `alias rm="rm -i"`) that train unsafe muscle memory when you later log into another host without the alias.',
        ],
      },
    ],
    glossary: [
      { term: 'Login vs. Non-Login Shell', definition: 'Login shells read /etc/profile and ~/.bash_profile; interactive non-login shells (e.g., terminal emulators) read ~/.bashrc.', sectionRef: '13.4' },
      { term: '/etc/skel', definition: 'Template directory whose dotfiles (.bashrc, .profile) are copied into new users’ home directories upon account creation.', sectionRef: '13.5' },
    ],
    terminalLab: {
      intro: 'Inspect $PATH resolution, shell startup files, and environment variables in the simulated home directory.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch13-t1',
          title: 'Inspect your active $PATH and ~/.bashrc',
          instruction: 'Print $PATH using echo "$PATH" and inspect ~/.bashrc using cat ~/.bashrc.',
          hint: 'Run echo "$PATH" && cat ~/.bashrc',
          expectedPattern: '(echo.*\\$PATH|cat.*\\.bashrc)',
          commandExplanation: '$PATH determines the exact left-to-right directory search order for commands.',
          sampleCommand: 'echo "$PATH" && cat ~/.bashrc',
        },
        {
          id: 'ch13-t2',
          title: 'Verify login-shell chaining in ~/.bash_profile',
          instruction: 'Read ~/.bash_profile to see how login shells source ~/.bashrc safely.',
          hint: 'Run cat ~/.bash_profile',
          expectedPattern: 'cat\\s+.*\\.bash_profile',
          commandExplanation: 'Login shells read ~/.bash_profile; sourcing ~/.bashrc keeps login and non-login shells consistent.',
          sampleCommand: 'cat ~/.bash_profile',
        },
      ],
    },
    assessments: [
      {
        id: 'ch13-q1',
        type: 'debug',
        sectionRef: '13.6',
        prompt: 'Ever since you added `echo "Hello!"` to your `~/.bashrc`, `scp` and `rsync` to this server fail with "protocol version mismatch". Why?',
        options: [
          'SSH refuses logins if .bashrc exists.',
          'Non-interactive SSH shells reading .bashrc emit "Hello!" onto stdout, corrupting the scp/rsync binary wire protocol.',
          'echo requires root privileges.',
          'scp ignores .bashrc completely.',
        ],
        correctOptionIndex: 1,
        hint: 'What happens when unexpected text is printed to stdout during an SSH file transfer?',
        explanation: 'Startup files must never emit output in non-interactive shells; guard interactive output by checking `$-` for `i`.',
      },
      {
        id: 'ch13-q2',
        type: 'mcq',
        sectionRef: '13.4',
        prompt: 'Why is the standard convention to source `~/.bashrc` from inside `~/.bash_profile`?',
        options: [
          'Because bash deletes ~/.bashrc after login.',
          'Because login shells read ~/.bash_profile (skipping ~/.bashrc), while desktop terminal windows read ~/.bashrc (skipping ~/.bash_profile); sourcing keeps both environments consistent.',
          'Because ~/.bash_profile cannot set PATH.',
          'Because root users only read ~/.bashrc.',
        ],
        correctOptionIndex: 1,
        hint: 'Compare which file a login SSH shell reads vs. a graphical terminal tab.',
        explanation: 'Sourcing ~/.bashrc from ~/.bash_profile gives you one single place to maintain aliases and interactive settings across both login and non-login shells.',
      },
      {
        id: 'ch13-q3',
        type: 'true_false',
        sectionRef: '13.3',
        prompt: 'True or False: Adding `.` (the current directory) to the beginning of your `$PATH` is recommended so you never have to type `./script.sh`.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Think about running `ls` inside `/tmp` if another user placed a Trojan file named `ls` there.',
        explanation: 'False. Putting `.` in `$PATH` is a well-known security vulnerability; always invoke local executables explicitly as `./script.sh`.',
      },
      {
        id: 'ch13-q4',
        type: 'fill_blank',
        sectionRef: '13.5',
        prompt: 'Which template directory stores default startup files (such as `.bashrc` and `.profile`) that are copied into a new user’s home directory when their account is created?',
        acceptedAnswers: ['/etc/skel'],
        hint: 'Short for "skeleton" inside /etc.',
        explanation: '`/etc/skel` holds skeleton dotfiles used by account-creation tools like `useradd -m` / `adduser`.',
      },
    ],
    flashcards: [
      {
        id: 'fc-13-1',
        chapterNumber: 13,
        sectionRef: '13.4',
        front: 'Which startup file does a bash login shell read vs. an interactive non-login shell?',
        back: 'Login shell: /etc/profile then ~/.bash_profile (or ~/.profile).\nNon-login interactive shell: ~/.bashrc.',
        tags: ['bash', 'environment'],
      },
      {
        id: 'fc-13-2',
        chapterNumber: 13,
        sectionRef: '13.5',
        front: 'What is the purpose of /etc/skel?',
        back: 'It holds skeleton/template dotfiles (.bashrc, .profile) copied into a newly created user’s home directory.',
        tags: ['users', 'environment'],
      },
    ],
    keyTakeaways: [
      'Source ~/.bashrc from ~/.bash_profile so login and non-login interactive shells stay consistent.',
      'Guard interactive output in ~/.bashrc so scp/rsync never break, and always preserve $PATH when extending it.',
      'Never add `.` (current directory) to `$PATH`.',
    ],
  },

  {
    number: 14,
    id: 'ch-14',
    part: 'Part III: Automation, Services & Tooling',
    title: 'A Brief Survey of the Linux Desktop and Printing',
    subtitle: 'X11 vs. Wayland, Compositors, Desktop Toolkits, D-Bus IPC, and CUPS Printing',
    sectionRange: '14.1 – 14.7',
    status: 'VALIDATED',
    estimatedMinutes: 30,
    prerequisites: [6, 10],
    overview:
      'Chapter 14 explains how graphical applications reach your screen and how documents reach a printer without duplicating hardware drivers in every app. You will compare the classic X Window System (X11) with modern Wayland compositors, understand GUI toolkits and D-Bus inter-process communication, and trace CUPS printing pipelines.',
    learningObjectives: [
      'Explain the client-server architecture of X11 (and why the X "server" runs on the user’s display machine).',
      'Compare X11’s separate display server + window manager + compositor against Wayland’s integrated compositor model.',
      'Explain how D-Bus provides system and session message buses connecting desktop apps and system services.',
      'Trace how CUPS accepts print jobs, applies format filters (PDF/PostScript/raster), and drives printers.',
    ],
    sections: [
      {
        id: 'ch14-14.1',
        number: '14.1–14.5',
        title: 'Desktop Components: X11, Wayland, Toolkits, Desktop Environments & D-Bus',
        subsections: [
          '14.1 Desktop Components Overview',
          '14.2 A Closer Look at the X Window System (X11 Client/Server, Display Managers)',
          '14.3 Wayland (Unified Compositor, Security Isolation, XWayland)',
          '14.4 Toolkits (GTK, Qt) & Desktop Environments (GNOME, KDE)',
          '14.5 D-Bus (System Bus vs. Session Bus)',
        ],
        bookGroundedSummary:
          'Unlike OSes that hardwire a single GUI into the kernel, Linux builds graphical desktops from modular user-space layers: display protocol (X11 or Wayland), window/compositing layer, widget toolkits (GTK/Qt), desktop environment, and D-Bus messaging.',
        detailedExplanation: [
          'In **X11**, terminology often surprises newcomers: the **X Server** runs on the machine with the physical monitor, keyboard, and mouse, while applications (browser, terminal) are **X Clients** that send drawing requests to the X server over a Unix domain socket or TCP (`DISPLAY=:0`). X11 originally split rendering, window management, and compositing into separate processes, leading to tearing and weak inter-window security (any X client could snoop another window’s keystrokes).',
          '**Wayland** streamlines this architecture: the **Wayland Compositor** acts directly as both display server and window manager, talking to kernel DRM/KMS graphics drivers directly. Clients render their own pixel buffers into shared memory and hand them to the compositor—eliminating screen tearing and isolating applications from snooping one another. Legacy X11 apps run smoothly via **XWayland**.',
          '**D-Bus** serves as Linux’s structured message bus: a single **system bus** (hardware/network events from NetworkManager, systemd, udev) and a per-user **session bus** (desktop notifications, clipboard, media controls).',
        ],
      },
      {
        id: 'ch14-14.6',
        number: '14.6–14.7',
        title: 'Printing Architecture (CUPS, Filters, IPP) & Looking Forward',
        subsections: ['14.6 Printing (CUPS, Format Conversion/Filters, IPP)', '14.7 Other Desktop Topics'],
        bookGroundedSummary:
          'CUPS (Common Unix Printing System) manages print queues, accepts standard documents (primarily PDF/PostScript), converts them through filter chains into printer-specific raster data, and speaks IPP (Internet Printing Protocol) for driverless network printing.',
        detailedExplanation: [
          'Rather than forcing every application to know hundreds of printer command languages, apps submit PDF (or PostScript) jobs to the `cupsd` spooler daemon (managed by systemd as `cups.service`—Chapter 6—and configurable via `http://localhost:631`).',
          'CUPS queues the job, routes it through a chain of filters (`pdftopdf`, `pdftoraster`, or printer PPD/IPP Everywhere capabilities), and hands the final byte stream to a backend (`ipp://`, USB, LPD) for hardware output.',
          'Connecting the layers: a desktop login reaches `graphical.target` (Chapter 6), starts a Display Manager (`gdm`/`sddm`), launches a Wayland compositor or X11 server communicating over local Unix domain sockets (Chapter 10), coordinates hardware/session events over D-Bus, and spools documents through `cupsd`.',
        ],
        table: {
          id: 'table-14-1',
          number: 'Table 14-1 [Supplemental Comparison]',
          title: 'X11 vs. Wayland Architectural Summary',
          headers: ['Dimension', 'X Window System (X11)', 'Wayland'],
          rows: [
            ['Core processes', 'Separate X server + Window Manager + Compositor', 'Single unified Wayland Compositor (e.g., Mutter, KWin)'],
            ['Client isolation', 'Weak: X clients can inspect other windows & global input', 'Strong: each client renders isolated shared-memory buffers'],
            ['Network transparency', 'Built-in X11 protocol / SSH -X forwarding', 'Delegated to remote desktop protocols (RDP/VNC/Waypipe)'],
            ['Legacy compatibility', 'Native', 'Supported seamlessly via XWayland compatibility server'],
          ],
        },
      },
    ],
    glossary: [
      { term: 'Wayland Compositor', definition: 'Modern Linux display server combining window management and GPU compositing with per-client input/output isolation.', sectionRef: '14.3' },
      { term: 'D-Bus', definition: 'Inter-process communication message bus offering a host-wide system bus and per-login session bus.', sectionRef: '14.5' },
      { term: 'CUPS', definition: 'Common Unix Printing System: spooler, filter pipeline, and IPP server handling Linux printing.', sectionRef: '14.6' },
    ],
    terminalLab: {
      intro: 'Inspect desktop session environment variables and system services in the simulated host.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch14-t1',
          title: 'Check active display/session environment variables',
          instruction: 'Inspect environment variables with env | grep -E "DISPLAY|XDG|DBUS" (or printenv).',
          hint: 'Run env | grep -E "DISPLAY|XDG|DBUS"',
          expectedPattern: '^(env|printenv)',
          commandExplanation: 'Desktop sessions export variables like XDG_SESSION_TYPE (wayland/x11) and DBUS_SESSION_BUS_ADDRESS.',
          sampleCommand: 'env | grep -E "DISPLAY|XDG|DBUS"',
        },
        {
          id: 'ch14-t2',
          title: 'Verify the CUPS printing daemon status',
          instruction: 'Check whether the CUPS spooler service is running using systemctl status cups.service.',
          hint: 'Run systemctl status cups.service',
          expectedPattern: '^systemctl\\s+status\\s+cups',
          commandExplanation: 'cupsd runs as a standard systemd service (cups.service) managing local and IPP print queues.',
          sampleCommand: 'systemctl status cups.service',
        },
      ],
    },
    assessments: [
      {
        id: 'ch14-q1',
        type: 'mcq',
        sectionRef: '14.3',
        prompt: 'What key security and architectural improvement does Wayland introduce over the traditional X11 architecture?',
        options: [
          'Wayland moves GUI rendering inside the Linux kernel.',
          'Wayland merges the display server and compositor, lets clients render isolated buffers directly, and prevents arbitrary apps from snooping keystrokes or screens of other windows.',
          'Wayland removes support for GPUs.',
          'Wayland requires every app to connect over TCP port 6000.',
        ],
        correctOptionIndex: 1,
        hint: 'Think about X11’s shared global event model vs. Wayland’s unified compositor.',
        explanation: 'Wayland simplifies the pipeline into a single compositor with strict client isolation, preventing global keylogging while eliminating frame tearing.',
      },
      {
        id: 'ch14-q2',
        type: 'fill_blank',
        sectionRef: '14.5',
        prompt: 'Which standard Linux IPC message bus provides both a system-wide bus (for systemd/NetworkManager) and a per-user session bus for desktop applications?',
        acceptedAnswers: ['d-bus', 'dbus'],
        hint: 'Starts with D-...',
        explanation: 'D-Bus connects desktop apps and system daemons cleanly via structured signals and method calls.',
      },
      {
        id: 'ch14-q3',
        type: 'true_false',
        sectionRef: '14.2',
        prompt: 'True or False: In X11 client-server terminology, the graphical application (like Firefox) is the X server and your monitor/keyboard daemon is the X client.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Which process "serves" access to the display hardware?',
        explanation: 'False—it is the reverse! The X Server owns and serves the display/input hardware, while applications connect to it as X Clients.',
      },
      {
        id: 'ch14-q4',
        type: 'scenario',
        sectionRef: '14.6',
        prompt: 'Why does a Linux word processor only need to emit standard PDF (or PostScript) rather than embedding drivers for every HP, Brother, and Epson printer model?',
        options: [
          'Because the Linux kernel converts PDF directly inside the USB controller.',
          'Because CUPS accepts standard PDF/PostScript jobs, runs format conversion filters (or IPP Everywhere), and handles the printer-specific backend.',
          'Because Wayland renders documents straight to paper.',
          'Because all printers natively execute Python scripts.',
        ],
        correctOptionIndex: 1,
        hint: 'Trace the three stages of the CUPS pipeline in Section 14.6.',
        explanation: 'CUPS decouples applications from printer hardware through a centralized spooler, format filter chain, and IPP/USB backends.',
      },
    ],
    flashcards: [
      {
        id: 'fc-14-1',
        chapterNumber: 14,
        sectionRef: '14.2',
        front: 'In X11, which side is the X Server and which side is the X Client?',
        back: 'The X Server manages the physical display, keyboard, and mouse; graphical applications (browser, terminal) are X Clients sending draw requests to the X Server.',
        tags: ['desktop', 'x11'],
      },
      {
        id: 'fc-14-2',
        chapterNumber: 14,
        sectionRef: '14.6',
        front: 'What are the three stages of a CUPS print job?',
        back: '1. Spooler receives document (usually PDF)\n2. Filter pipeline converts to printer-ready format/raster\n3. Backend sends stream to printer (e.g., IPP or USB)',
        tags: ['cups', 'printing'],
      },
    ],
    keyTakeaways: [
      'Linux desktops are modular user-space stacks built atop X11 or Wayland compositors, GTK/Qt toolkits, and D-Bus.',
      'Wayland eliminates X11’s middlemen and isolates client input/buffers for better security and tear-free rendering.',
      'CUPS decouples apps from printer hardware via spooling, PDF/raster filters, and IPP.',
    ],
  },

  {
    number: 15,
    id: 'ch-15',
    part: 'Part III: Automation, Services & Tooling',
    title: 'Development Tools',
    subtitle: 'The C Compiler Pipeline, Shared Libraries (ldd/ldconfig), make Dependency Graphs, and Debugging',
    sectionRange: '15.1 – 15.6',
    status: 'VALIDATED',
    estimatedMinutes: 45,
    prerequisites: [2, 11],
    overview:
      'Even if you are a systems administrator rather than a C programmer, understanding Linux development tools is vital for diagnosing broken binaries, missing shared libraries, and software builds. Chapter 15 explains gcc’s compilation and linking stages, how dynamic shared libraries resolve at runtime (ldd, ld.so.cache), how make builds projects incrementally from dependency graphs, and Linux’s scripting/debugging ecosystem.',
    learningObjectives: [
      'Trace how gcc transforms C source files (.c) and headers (.h) into object files (.o) and linked executables.',
      'Diagnose missing shared libraries using ldd, ldconfig (/etc/ld.so.conf), and explain why LD_LIBRARY_PATH should be used sparingly.',
      'Trace a Makefile dependency graph (Figure 15-1) and predict which targets rebuild when specific source timestamps change.',
      'Compare interpreted/bytecode languages (Python, Perl, Java) and explain how gdb and debug symbols aid troubleshooting.',
    ],
    visualizerId: 'make_graph',
    visualizerTitle: 'Interactive Makefile Dependency Graph & Timestamp Rebuilder (Figure 15-1)',
    sections: [
      {
        id: 'ch15-15.1',
        number: '15.1',
        title: 'The C Compiler (gcc), Include Headers, Object Files & Shared Libraries',
        subsections: [
          '15.1.1 Compiling & Linking Multiple Source Files (-c, -o, -I, -L, -l)',
          '15.1.2 Shared Libraries vs. Static Libraries (.so vs. .a)',
          '15.1.3 Using ldd, ld.so.conf, ldconfig & LD_LIBRARY_PATH',
        ],
        bookGroundedSummary:
          'Building C software splits into compiling source files into object code (`-c`) and linking object files with libraries (`-l`). Most Linux binaries link dynamically against `.so` shared libraries resolved at startup by `ld.so`.',
        detailedExplanation: [
          'GCC flags every Linux user should recognize: `-c` compiles `.c` -> `.o` without linking; `-I/dir` adds a header search directory (for `#include`); `-L/dir` adds a library search directory; `-lfoo` links against `libfoo.so` (or `libfoo.a`).',
          'Why prefer **shared libraries** (`.so`, dynamic linking) over static libraries (`.a`)? Multiple running programs share a single copy of `libc.so` in RAM, executables stay tiny, and a single security patch to OpenSSL updates every linked application simultaneously.',
          'When a binary fails with `error while loading shared libraries: libfoo.so.2: cannot open shared object file`, run `ldd /path/to/binary` to see every required library and which ones show `not found`. System library directories are indexed in `/etc/ld.so.cache` (rebuilt via `ldconfig` from `/etc/ld.so.conf.d/`). Avoid permanently setting `LD_LIBRARY_PATH` globally; prefer `ldconfig` or embedding `-Wl,-rpath` at link time.',
        ],
        codeExamples: [
          {
            title: 'Inspecting dynamic library dependencies with ldd',
            command: 'ldd /bin/ls',
            output: `	linux-vdso.so.1 (0x00007ffc3b9f0000)
	libselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1
	libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6
	/lib64/ld-linux-x86-64.so.2`,
            explanation:
              'ldd lists each shared object required by /bin/ls and the exact path resolved by the dynamic linker (ld-linux).',
          },
        ],
      },
      {
        id: 'ch15-15.2',
        number: '15.2–15.6',
        title: 'make & Dependency Graphs (Figure 15-1), Debugging (gdb), Lex/Yacc & Scripting Languages',
        subsections: [
          '15.2 make (Targets, Dependencies, Rules, Tabs, Macros, Figure 15-1)',
          '15.3 Debuggers (gdb, -g symbols) & 15.4 Lex/Yacc',
          '15.5 Scripting Languages (Python, Perl, Ruby) & 15.6 Java/Go/Rust Notes',
        ],
        bookGroundedSummary:
          'make automates multi-file builds using a dependency graph (Figure 15-1) and filesystem modification timestamps—recompiling only the targets whose prerequisites are newer.',
        detailedExplanation: [
          'In Figure 15-1, executable `myprog` depends on `main.o` and `aux.o`, which in turn depend on `main.c` and `aux.c`. If you edit ONLY `aux.c`, its timestamp becomes newer than `aux.o`. Running `make` recompiles `aux.c -> aux.o`, skips `main.c` completely (since `main.o` is still newer), and relinks `myprog`!',
          'Famous Makefile gotcha: every command recipe line MUST be indented with a real **TAB character**, never spaces! Standard macros like `CC`, `CFLAGS`, `OBJS`, and automatic variables (`$@` = target name, `$<` = first prerequisite) keep Makefiles concise.',
          'To debug crashes with `gdb`, compile with `-g` (`gcc -g -Wall -o myprog main.c aux.c`) to embed DWARF debug symbol tables, then launch `gdb ./myprog`, set breakpoints (`break main`), execute (`run`), and inspect stack frames on a segmentation fault with `bt` (backtrace) and `print var`.',
          'Static vs. dynamic trade-off: static binaries (`.a`, `gcc -static`) bundle every library inside the executable—useful for minimalist recovery tools or scratch containers (Chapter 17)—whereas dynamic binaries (`.so`) save disk and RAM across processes and inherit system-wide library security fixes immediately.',
        ],
        figureIds: ['fig-15-1'],
      },
    ],
    glossary: [
      { term: 'Shared Library (.so)', definition: 'Dynamically linked library loaded into memory at runtime by ld.so and shared across processes.', sectionRef: '15.1' },
      { term: 'ldd & ldconfig', definition: 'ldd displays a binary’s shared library dependencies; ldconfig updates the /etc/ld.so.cache dynamic linker index.', sectionRef: '15.1' },
      { term: 'Makefile Dependency Graph', definition: 'Directed acyclic graph of targets and prerequisites used by make to perform minimal timestamp-based rebuilds.', sectionRef: '15.2' },
    ],
    terminalLab: {
      intro: 'Inspect dynamic shared library links with ldd and simulate incremental make rebuilds.',
      initialDir: '/home/juser/project',
      tasks: [
        {
          id: 'ch15-t1',
          title: 'Inspect shared libraries of a binary',
          instruction: 'Run ldd /bin/ls to see which shared libraries /bin/ls links against.',
          hint: 'Run ldd /bin/ls',
          expectedPattern: '^ldd\\s+',
          commandExplanation: 'ldd invokes the dynamic linker in trace mode to print resolved .so library paths.',
          sampleCommand: 'ldd /bin/ls',
        },
        {
          id: 'ch15-t2',
          title: 'Run an incremental make build',
          instruction: 'Run make in ~/project to observe target compilation and linking.',
          hint: 'Type make and press Enter.',
          expectedPattern: '^make\\b',
          commandExplanation: 'make reads Makefile, compares target vs. dependency timestamps, and runs outdated build recipes.',
          sampleCommand: 'make',
        },
      ],
    },
    assessments: [
      {
        id: 'ch15-q1',
        type: 'scenario',
        sectionRef: '15.2',
        prompt: 'In Figure 15-1 (`myprog` depends on `main.o` and `aux.o`; `main.o` depends on `main.c`; `aux.o` depends on `aux.c`), everything was just built. You edit ONLY `aux.c` and run `make`. What executes?',
        options: [
          'Nothing—myprog already exists.',
          'Both main.c and aux.c recompile, then myprog relinks.',
          'ONLY aux.c recompiles into aux.o, and then myprog relinks using the existing main.o and new aux.o.',
          'Only myprog relinks without compiling aux.c.',
        ],
        correctOptionIndex: 2,
        hint: 'Compare timestamps along the dependency tree in Figure 15-1.',
        explanation: 'main.o is still newer than main.c so it is skipped; aux.o is older than aux.c so it rebuilds, which makes aux.o newer than myprog and triggers relinking.',
      },
      {
        id: 'ch15-q2',
        type: 'command_write',
        sectionRef: '15.1',
        prompt: 'Write the command to list all shared libraries required by `/usr/bin/ssh` and check whether any are missing.',
        acceptedAnswers: ['ldd /usr/bin/ssh'],
        hint: 'Three-letter utility starting with ld...',
        explanation: '`ldd /usr/bin/ssh` lists each `.so` dependency and flags missing libraries as `not found`.',
      },
      {
        id: 'ch15-q3',
        type: 'debug',
        sectionRef: '15.2',
        prompt: '`make` aborts immediately with `Makefile:4: *** missing separator. Stop.`. What is the most common cause?',
        options: [
          'Missing semicolon at the end of a C statement.',
          'The recipe command on line 4 was indented with spaces instead of a literal TAB character.',
          'gcc is not installed.',
          'The target file is missing a .c extension.',
        ],
        correctOptionIndex: 1,
        hint: 'Remember make’s strict whitespace rule for rule commands.',
        explanation: 'Makefile recipe lines MUST start with a genuine ASCII TAB character—spaces produce the classic "missing separator" error.',
      },
      {
        id: 'ch15-q4',
        type: 'short_answer',
        sectionRef: '15.1',
        prompt: 'Explain two major advantages of dynamically linked shared libraries (`.so`) over statically linked libraries (`.a`) on a Linux system.',
        rubricKeywords: ['memory', 'disk', 'security', 'update', 'shared'],
        hint: 'Consider RAM/disk usage across many running programs and what happens when a security vulnerability is patched in libc or OpenSSL.',
        explanation: 'Shared libraries (.so) allow multiple running programs to share one copy of library code in RAM (saving memory and disk space) and let a single library security update fix every dynamically linked program without recompiling them.',
      },
    ],
    flashcards: [
      {
        id: 'fc-15-1',
        chapterNumber: 15,
        sectionRef: '15.1',
        front: 'What do the gcc flags -c, -I, -L, and -l control?',
        back: '-c: compile to .o without linking\n-I: header include directory\n-L: library search directory\n-lfoo: link against libfoo.so / libfoo.a',
        tags: ['gcc', 'compiling'],
      },
      {
        id: 'fc-15-2',
        chapterNumber: 15,
        sectionRef: '15.1',
        front: 'Why is `ldconfig` preferred over exporting `LD_LIBRARY_PATH` system-wide?',
        back: 'ldconfig builds a fast, deterministic system cache (/etc/ld.so.cache), whereas global LD_LIBRARY_PATH can accidentally hijack library resolution for unrelated binaries.',
        tags: ['libraries', 'linker'],
      },
    ],
    keyTakeaways: [
      'Dynamic shared libraries (.so) save RAM and simplify security patching; diagnose missing links with ldd and ldconfig.',
      'make uses dependency graphs and file timestamps to perform minimal incremental rebuilds (and requires literal TABs!).',
    ],
  },

  {
    number: 16,
    id: 'ch-16',
    part: 'Part III: Automation, Services & Tooling',
    title: 'Introduction to Compiling Software from C Source Code',
    subtitle: 'Source Archives, GNU Autotools (./configure, make, make install), --prefix, Patching & Troubleshooting',
    sectionRange: '16.1 – 16.7',
    status: 'VALIDATED',
    estimatedMinutes: 35,
    prerequisites: [15],
    overview:
      'Although package managers handle most software, compiling from source remains indispensable for custom build flags, newer releases, or debugging. Chapter 16 walks through inspecting source tarballs, the GNU Autotools workflow (`./configure && make && make install`), safe installation prefixes (`/usr/local`), applying patches, and interpreting compiler vs. linker failure messages.',
    learningObjectives: [
      'Unpack and safely inspect source tarballs before extracting (avoiding tarbombs).',
      'Explain what each step of `./configure`, `make`, and `make install` accomplishes—and how `--prefix` isolates custom installs.',
      'Diagnose the three major build failure classes: missing `-dev`/`-devel` header files, missing libraries at link time, and `configure` test failures (`config.log`).',
      'Apply unified diff patches safely using `patch -pN`.',
    ],
    sections: [
      {
        id: 'ch16-16.1',
        number: '16.1–16.4',
        title: 'Software Build Systems, Unpacking Archives & GNU Autoconf (./configure)',
        subsections: [
          '16.1 Software Build Systems (Autotools, CMake, Meson)',
          '16.2 Unpacking C Source Packages (tar tvf first!)',
          '16.3 GNU Autoconf: ./configure, --prefix, config.log',
          '16.4 Installing Packages (make, make install, /usr/local)',
        ],
        bookGroundedSummary:
          'The classic GNU Autotools sequence (`./configure`, `make`, `make install`) probes your host for compilers, headers, and libraries, generates customized Makefiles, compiles the code, and installs into `/usr/local` by default so distribution packages stay untouched.',
        detailedExplanation: [
          'Before extracting any tarball, preview its contents with `tar tvzf pkg.tar.gz | head` to confirm it unpacks neatly into its own subdirectory rather than scattering files across your current directory (a "tarbomb").',
          '`./configure` is a portable shell script (generated by GNU Autoconf) that inspects your compiler, CPU architecture, headers, and libraries—often querying `pkg-config`—and writes a tailored `Makefile` and `config.h`. Pass `--prefix=/opt/mytool` (or rely on default `/usr/local`) so you NEVER overwrite `/usr/bin` files owned by your OS package manager (`apt`/`dnf`).',
          'Notice privilege separation: run `./configure` and `make` as a NORMAL unprivileged user; only `sudo make install` needs elevated privileges (and if `--prefix=$HOME/.local`, you don’t need `sudo` at all!).',
        ],
        codeExamples: [
          {
            title: 'Standard isolated GNU Autotools build sequence',
            command: `./configure --prefix=/usr/local/mytool
make -j4
sudo make install`,
            explanation:
              'Configuring with an explicit --prefix keeps binaries, headers, and libraries cleanly separated from OS-managed /usr directories; -j4 compiles 4 files in parallel.',
          },
        ],
      },
      {
        id: 'ch16-16.5',
        number: '16.5–16.7',
        title: 'Applying Patches & Troubleshooting Compile/Link Failures',
        subsections: [
          '16.5 Applying a Patch (diff -u, patch -p0 / -p1)',
          '16.6 Troubleshooting Compiles and Installations (Headers vs. Linker Errors)',
          '16.7 Looking Forward',
        ],
        bookGroundedSummary:
          'Distinguishing preprocessor/header errors (`foo.h: No such file or directory`), compiler syntax errors, and linker errors (`undefined reference to ...`) turns intimidating build logs into clear action items.',
        detailedExplanation: [
          '**Failure Class 1 — Missing Header (`.h`)**: `fatal error: openssl/ssl.h: No such file or directory`. Distributions split runtime libraries (`libssl3`) from development headers (`libssl-dev` on Debian/Ubuntu, `openssl-devel` on Fedora/RHEL). Install the `-dev`/`-devel` package!',
          '**Failure Class 2 — Linker Error (`undefined reference to ...`)**: Compilation succeeded, but the linker could not find the library implementing a symbol—usually a missing `-l<lib>` flag, wrong library link order, or missing library path (`LDFLAGS`).',
          '**Failure Class 3 — `./configure` failure**: Always open `config.log` and inspect the failing test program near the bottom to see the exact compiler/linker diagnostic. Many libraries also ship `.pc` metadata files queried by `pkg-config --cflags --libs <lib>`; if a custom library sits in `/usr/local/lib/pkgconfig`, pass `PKG_CONFIG_PATH=/usr/local/lib/pkgconfig`.',
          'When applying source patches created with `diff -u`, the `-pN` flag to `patch` strips `N` leading path components (e.g., `patch -p1 < fix.patch` strips `a/` and `b/` from git-style unified diffs). Test safely first with `patch --dry-run -p1 < fix.patch`.',
          'Beyond GNU Autotools, many modern C/C++ projects use **CMake** (`cmake -B build && cmake --build build`) or **Meson/Ninja** (`meson setup build && ninja -C build`), which follow the same configure -> compile -> install philosophy covered here.',
        ],
      },
    ],
    glossary: [
      { term: '--prefix', definition: 'Configure option setting the root installation directory (default /usr/local) to isolate source-built software from OS packages.', sectionRef: '16.3' },
      { term: '-dev / -devel Packages', definition: 'Distribution packages supplying C header files (.h) and link metadata required to compile against a library.', sectionRef: '16.6' },
      { term: 'patch -pN', definition: 'Utility applying unified diff patches while stripping N leading slash-delimited path segments.', sectionRef: '16.5' },
    ],
    terminalLab: {
      intro: 'Inspect a simulated Autotools build directory and diagnose build outputs.',
      initialDir: '/home/juser/project',
      tasks: [
        {
          id: 'ch16-t1',
          title: 'Inspect the project source directory and Makefile',
          instruction: 'List files in ~/project and view the Makefile with cat Makefile.',
          hint: 'Run ls -la && cat Makefile',
          expectedPattern: 'cat\\s+Makefile',
          commandExplanation: 'Reading Makefile shows compiler flags, include paths, targets, and install prefixes.',
          sampleCommand: 'cat Makefile',
        },
        {
          id: 'ch16-t2',
          title: 'Run ./configure with a custom --prefix',
          instruction: 'Configure the build to install cleanly into /usr/local/mytool using ./configure --prefix=/usr/local/mytool.',
          hint: 'Run ./configure --prefix=/usr/local/mytool',
          expectedPattern: '^\\./configure\\s+--prefix=',
          commandExplanation: 'GNU Autoconf probes your compiler and headers and generates a Makefile targeting your isolated --prefix.',
          sampleCommand: './configure --prefix=/usr/local/mytool',
        },
      ],
    },
    assessments: [
      {
        id: 'ch16-q1',
        type: 'debug',
        sectionRef: '16.6',
        prompt: 'During `make`, gcc fails with `fatal error: zlib.h: No such file or directory`, even though `libz.so` is already installed on the system. What is missing?',
        options: [
          'The Linux kernel headers.',
          'The development package containing header files (e.g., `zlib1g-dev` or `zlib-devel`).',
          'Running make as root.',
          'Adding /usr/lib to $PATH.',
        ],
        correctOptionIndex: 1,
        hint: 'Distributions package runtime .so files separately from compile-time .h headers.',
        explanation: 'Runtime packages ship only `.so` files to save space; compiling against a library requires installing its matching `-dev` / `-devel` package.',
      },
      {
        id: 'ch16-q2',
        type: 'mcq',
        sectionRef: '16.4',
        prompt: 'Why does `./configure` default to `--prefix=/usr/local` instead of `--prefix=/usr`?',
        options: [
          'Because /usr is mounted read-only on all Linux systems.',
          'To keep locally compiled software cleanly separated from files managed by the distribution’s package manager in /usr.',
          'Because gcc cannot write binaries to /usr/bin.',
          'Because /usr/local is stored in RAM.',
        ],
        correctOptionIndex: 1,
        hint: 'What happens when apt/dnf upgrades a package if you manually overwrote files in /usr?',
        explanation: 'Installing custom builds into /usr/local (or /opt) prevents conflicts and accidental overwrites with OS package managers.',
      },
      {
        id: 'ch16-q3',
        type: 'fill_blank',
        sectionRef: '16.3',
        prompt: 'When `./configure` fails unexpectedly, which detailed log file in the build directory records the exact compiler tests and errors?',
        acceptedAnswers: ['config.log'],
        hint: 'Two words separated by a dot: config....',
        explanation: '`config.log` captures every test snippet and compiler/linker error encountered during `./configure`.',
      },
      {
        id: 'ch16-q4',
        type: 'scenario',
        sectionRef: '16.5',
        prompt: 'A unified patch file references `--- a/src/main.c` and `+++ b/src/main.c`, and you are currently sitting inside the unpacked source root (where `src/main.c` lives). Which `patch` flag strips the leading `a/` and `b/` path component?',
        options: ['patch -p0 < fix.patch', 'patch -p1 < fix.patch', 'patch -p2 < fix.patch', 'patch --prefix=1 < fix.patch'],
        correctOptionIndex: 1,
        hint: 'Count how many leading path segments (`a/`) must be removed so `a/src/main.c` becomes `src/main.c`.',
        explanation: '`-p1` strips exactly one leading slash-delimited segment (`a/` -> `src/main.c`), matching the current source directory.',
      },
    ],
    flashcards: [
      {
        id: 'fc-16-1',
        chapterNumber: 16,
        sectionRef: '16.3–16.4',
        front: 'What does each step of `./configure && make && sudo make install` do?',
        back: '1. ./configure: probes host toolchain/headers/libs & generates Makefile\n2. make: compiles source & links binaries\n3. make install: copies built binaries/docs into --prefix (default /usr/local)',
        tags: ['autotools', 'compiling'],
      },
      {
        id: 'fc-16-2',
        chapterNumber: 16,
        sectionRef: '16.6',
        front: 'How do you tell a header error apart from a linker error in C build logs?',
        back: 'Header error: "foo.h: No such file or directory" (missing -dev headers or -I path).\nLinker error: "undefined reference to func" (missing -l library or link order).',
        tags: ['debugging', 'compiling'],
      },
    ],
    keyTakeaways: [
      'Always inspect tarballs with `tar tvf` before unpacking and install custom builds to `/usr/local` or `--prefix`.',
      'Run `./configure` and `make` unprivileged; inspect `config.log` when configure fails.',
      'Missing `.h` files mean install `-dev`/`-devel` packages; `undefined reference` points to linker flags.',
    ],
  },

  {
    number: 17,
    id: 'ch-17',
    part: 'Part III: Automation, Services & Tooling',
    title: 'Virtualization',
    subtitle: 'Full Virtualization (KVM/QEMU), Containers (Namespaces, cgroups, OverlayFS), Docker Networking & Runtimes',
    sectionRange: '17.1 – 17.3',
    status: 'VALIDATED',
    estimatedMinutes: 45,
    prerequisites: [4, 8, 9],
    overview:
      'Chapter 17 brings together nearly every kernel subsystem you studied earlier—processes, filesystems, cgroups, and networking—to explain how virtualization and containers actually work under the hood. You will contrast hardware-assisted Virtual Machines (hypervisors, KVM/QEMU) against OS-level containers (Linux namespaces, cgroups, OverlayFS, and Docker’s virtual bridge network), plus lightweight language virtual environments.',
    learningObjectives: [
      'Compare Full Virtualization (Hypervisor + Guest Kernel via KVM/QEMU) against OS-level Containers (Shared Host Kernel + Namespaces + cgroups).',
      'Explain the three Linux kernel building blocks of containers: Namespaces (isolation), cgroups (resource limits), and Union/Overlay filesystems (layered images).',
      'Trace packet flow across a Docker bridge network: Host netns, docker0 bridge, veth pairs, Container netns, and NAT (Figure 17-1).',
      'Explain how language-level virtual environments (e.g., Python venv) isolate dependencies without kernel namespaces.',
    ],
    visualizerId: 'docker_netns_overlay',
    visualizerTitle: 'Interactive Docker Bridge (netns / docker0 / veth) & OverlayFS Visualizer',
    sections: [
      {
        id: 'ch17-17.1',
        number: '17.1',
        title: 'Virtual Machines (Hypervisors, KVM, QEMU, virtio)',
        subsections: ['17.1.1 Hardware Virtualization & Hypervisors', '17.1.2 KVM, QEMU & Paravirtualized virtio Drivers'],
        bookGroundedSummary:
          'A Virtual Machine emulates an entire computer—running its own independent guest kernel inside a hypervisor. On Linux, KVM turns the Linux kernel into a hardware-accelerated hypervisor while QEMU handles device emulation.',
        detailedExplanation: [
          'Because a VM runs a complete guest operating system kernel, you can run Windows, BSD, or a different Linux kernel version on a Linux host with strong hardware-enforced isolation (Intel VT-x / AMD-V CPU extensions).',
          '**KVM** (Kernel-based Virtual Machine) executes guest CPU instructions directly on host hardware at near-native speed, while **QEMU** provides virtualized hardware (BIOS/UEFI, PCI bus, disks, NICs).',
          'Emulating legacy physical hardware devices in software is slow, so Linux VMs use **virtio** (paravirtualized drivers): the guest kernel knows it is virtualized and passes disk/network buffers efficiently through shared ring buffers directly to the host hypervisor.',
        ],
      },
      {
        id: 'ch17-17.2',
        number: '17.2',
        title: 'Containers: Namespaces, cgroups, OverlayFS & Docker Networking (Figure 17-1)',
        subsections: [
          '17.2.1 How Containers Work (Shared Kernel, Namespaces, cgroups)',
          '17.2.2 Layered Filesystems (OverlayFS Copy-on-Write)',
          '17.2.3 Docker Bridge Networking (Host netns, docker0, veth, NAT — Figure 17-1)',
        ],
        bookGroundedSummary:
          'Containers are NOT miniature virtual machines—they are regular Linux processes sharing the host’s single Linux kernel, isolated by kernel Namespaces, metered by cgroups, rooted in OverlayFS image layers, and wired together with virtual Ethernet (veth) bridges (Figure 17-1).',
        detailedExplanation: [
          'Three kernel features power Docker/Podman containers:',
          '1. **Namespaces** isolate what a process can SEE: `pid` (its own PID 1), `mnt` (its own `/` filesystem tree), `net` (its own network interfaces, IP, and routing table), `uts` (hostname), `ipc`, and `user`.\n2. **cgroups** (Chapter 8) limit what a process can CONSUME (CPU quota, memory ceiling, I/O bandwidth).\n3. **OverlayFS** stacks read-only base image layers beneath a thin writable container layer using Copy-on-Write—so 10 containers built from the same Ubuntu image share one read-only base on disk and start in milliseconds.',
          'Trace Docker’s default bridge network in **Figure 17-1**: Each container gets its own network namespace (`Container netns`) containing `eth0`. That `eth0` is one end of a virtual Ethernet cable (**veth pair**); the other end (`veth<id>`) plugs into the host’s software bridge **`docker0`** inside `Host netns`. Outbound container packets cross `eth0 -> veth -> docker0`, undergo **NAT / IP Masquerading** (Chapter 9!) in host iptables/nftables, and leave through the host’s physical interface (`enp0s3` / `eth0`).',
        ],
        figureIds: ['fig-17-1'],
        codeExamples: [
          {
            title: 'Inspecting running containers and bridge networking',
            command: 'docker ps && ip -br addr show docker0',
            output: `CONTAINER ID   IMAGE          COMMAND                  STATUS         PORTS                  NAMES
8a41f02b9c11   nginx:alpine   "nginx -g 'daemon..."    Up 2 hours     0.0.0.0:8080->80/tcp   web-edge
docker0          UP             172.17.0.1/16`,
            explanation:
              'Docker attaches containers to the docker0 virtual bridge (172.17.0.1/16) via veth pairs and forwards host port 8080 into container port 80.',
          },
        ],
      },
      {
        id: 'ch17-17.3',
        number: '17.3',
        title: 'Runtime & Language Virtual Environments (Python venv)',
        subsections: ['17.3 Language-Level Isolation (Python venv, PATH & library isolation)'],
        bookGroundedSummary:
          'When you only need isolated language packages rather than OS/network isolation, lightweight runtime environments like Python `venv` isolate dependencies purely via directory paths and `$PATH` adjustments.',
        detailedExplanation: [
          'Running `python3 -m venv test-venv` creates a self-contained directory containing a symlinked Python interpreter and isolated `site-packages`. Sourcing `. test-venv/bin/activate` simply prepends `test-venv/bin` to your shell’s `$PATH` so `python` and `pip` install packages locally without touching system Python.',
        ],
        supplementalNote:
          'Source Audit Erratum: In Section 17.3 of the 3rd edition source text, the example creates `test-venv` (`python3 -m venv test-venv`) and then types `. test-env/bin/activate` (omitting the letter `v`). The correct activation path is `. test-venv/bin/activate`.',
      },
    ],
    glossary: [
      { term: 'Linux Namespaces', definition: 'Kernel isolation primitives (pid, net, mnt, uts, ipc, user) giving container processes their own private view of system resources.', sectionRef: '17.2' },
      { term: 'veth Pair & docker0 Bridge', definition: 'Virtual Ethernet cable connecting a container’s network namespace (eth0) to the host’s docker0 software switch.', sectionRef: '17.2' },
      { term: 'OverlayFS', definition: 'Union filesystem stacking immutable image layers beneath a thin Copy-on-Write writable container layer.', sectionRef: '17.2' },
      { term: 'KVM / QEMU / virtio', definition: 'Linux’s hardware-accelerated hypervisor (KVM), device emulator (QEMU), and high-speed paravirtualized drivers (virtio).', sectionRef: '17.1' },
    ],
    terminalLab: {
      intro: 'Inspect simulated Docker containers, bridge interfaces, and namespace isolation.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch17-t1',
          title: 'Inspect running containers',
          instruction: 'Run docker ps to list active containers and their published port mappings.',
          hint: 'Type docker ps',
          expectedPattern: '^docker\\s+ps',
          commandExplanation: 'docker ps queries the Docker daemon over /var/run/docker.sock for running container metadata.',
          sampleCommand: 'docker ps',
        },
        {
          id: 'ch17-t2',
          title: 'Inspect the docker0 virtual bridge',
          instruction: 'Inspect the host network interfaces with ip addr to locate the docker0 bridge.',
          hint: 'Run ip addr',
          expectedPattern: '^ip\\s+(addr|a)',
          commandExplanation: 'docker0 acts as a virtual Layer-2 switch inside the host network namespace.',
          sampleCommand: 'ip addr',
        },
      ],
    },
    assessments: [
      {
        id: 'ch17-q1',
        type: 'mcq',
        sectionRef: '17.2',
        prompt: 'What is the fundamental architectural difference between a KVM Virtual Machine and a Docker container running on Linux?',
        options: [
          'Containers emulate x86 hardware in software; VMs share the host kernel.',
          'A VM boots its own independent guest OS kernel atop a hypervisor, whereas a container runs as isolated processes sharing the host’s single Linux kernel via namespaces and cgroups.',
          'Containers cannot access the network.',
          'VMs cannot run Linux.',
        ],
        correctOptionIndex: 1,
        hint: 'Compare Sections 17.1 and 17.2.',
        explanation: 'Containers achieve near-instant startup and low overhead precisely because they share the host Linux kernel instead of booting a second guest kernel.',
      },
      {
        id: 'ch17-q2',
        type: 'scenario',
        sectionRef: '17.2',
        prompt: 'In Figure 17-1 (Docker bridge network), trace how a packet from a container’s `eth0` reaches an external internet server.',
        options: [
          'Container eth0 -> direct physical NIC bypass -> Internet',
          'Container eth0 -> veth pair -> host docker0 bridge -> host routing + NAT/Masquerading -> physical host NIC',
          'Container eth0 -> OverlayFS -> GRUB -> Internet',
          'Container eth0 -> Unix domain socket -> DNS server',
        ],
        correctOptionIndex: 1,
        hint: 'Follow the arrows from Container netns to Host netns in Figure 17-1.',
        explanation: 'The veth pair bridges the container’s netns into host docker0, after which host routing and iptables NAT forward packets out the host’s physical interface.',
      },
      {
        id: 'ch17-q3',
        type: 'fill_blank',
        sectionRef: '17.2',
        prompt: 'Which Linux kernel feature gives a container its own isolated view of PIDs, mount points, hostnames, and network interfaces?',
        acceptedAnswers: ['namespaces', 'namespace', 'linux namespaces'],
        hint: 'Paired with cgroups (which handle resource limits).',
        explanation: 'Namespaces isolate visibility (what a process can see), while cgroups control resource allocation (how much CPU/RAM/I/O it can use).',
      },
      {
        id: 'ch17-q4',
        type: 'short_answer',
        sectionRef: '17.2',
        prompt: 'Explain the distinct roles of Namespaces, cgroups, and OverlayFS inside a Linux container.',
        rubricKeywords: ['namespace', 'cgroup', 'overlay'],
        acceptedAnswers: ['namespaces isolate visibility, cgroups limit resources, overlayfs stacks layered images'],
        hint: 'Map each of the three kernel features to visibility, limits, and storage.',
        explanation: 'Namespaces isolate process views (PID, net, mnt); cgroups cap CPU/memory/I/O consumption; OverlayFS layers a thin writable filesystem over shared read-only image layers.',
      },
    ],
    flashcards: [
      {
        id: 'fc-17-1',
        chapterNumber: 17,
        sectionRef: '17.2',
        front: 'What are the three Linux kernel technologies that make containers possible?',
        back: '1. Namespaces (isolate PID, net, mount, UTS, IPC, user views)\n2. cgroups (enforce CPU/RAM/I/O limits)\n3. OverlayFS / union filesystems (layered copy-on-write images)',
        tags: ['containers', 'kernel'],
      },
      {
        id: 'fc-17-2',
        chapterNumber: 17,
        sectionRef: '17.2',
        front: 'How does a veth pair connect a Docker container to the host network (Figure 17-1)?',
        back: 'Like a virtual patch cable: one end sits inside the container’s netns as eth0, and the other end plugs into the host’s docker0 bridge.',
        tags: ['docker', 'networking'],
      },
    ],
    keyTakeaways: [
      'VMs (KVM/QEMU) virtualize hardware and run separate guest kernels; containers share the host kernel via namespaces, cgroups, and OverlayFS.',
      'Docker bridge networking wires container netns -> veth -> docker0 -> host NAT -> physical NIC.',
      'Use lightweight language virtual environments (like Python venv) when you only need isolated package paths.',
    ],
  },
];
