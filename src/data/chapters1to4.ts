import { ChapterModule } from './types';

export const CHAPTERS_1_TO_4: ChapterModule[] = [
  {
    number: 1,
    id: 'ch-1',
    part: 'Part I: Foundations',
    title: 'The Big Picture',
    subtitle: 'Abstractions, Hardware, the Linux Kernel, User Space, and Users',
    sectionRange: '1.1 – 1.6',
    status: 'VALIDATED',
    estimatedMinutes: 30,
    prerequisites: [],
    overview:
      'Before learning individual Linux commands or configuration files, you need a clear mental model of how a Linux system is layered. Chapter 1 introduces the three primary levels of abstraction—Hardware, the Linux Kernel, and User Processes—and explains how the kernel arbitrates CPU time, memory, devices, and system calls so user-space programs can run safely and concurrently.',
    learningObjectives: [
      'Distinguish between hardware, kernel space (kernel mode), and user space (user mode).',
      'Explain the four core responsibilities of the Linux kernel: process management, memory management, device drivers, and system calls.',
      'Trace how a shell creates and runs a new program using the fork() and exec() system calls.',
      'Explain the roles of interactive processes, services/daemons, and superuser (root) vs. normal user accounts.',
    ],
    visualizerId: 'architecture_fork',
    visualizerTitle: 'Interactive 3-Layer Architecture & fork()/exec() Lifecycle',
    sections: [
      {
        id: 'ch1-1.1',
        number: '1.1–1.2',
        title: 'Levels of Abstraction & Hardware: Understanding Main Memory',
        subsections: ['1.1 Levels and Layers of Abstraction', '1.2 Hardware: Understanding Main Memory'],
        bookGroundedSummary:
          'Modern operating systems hide staggering hardware complexity behind clean layers of abstraction. At the base sits physical hardware: CPU, main memory (RAM), disks, and network interfaces.',
        detailedExplanation: [
          'Abstraction means organizing complex systems into layers where each layer only needs to understand the interface directly beneath it. Rather than every text editor or web browser talking directly to disk sectors or network cards, programs rely on operating system interfaces.',
          'Main memory (RAM) is essentially a giant, fast array of addressable storage cells holding both running program instructions and data. The CPU reads instructions from memory, executes operations, and writes results back.',
          'A running program together with its memory state is called a process. In its raw hardware form, a program is just machine code bytes sitting in memory; the operating system gives that state structure and isolation.',
        ],
        figureIds: ['fig-1-1'],
        quickCheck: {
          prompt: 'Why does Linux place a kernel layer between user processes and hardware?',
          answer:
            'So user processes do not have to implement hardware-specific code and cannot corrupt memory or devices belonging to other processes. The kernel mediates all shared resource access safely.',
        },
      },
      {
        id: 'ch1-1.3',
        number: '1.3',
        title: 'The Kernel: Process, Memory, Device, and System Call Management',
        subsections: [
          '1.3.1 Process Management',
          '1.3.2 Memory Management',
          '1.3.3 Device Drivers and Management',
          '1.3.4 System Calls and Support',
        ],
        bookGroundedSummary:
          'The Linux kernel runs in privileged kernel mode with unrestricted hardware access. It manages four foundational subsystems: CPU scheduling, memory isolation, hardware device drivers, and system calls.',
        detailedExplanation: [
          'Process management (multitasking): On a system with dozens of processes competing for limited CPU cores, the kernel gives each runnable process a brief time slice. When a slice expires or a process waits on I/O, the kernel performs a context switch—saving CPU registers/state for the outgoing process and restoring state for the next.',
          'Memory management: The kernel tracks which memory pages belong to itself and each process, enforcing strict isolation via hardware virtual memory (MMU). A bug in one user process cannot overwrite another process’s RAM or kernel memory.',
          'Device drivers: Hardware varies wildly across vendors. Drivers inside the kernel translate generic operations (read/write bytes or blocks) into hardware-specific controller signals, presenting consistent interfaces to user space.',
          'System calls (syscalls): User-space processes cannot execute privileged instructions directly. Instead, they invoke well-defined kernel entry points such as read(), write(), open(), fork(), and exec(). Notice in Figure 1-2 how running a command like ls in a shell splits into two distinct syscalls: fork() clones the shell process, and exec() replaces the child’s memory image with the ls program.',
        ],
        figureIds: ['fig-1-2'],
        codeExamples: [
          {
            title: 'Inspecting running kernel release and processes',
            command: 'uname -r && ps -ef | head -n 6',
            output: `5.15.0-91-generic
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 08:00 ?        00:00:02 /sbin/init
root         2     0  0 08:00 ?        00:00:00 [kthreadd]
juser     1420  1418  0 08:04 pts/0    00:00:00 -bash
juser     1512  1420  0 08:06 pts/0    00:00:00 ps -ef`,
            explanation:
              'Notice that the shell (PID 1420) is the parent (PPID) of ps (PID 1512). The shell forked a copy of itself and then called exec() to load the ps binary.',
          },
        ],
        supplementalNote:
          'On modern Linux systems, fork() uses Copy-on-Write (COW) so the kernel does not actually duplicate all of the parent’s RAM pages before exec() immediately replaces them—making process spawning remarkably fast.',
      },
      {
        id: 'ch1-1.4',
        number: '1.4–1.6',
        title: 'User Space, Users (Root vs. Normal), and Looking Forward',
        subsections: ['1.4 User Space', '1.5 Users', '1.6 Looking Forward'],
        bookGroundedSummary:
          'Everything outside the kernel runs in user space with restricted CPU privileges. User-space processes collaborate across layers—from low-level system services like logging and name caching up to interactive shells and browsers—governed by user identities.',
        detailedExplanation: [
          'User space encompasses all user processes: interactive shells, graphical desktops, web browsers, compilers, and background server daemons (diagnostic logging, network configuration, communication buses like D-Bus, and DNS caching servers, shown in Figure 1-3).',
          'Because user processes run in unprivileged user mode, a crash in a browser or web server stays contained and will not bring down the entire operating system.',
          'Linux enforces multi-user ownership and permissions through user accounts. Every process runs as a specific user. Normal user accounts can modify their own files and run standard programs, while the superuser account (root, UID 0) bypasses standard permission checks to perform system administration.',
          'In addition to human login accounts, Linux defines system/pseudo-user accounts (for example, www-data or nobody) so background services run with minimal privileges rather than as root.',
        ],
        figureIds: ['fig-1-3'],
        supplementalNote:
          'Source Audit Note: Section 1.5 of the book briefly points ahead to "Chapter 3" for pseudo-users; in the 3rd edition, pseudo-users and /etc/passwd mechanics are actually detailed in Chapter 7 (Section 7.3.2).',
      },
    ],
    glossary: [
      {
        term: 'Kernel Mode vs. User Mode',
        definition: 'CPU privilege states: kernel mode grants unrestricted access to memory and hardware; user mode restricts processes to their own virtual memory and system call interfaces.',
        sectionRef: '1.3–1.4',
      },
      {
        term: 'Context Switch',
        definition: 'The kernel operation of suspending one running process, saving its CPU state, and loading another process’s state to enable multitasking.',
        sectionRef: '1.3.1',
      },
      {
        term: 'fork() and exec()',
        definition: 'The pair of Unix/Linux system calls used to start programs: fork() creates a duplicate child process, and exec() replaces the child’s memory image with a new executable.',
        sectionRef: '1.3.4',
      },
      {
        term: 'Superuser (root)',
        definition: 'The privileged administrative user account (UID 0) capable of reading/writing any file, managing devices, and controlling all processes.',
        sectionRef: '1.5',
      },
    ],
    terminalLab: {
      intro: 'Explore the boundary between kernel info, user identity, and the shell’s process tree in the simulated Linux environment.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch1-t1',
          title: 'Identify the running user and kernel',
          instruction: 'Display your current username using whoami (or id) and check the kernel name/release with uname -a.',
          hint: 'Run uname -a to inspect the simulated kernel release.',
          expectedPattern: 'uname',
          commandExplanation: 'uname queries kernel metadata exposed via the uname() system call.',
          sampleCommand: 'uname -a',
        },
        {
          id: 'ch1-t2',
          title: 'Inspect the process hierarchy',
          instruction: 'List active processes with parent PIDs using ps -ef to observe how processes descend from PID 1.',
          hint: 'Type ps -ef and press Enter.',
          expectedPattern: '^ps\\b',
          commandExplanation: 'ps reads process tables from the kernel’s /proc virtual filesystem.',
          sampleCommand: 'ps -ef',
        },
      ],
    },
    assessments: [
      {
        id: 'ch1-q1',
        type: 'mcq',
        sectionRef: '1.3.4',
        prompt: 'When you type ls in a shell and press Enter, what is the exact sequence of system calls the shell uses to start the ls program?',
        options: [
          'The shell calls spawn(ls) directly in kernel mode.',
          'The shell calls fork() to create a copy of itself, and the child calls exec() to replace its image with ls.',
          'The shell calls exec(ls) directly without forking, then reloads itself afterward.',
          'The kernel intercepts the keyboard buffer and starts ls bypassing the shell.',
        ],
        correctOptionIndex: 1,
        hint: 'Recall Figure 1-2: the original shell must stay alive while a copy transforms into ls.',
        explanation:
          'If the shell called exec() without fork(), the shell itself would be overwritten by ls and your terminal session would end when ls exited. Forking first preserves the parent shell.',
      },
      {
        id: 'ch1-q2',
        type: 'true_false',
        sectionRef: '1.3.2',
        prompt: 'True or False: In Linux, a user-space program can directly access physical RAM belonging to another user’s process if it knows the memory address.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Consider the role of kernel memory management and virtual address isolation.',
        explanation:
          'False. The kernel and CPU memory management unit isolate every user-space process in its own virtual address space, preventing unauthorized cross-process memory reads or writes.',
      },
      {
        id: 'ch1-q3',
        type: 'fill_blank',
        sectionRef: '1.3.1',
        prompt: 'The kernel operation of saving the CPU state of a running process and restoring another process’s state so multiple processes share CPU cores is called a ________.',
        acceptedAnswers: ['context switch', 'context-switch', 'context switching'],
        hint: 'Two words: switching the execution "context" of the CPU.',
        explanation:
          'A context switch lets the kernel preemptively multitask many processes across finite CPU cores.',
      },
      {
        id: 'ch1-q4',
        type: 'scenario',
        sectionRef: '1.4–1.5',
        prompt: 'A web server daemon crashes due to a memory corruption bug. Why does the rest of the Linux server—including your SSH session—keep running normally?',
        options: [
          'Because the web server runs inside the kernel and the kernel restarts it instantly.',
          'Because the web server runs as an isolated user-space process with restricted privileges, so its fault is caught by the kernel without corrupting other processes or kernel memory.',
          'Because Linux automatically runs all daemons inside separate virtual machines.',
          'Because SSH communicates directly with the NIC bypassing the kernel.',
        ],
        correctOptionIndex: 1,
        hint: 'Think about user mode isolation vs. kernel mode.',
        explanation:
          'User-space isolation ensures an illegal memory access (SIGSEGV) terminates only the offending user process while kernel memory and sibling processes remain untouched.',
      },
      {
        id: 'ch1-q5',
        type: 'short_answer',
        sectionRef: '1.3',
        prompt: 'Briefly name the four primary areas of responsibility handled by the Linux kernel according to Chapter 1.',
        rubricKeywords: ['process', 'memory', 'device', 'system call'],
        acceptedAnswers: ['process management, memory management, device drivers, system calls'],
        hint: 'Look at the four boxes inside the "Linux Kernel" layer of Figure 1-1.',
        explanation:
          'As illustrated in Figure 1-1, the kernel handles: (1) Process management, (2) Memory management, (3) Device drivers, and (4) System calls.',
      },
    ],
    flashcards: [
      {
        id: 'fc-1-1',
        chapterNumber: 1,
        sectionRef: '1.1',
        front: 'What are the three primary levels of abstraction in a Linux system (Figure 1-1)?',
        back: '1. Hardware (CPU, RAM, disks, network ports)\n2. Linux Kernel (syscalls, process & memory management, device drivers)\n3. User Processes (GUI, servers/daemons, shell)',
        tags: ['architecture', 'abstraction'],
      },
      {
        id: 'fc-1-2',
        chapterNumber: 1,
        sectionRef: '1.3.4',
        front: 'Why does Linux use both fork() and exec() to launch a new command from a shell?',
        back: 'fork() creates a duplicate child process so the parent shell stays alive; exec() then replaces the child’s memory image with the target program.',
        tags: ['syscalls', 'processes'],
      },
      {
        id: 'fc-1-3',
        chapterNumber: 1,
        sectionRef: '1.5',
        front: 'What is the purpose of pseudo-users (system accounts) in Linux?',
        back: 'They allow background services/daemons to run with restricted file and system permissions instead of running as root (UID 0), reducing security blast radius.',
        tags: ['users', 'security'],
      },
    ],
    keyTakeaways: [
      'Linux separates Hardware, the privileged Kernel, and unprivileged User Processes into clean abstraction layers.',
      'The kernel multiplexes CPU cores via context switches, isolates process memory, abstracts hardware with drivers, and exposes services via system calls.',
      'New processes are created via fork() followed by exec().',
      'Normal and pseudo-user accounts enforce least privilege; only root (UID 0) holds unrestricted system-wide authority.',
    ],
  },

  {
    number: 2,
    id: 'ch-2',
    part: 'Part I: Foundations',
    title: 'Basic Commands and Directory Hierarchy',
    subtitle: 'Shell Mechanics, Streams, Permissions, Archiving, and the Linux Directory Tree',
    sectionRange: '2.1 – 2.21',
    status: 'VALIDATED',
    estimatedMinutes: 55,
    prerequisites: [1],
    overview:
      'Chapter 2 builds daily command-line fluency and demystifies how Linux organizes every file under a single root (/). You will master shell quoting, wildcards, environment variables, standard I/O redirection, file permissions and octal modes, archiving with tar/gzip, and the exact purpose of every top-level directory.',
    learningObjectives: [
      'Use core file, text, and navigation utilities (ls, cp, mv, rm, grep, head, tail, sort, diff, file, find) with precision.',
      'Control shell expansion using glob wildcards, single quotes, double quotes, and environment variables.',
      'Connect commands with pipelines (|) and redirect stdout, stderr, and stdin (>, >>, 2>&1, <).',
      'Decode and calculate file modes, symbolic/octal chmod permissions, umask defaults, and hard vs. symbolic links.',
      'Navigate the Linux directory hierarchy (FHS) and explain the role of /bin, /dev, /etc, /usr, /var, /proc, /sys, and /run.',
    ],
    visualizerId: 'permissions_fhs',
    visualizerTitle: 'Interactive File Mode / umask Calculator & FHS Directory Explorer',
    sections: [
      {
        id: 'ch2-2.1',
        number: '2.1–2.5',
        title: 'The Bourne Shell, Basic Commands, Navigation & Intermediate Utilities',
        subsections: [
          '2.1 The Bourne Shell: /bin/sh',
          '2.2 Using the Shell (Window, cat, stdin/stdout)',
          '2.3 Basic Commands (ls, cp, mv, touch, rm, echo)',
          '2.4 Navigating Directories (cd, mkdir, rmdir, globbing)',
          '2.5 Intermediate Commands (grep, less, pwd, diff, file, find, head/tail, sort)',
        ],
        bookGroundedSummary:
          'The shell is a user-space command interpreter—typically bash on Linux, compatible with the classic Bourne shell (/bin/sh). It parses your command line, expands wildcards and variables, and runs utilities.',
        detailedExplanation: [
          'Core file commands follow a predictable pattern: command [options] [arguments]. Options beginning with a single dash (-l, -a) can often be bundled (-la), while GNU-style long options use double dashes (--all).',
          'Shell globbing (* matches any sequence of characters; ? matches a single character) is expanded by the shell BEFORE the command ever runs. That means rm *.tmp receives the expanded list of matching filenames as arguments.',
          'Text and inspection tools form the Unix toolbox: grep searches lines matching patterns, diff compares files line-by-line, file inspects magic bytes (not filename extensions!) to determine file type, find recursively searches directory trees by name/type/size/time, and head/tail/sort filter output streams.',
        ],
        codeExamples: [
          {
            title: 'Finding and filtering text with core utilities',
            command: 'grep -n "root" /etc/passwd && file /bin/ls',
            output: `1:root:x:0:0:root:/root:/bin/bash
/bin/ls: ELF 64-bit LSB pie executable, x86-64`,
            explanation:
              'grep locates matching lines with line numbers (-n), while file identifies an executable binary by its ELF header rather than any file extension.',
          },
        ],
      },
      {
        id: 'ch2-2.6',
        number: '2.6–2.13',
        title: 'Variables, Quoting, Paths, Redirection, Jobs & Signals',
        subsections: [
          '2.6 Changing Password & Shell',
          '2.7 Dot Files',
          '2.8 Environment & Shell Variables',
          '2.9 The Command Path ($PATH)',
          '2.10 Special Characters & Quoting',
          '2.11 Command-Line Editing (Table 2-1)',
          '2.12 Text Editors & 2.13 Getting Online Help (man sections, Table 2-2)',
          '2.14 Shell Input and Output (Pipes, >, >>, 2>&1)',
          '2.15 Understanding Error Messages (Table 2-3)',
          '2.16 Listing and Manipulating Processes (ps, kill, jobs, bg/fg)',
        ],
        bookGroundedSummary:
          'Understanding how the shell locates binaries ($PATH), handles quotes, routes standard I/O streams (fd 0, 1, 2), interprets Unix errors, and signals running processes is essential for avoiding costly mistakes.',
        detailedExplanation: [
          'Shell variables (VAR=value) live inside the current shell only; exporting them (export VAR) places them in the environment inherited by child processes. $PATH is a colon-separated list of directories searched in order when you type a command without a slash.',
          'Quoting controls expansion: single quotes (\'...\') preserve every character literally, while double quotes ("...") prevent word splitting and globbing but still allow $VAR expansion.',
          'Every process starts with three standard file descriptors: 0 (stdin), 1 (stdout), and 2 (stderr). Use > to overwrite stdout to a file, >> to append, | to feed stdout into another command’s stdin, and 2>&1 (after > file) to merge stderr into the same destination as stdout.',
          'Unix error messages consistently follow the format program: target: reason (for example, ls: cannot access \'/nope\': No such file or directory). Knowing standard kernel errors (Table 2-3) speeds up debugging dramatically.',
        ],
        table: {
          id: 'table-2-2',
          number: 'Table 2-2',
          title: 'Manual (man) Page Sections',
          headers: ['Section', 'Contents'],
          rows: [
            ['1', 'User commands (e.g., ls, grep, chmod)'],
            ['2', 'System calls (kernel entry points like open, fork)'],
            ['3', 'Higher-level C library functions (e.g., printf, malloc)'],
            ['4', 'Special files and device interfaces'],
            ['5', 'File formats and configuration files (e.g., passwd, fstab)'],
            ['6', 'Games'],
            ['7', 'Miscellaneous conventions, protocols, and overviews'],
            ['8', 'System administration commands (e.g., mount, systemctl, iptables)'],
          ],
        },
        codeExamples: [
          {
            title: 'Redirecting both stdout and stderr to a log file',
            command: 'ls /etc/passwd /nonexistent > output.log 2>&1',
            explanation:
              'Order matters! > output.log points fd 1 to output.log first, then 2>&1 copies fd 1’s target into fd 2 so errors and normal output land in the same file.',
          },
        ],
      },
      {
        id: 'ch2-2.17',
        number: '2.17–2.18',
        title: 'File Modes, Permissions, chmod, umask, Links & Archiving',
        subsections: [
          '2.17 File Modes and Permissions (chmod, symbolic links, umask)',
          '2.18 Archiving and Compressing Files (gzip, tar)',
        ],
        bookGroundedSummary:
          'Every file and directory carries a 10-character mode string (Figure 2-1) encoding its type and Read/Write/Execute bits for User, Group, and Other, alongside symbolic/hard links and standard tar/gzip archives.',
        detailedExplanation: [
          'In ls -l output like -rw-r--r--, the first character is the file type (- regular file, d directory, l symbolic link, b block device, c character device). The next nine characters form three triplets: User (owner), Group, and Other (world).',
          'For directories, execute (x) permission does NOT mean "run"—it means permission to traverse (enter/cd into or access files inside) the directory. Read (r) on a directory allows listing filenames inside it.',
          'Octal notation sums bit values per triplet: r=4, w=2, x=1. Thus 755 equals rwxr-xr-x and 644 equals rw-r--r--. Your shell’s umask (commonly 022) subtracts bits from default creation permissions (666 for files, 777 for directories), producing 644 and 755.',
          'Symbolic links (ln -s target linkname) store a pathname pointing to another file—they can cross filesystems and point to directories, but break ("dangle") if the target moves. Archiving combines files with tar (tape archive) and compresses with gzip (.tar.gz / .tgz): tar cvzf to create, tar tvzf to inspect, and tar xvzf to extract.',
        ],
        figureIds: ['fig-2-1'],
        table: {
          id: 'table-2-4',
          number: 'Table 2-4',
          title: 'Common Absolute (Octal) Permission Modes',
          headers: ['Octal Mode', 'Symbolic Mode', 'Typical Usage'],
          rows: [
            ['644', '-rw-r--r--', 'Standard readable data/text files (owner read/write, everyone read)'],
            ['600', '-rw-------', 'Private files such as SSH private keys or secrets'],
            ['755', '-rwxr-xr-x', 'Standard executable programs, scripts, and public directories'],
            ['700', '-rwx------', 'Private directories or scripts accessible only by owner'],
            ['711', '-rwx--x--x', 'Directories users can traverse by known path without listing contents'],
          ],
        },
        quickCheck: {
          prompt: 'If a directory has permissions drwx--x--x (711), can another user read a file inside it if they know its exact filename and the file is 644?',
          answer:
            'Yes! Execute (x) on the directory allows traversing through it to open known paths; lacking read (r) only prevents listing the directory’s filenames with ls.',
        },
      },
      {
        id: 'ch2-2.19',
        number: '2.19–2.21',
        title: 'The Linux Directory Hierarchy (FHS), /usr, and Kernel Interfaces',
        subsections: [
          '2.19 The Linux Directory Hierarchy Essentials',
          '2.20 Other Root Subdirectories',
          '2.21 Running Commands as the Superuser (sudo)',
        ],
        bookGroundedSummary:
          'Unlike drive-letter operating systems, Linux mounts every filesystem into a single inverted tree rooted at / (Figure 2-2). Each top-level directory serves a distinct architectural role.',
        detailedExplanation: [
          '/bin & /sbin: Essential user and system-administration binaries needed early in boot (on many modern distros, merged as symlinks into /usr/bin and /usr/sbin).',
          '/dev: Device files representing hardware and pseudo-devices (/dev/sda, /dev/null, /dev/zero).',
          '/etc: Host-specific system configuration files (/etc/passwd, /etc/fstab, /etc/systemd).',
          '/home & /root: Personal directories for normal users and the superuser’s separate home directory.',
          '/usr: The largest static hierarchy containing most user programs (/usr/bin), libraries (/usr/lib), documentation (/usr/share), and locally compiled software (/usr/local).',
          '/var: Variable runtime data that grows or changes over time—logs (/var/log), spool queues, caches, and databases.',
          '/proc, /sys, and /run: Special virtual/in-memory filesystems! /proc exposes kernel and process information as files, /sys exports structured device/driver trees, and /run holds transient runtime state (PID files, sockets) cleared on reboot.',
        ],
        figureIds: ['fig-2-2'],
        supplementalNote:
          'Most contemporary Linux distributions (Debian 12+, Ubuntu 20.04+, Fedora, Arch) implement the "/usr merge", making /bin -> /usr/bin, /sbin -> /usr/sbin, and /lib -> /usr/lib symbolic links.',
      },
    ],
    glossary: [
      { term: 'Globbing', definition: 'Shell expansion of wildcard characters (*, ?, [...]) into matching filenames prior to invoking a command.', sectionRef: '2.4' },
      { term: 'Standard Streams (stdin/stdout/stderr)', definition: 'Default I/O channels (file descriptors 0, 1, 2) attached to every process for input, normal output, and diagnostics.', sectionRef: '2.14' },
      { term: 'umask', definition: 'A bitmask subtracting default permissions from newly created files (base 666) and directories (base 777).', sectionRef: '2.17' },
      { term: '/proc and /sys', definition: 'Virtual kernel filesystems exposing live process state, kernel tunables, and hardware/driver topology without occupying disk space.', sectionRef: '2.19' },
    ],
    terminalLab: {
      intro: 'Practice pipelines, redirection, file permissions, and directory hierarchy inspection in the simulated shell.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch2-t1',
          title: 'Inspect hidden files and modes',
          instruction: 'Run ls -la in your home directory to inspect dotfiles and full 10-character permission strings.',
          hint: 'Type ls -la and press Enter.',
          expectedPattern: '^ls\\s+-(?=.*l)(?=.*a)',
          commandExplanation: '-l prints long format (mode, link count, owner, group, size, timestamp) and -a reveals dotfiles starting with ".".',
          sampleCommand: 'ls -la',
        },
        {
          id: 'ch2-t2',
          title: 'Make a script executable with octal chmod',
          instruction: 'Set permissions on ~/notes.txt to 600 (owner read/write only) using chmod.',
          hint: 'Run chmod 600 notes.txt',
          expectedPattern: '^chmod\\s+600\\s+(.*notes\\.txt)',
          commandExplanation: 'Octal 600 maps to rw------- (6=4+2 for user, 0 for group, 0 for other).',
          sampleCommand: 'chmod 600 notes.txt',
        },
        {
          id: 'ch2-t3',
          title: 'Filter /etc/passwd with a pipeline',
          instruction: 'Search /etc/passwd for lines containing "bash" using grep.',
          hint: 'Run grep bash /etc/passwd',
          expectedPattern: 'grep.*bash.*/etc/passwd',
          commandExplanation: 'grep reads /etc/passwd and outputs only lines matching the pattern "bash".',
          sampleCommand: 'grep bash /etc/passwd',
        },
      ],
    },
    assessments: [
      {
        id: 'ch2-q1',
        type: 'command_write',
        sectionRef: '2.17',
        prompt: 'Write the chmod command using octal notation to give the owner full permissions (rwx), the group read+execute (r-x), and others read+execute (r-x) on a file named deploy.sh.',
        acceptedAnswers: ['chmod 755 deploy.sh', 'chmod 0755 deploy.sh'],
        hint: 'r=4, w=2, x=1. Calculate User, Group, and Other digits.',
        explanation: 'User: 4+2+1=7, Group: 4+0+1=5, Other: 4+0+1=5 -> chmod 755 deploy.sh.',
      },
      {
        id: 'ch2-q2',
        type: 'output_interpret',
        sectionRef: '2.17',
        prompt: 'Examine the ls -l output below. What does the leading letter "l" indicate, and what are the effective permissions shown?',
        codeBlock: 'lrwxrwxrwx 1 root root 7 Oct 12 09:00 /bin -> usr/bin',
        options: [
          'A hard link with locked permissions.',
          'A symbolic link pointing to usr/bin (actual access is governed by the target’s permissions).',
          'A local socket file owned by root.',
          'A regular file with the sticky bit enabled.',
        ],
        correctOptionIndex: 1,
        hint: 'Check Figure 2-1 for the first character (Type) of a file mode.',
        explanation: 'Leading "l" denotes a symbolic link. Symlinks always display rwxrwxrwx; the kernel checks permissions on the target file instead.',
      },
      {
        id: 'ch2-q3',
        type: 'debug',
        sectionRef: '2.14',
        prompt: 'A user wants to save BOTH standard output and error output of a command into run.log, so they run: `find /etc -name "*.conf" 2>&1 > run.log`. Why do errors STILL print to the terminal?',
        options: [
          'Because find does not use stderr.',
          'Because shell redirections are evaluated left-to-right: 2>&1 pointed stderr to the terminal BEFORE > run.log redirected stdout.',
          'Because 2>&1 only works with pipes, not files.',
          'Because run.log must exist beforehand.',
        ],
        correctOptionIndex: 1,
        hint: 'Trace what fd 1 points to at the moment 2>&1 executes.',
        explanation: 'Redirections are processed left-to-right. To merge stderr into run.log, write `> run.log 2>&1` so fd 1 points to run.log before fd 2 duplicates fd 1.',
      },
      {
        id: 'ch2-q4',
        type: 'fill_blank',
        sectionRef: '2.19',
        prompt: 'Which virtual top-level directory exposes live kernel and process information (such as CPU details and per-PID metadata) as readable files? (Include the leading slash.)',
        acceptedAnswers: ['/proc', '/proc/'],
        hint: 'Short for "processes".',
        explanation: '/proc is a virtual filesystem generated dynamically by the kernel to expose process and system state.',
      },
      {
        id: 'ch2-q5',
        type: 'mcq',
        sectionRef: '2.13',
        prompt: 'You want to read the manual page for the /etc/passwd file format rather than the passwd command. Which command should you run?',
        options: ['man 1 passwd', 'man 3 passwd', 'man 5 passwd', 'man 8 passwd'],
        correctOptionIndex: 2,
        hint: 'Consult Table 2-2 (man page sections).',
        explanation: 'Section 1 covers user commands (the passwd utility), while Section 5 documents file formats and configuration files (/etc/passwd).',
      },
    ],
    flashcards: [
      {
        id: 'fc-2-1',
        chapterNumber: 2,
        sectionRef: '2.17',
        front: 'What does the execute (x) bit control on a Linux directory?',
        back: 'Traversal/search permission—the ability to cd into the directory or access files inside it by name. (Read r controls listing filenames.)',
        tags: ['permissions', 'directories'],
      },
      {
        id: 'fc-2-2',
        chapterNumber: 2,
        sectionRef: '2.14',
        front: 'Why must you write `cmd > out.txt 2>&1` instead of `cmd 2>&1 > out.txt`?',
        back: 'Redirections evaluate left-to-right. `> out.txt` redirects fd 1 first so `2>&1` then points fd 2 to the file rather than the original terminal.',
        tags: ['redirection', 'shell'],
      },
      {
        id: 'fc-2-3',
        chapterNumber: 2,
        sectionRef: '2.19',
        front: 'Distinguish /etc, /var, and /run in the Linux directory hierarchy.',
        back: '/etc: host configuration files\n/var: persistent variable data (logs, spools, caches)\n/run: transient runtime data (PID files, sockets) recreated on every boot',
        tags: ['fhs', 'directories'],
      },
    ],
    keyTakeaways: [
      'The shell performs globbing, variable expansion, and I/O redirection before executing commands.',
      'File modes encode type plus User/Group/Other rwx bits; umask subtracts bits from default creation modes.',
      'The FHS cleanly separates static binaries (/usr), config (/etc), variable persistent data (/var), device nodes (/dev), and kernel virtual trees (/proc, /sys).',
    ],
  },

  {
    number: 3,
    id: 'ch-3',
    part: 'Part II: Core System Internals',
    title: 'Devices',
    subtitle: 'Device Files (/dev), sysfs, udev, and the Linux SCSI Subsystem',
    sectionRange: '3.1 – 3.6',
    status: 'VALIDATED',
    estimatedMinutes: 35,
    prerequisites: [1, 2],
    overview:
      'In Unix and Linux, "everything is a file"—including hardware devices. Chapter 3 explains how block, character, pipe, and socket device nodes work in /dev, how the kernel identifies drivers via major/minor numbers, how udev dynamically populates /dev from kernel uevents and sysfs, and why SATA and USB drives appear through the SCSI subsystem.',
    learningObjectives: [
      'Differentiate block, character, named pipe, and socket device files in /dev.',
      'Interpret major and minor device numbers in ls -l /dev output and explain how the kernel uses them.',
      'Trace the interaction between kernel device detection, sysfs (/sys), udevd, and /dev node creation.',
      'Explain why SATA drives and USB flash drives use the Linux SCSI subsystem (sd, sr, sg drivers) and read lsscsi output.',
    ],
    visualizerId: 'scsi_storage',
    visualizerTitle: 'Interactive Linux SCSI & Optical Driver Stack Tracer',
    sections: [
      {
        id: 'ch3-3.1',
        number: '3.1–3.3',
        title: 'Device Files, /sys Device Paths, and the dd Utility',
        subsections: [
          '3.1 Device Files (Block, Character, Pipe, Socket)',
          '3.2 The sysfs Device Path',
          '3.3 The dd Command and Devices',
        ],
        bookGroundedSummary:
          'Device files under /dev are special filesystem entries that route standard I/O system calls to kernel device drivers based on a pair of integers: the major and minor numbers.',
        detailedExplanation: [
          'Four special file types appear in /dev: Block devices (b) transfer fixed-size blocks and support random access (e.g., /dev/sda, /dev/nvme0n1); Character devices (c) handle sequential streams of bytes (e.g., terminals /dev/tty*, /dev/null, /dev/urandom); Named pipes (p) and sockets (s) facilitate inter-process communication.',
          'When you run ls -l /dev/sda, instead of a byte size you see two numbers such as 8, 0. The major number (8) tells the kernel WHICH driver handles the device (sd SCSI disk driver); the minor number (0) identifies the specific instance or partition (0 = sda, 1 = sda1).',
          'The sysfs virtual filesystem mounted at /sys mirrors the kernel’s live internal device tree—buses, drivers, block devices, and attributes—making it straightforward to inspect hardware topology.',
          'The dd command copies raw blocks directly between files or device nodes (e.g., dd if=/dev/zero of=test.img bs=1M count=10). Because it writes raw bytes without filesystem safeguards, typos in of=/dev/... can instantly overwrite disks.',
        ],
        codeExamples: [
          {
            title: 'Inspecting major/minor numbers and safe dd usage',
            command: 'ls -l /dev/sda /dev/sda1 /dev/null && dd if=/dev/zero of=/tmp/blank.img bs=1M count=2',
            output: `brw-rw---- 1 root disk 8, 0 Oct 12 08:00 /dev/sda
brw-rw---- 1 root disk 8, 1 Oct 12 08:00 /dev/sda1
crw-rw-rw- 1 root root 1, 3 Oct 12 08:00 /dev/null
2+0 records in
2+0 records out
2097152 bytes (2.1 MB) copied`,
            explanation:
              'Major 8 identifies the SCSI disk driver; minor 0 is the whole disk (/dev/sda) and minor 1 is partition 1 (/dev/sda1). /dev/null is character device 1,3.',
          },
        ],
      },
      {
        id: 'ch3-3.4',
        number: '3.4–3.5',
        title: 'Device Names, the SCSI Subsystem, SATA/USB Bridges & Optical Drives',
        subsections: [
          '3.4 Device Name Summary (Hard Disks, Optical, Terminals, Audio)',
          '3.5 udev and Device Management',
          '3.6 In Detail: SCSI and the Linux Kernel (Figures 3-1 to 3-3)',
        ],
        bookGroundedSummary:
          'Modern Linux routes not only true SCSI hardware, but also SATA (via libata) and USB storage devices through a unified three-layer SCSI subsystem, while udevd dynamically creates /dev nodes and persistent symlinks.',
        detailedExplanation: [
          'Traditional SCSI buses connect a host adapter (often ID 7) to multiple target devices (disks, optical drives) addressed by a 4-tuple: host:channel:target:lun (Figure 3-1), inspectable via lsscsi.',
          'Inside the kernel (Figure 3-2), the SCSI subsystem sits in three tiers: Upper-layer drivers expose user interfaces (sd for disks -> /dev/sd*, sr for CD/DVD -> /dev/sr*, sg for generic pass-through -> /dev/sg*); the Middle layer handles the SCSI protocol; Lower-layer drivers talk to hardware—including libata translating SATA commands and usb-storage translating USB mass storage!',
          'Why does an optical burner need BOTH sr and sg (Figure 3-3)? Reading a data CD uses the standard block interface via sr (/dev/sr0), whereas burning a disc requires specialized vendor/SCSI commands sent directly through the generic character device sg (/dev/sg0).',
          'Because hardware can be hot-plugged in any order, /dev is mounted on devtmpfs and managed by udevd. When the kernel detects a device, it emits a netlink uevent; udevd inspects sysfs attributes, applies rules in /lib/udev/rules.d and /etc/udev/rules.d, sets permissions, and creates stable symlinks under /dev/disk/by-uuid/ and /dev/disk/by-id/.',
        ],
        figureIds: ['fig-3-1', 'fig-3-2', 'fig-3-3'],
        codeExamples: [
          {
            title: 'Listing SCSI/SATA/USB storage topology and udev properties',
            command: 'lsscsi && udevadm info --query=all --name=/dev/sda | head -n 6',
            output: `[0:0:0:0]    disk    ATA      Samsung SSD 860  3B6Q  /dev/sda
[1:0:0:0]    cd/dvd  HL-DT-ST DVDRAM GH24NSC0  LK00  /dev/sr0
P: /devices/pci0000:00/0000:00:1f.2/ata1/host0/target0:0:0/0:0:0:0/block/sda
N: sda
S: disk/by-id/ata-Samsung_SSD_860_EVO_500GB
E: DEVTYPE=disk`,
            explanation:
              'Notice the SATA SSD shows up with SCSI address [0:0:0:0] and /dev/sda thanks to libata translation, and udev provides persistent /dev/disk/by-id symlinks.',
          },
        ],
        supplementalNote:
          'Modern NVMe SSDs connect directly over PCIe and bypass the SCSI subsystem, appearing as /dev/nvme0n1 (partition 1: /dev/nvme0n1p1) rather than /dev/sda.',
      },
    ],
    glossary: [
      { term: 'Major & Minor Numbers', definition: 'Integers attached to a device node: major selects the kernel driver, minor selects the specific device unit or partition.', sectionRef: '3.1' },
      { term: 'udevd', definition: 'User-space daemon that receives kernel hardware uevents, applies udev rules, sets permissions, and maintains stable symlinks in /dev.', sectionRef: '3.5' },
      { term: 'libata', definition: 'Kernel translation layer allowing SATA/ATA disks to use the unified Linux SCSI subsystem (sd driver).', sectionRef: '3.6' },
      { term: 'sg (SCSI Generic)', definition: 'Character-device driver allowing user-space programs (like disc burners or SMART tools) to send raw SCSI commands directly to hardware.', sectionRef: '3.6' },
    ],
    terminalLab: {
      intro: 'Inspect block/character devices, major/minor numbers, SCSI topology, and udev metadata.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch3-t1',
          title: 'Inspect major and minor numbers in /dev',
          instruction: 'List /dev/sda and /dev/null with ls -l to compare block (b) vs. character (c) devices.',
          hint: 'Run ls -l /dev/sda /dev/null',
          expectedPattern: '^ls\\s+-l.*\\/dev\\/',
          commandExplanation: 'ls -l prints b or c in column 1 and the major, minor pair where file size normally appears.',
          sampleCommand: 'ls -l /dev/sda /dev/null',
        },
        {
          id: 'ch3-t2',
          title: 'Query SCSI/SATA/USB storage devices',
          instruction: 'Run lsscsi to inspect SCSI host:channel:target:lun mappings.',
          hint: 'Type lsscsi and press Enter.',
          expectedPattern: '^lsscsi',
          commandExplanation: 'lsscsi reads /sys/bus/scsi to display attached storage devices and their /dev paths.',
          sampleCommand: 'lsscsi',
        },
      ],
    },
    assessments: [
      {
        id: 'ch3-q1',
        type: 'output_interpret',
        sectionRef: '3.1',
        prompt: 'Given `brw-rw---- 1 root disk 8, 16 Oct 12 08:00 /dev/sdb`, what do the leading "b" and numbers "8, 16" signify?',
        options: [
          'Buffered file of 8.16 KB',
          'Block device handled by driver major 8 (SCSI disk), device instance minor 16 (/dev/sdb)',
          'Binary executable using 8 blocks of 16 bytes',
          'Character device on SCSI bus 8, LUN 16',
        ],
        correctOptionIndex: 1,
        hint: 'b = block device; major = driver; minor = specific disk/partition.',
        explanation: 'Major 8 is the Linux SCSI disk driver (sd). Minor 0–15 belong to sda (disk + partitions); minor 16 starts sdb.',
      },
      {
        id: 'ch3-q2',
        type: 'mcq',
        sectionRef: '3.6',
        prompt: 'Why do SATA hard drives and USB flash drives both appear as /dev/sd* devices on Linux?',
        options: [
          'Because SATA and USB hardware physically use SCSI cables.',
          'Because the Linux kernel routes SATA (via libata) and USB mass storage (via usb-storage) through the unified SCSI subsystem and its sd disk driver.',
          'Because udev renames all hardware to /dev/sd* alphabetically.',
          'Because the BIOS converts all drives to SCSI before boot.',
        ],
        correctOptionIndex: 1,
        hint: 'Review Figure 3-2 (Linux SCSI subsystem schematic).',
        explanation: 'The SCSI subsystem acts as a modular storage framework: libata and usb-storage translate lower-level protocols so a single sd upper-layer driver serves them all.',
      },
      {
        id: 'ch3-q3',
        type: 'true_false',
        sectionRef: '3.5',
        prompt: 'True or False: Device names like /dev/sda and /dev/sdb are guaranteed never to change between reboots even if you add another drive.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'Why does udev create /dev/disk/by-uuid and /dev/disk/by-id?',
        explanation: 'False. Kernel probe order can shift /dev/sd* letters across boots or hardware changes. Persistent identifiers (UUIDs or /dev/disk/by-id) should be used for mounting.',
      },
      {
        id: 'ch3-q4',
        type: 'scenario',
        sectionRef: '3.6',
        prompt: 'You can read files from a DVD via /dev/sr0, yet a disc-burning utility opens /dev/sg0 instead. Why?',
        options: [
          '/dev/sr0 is read-only by permission bits, whereas /dev/sg0 is world-writable.',
          'Reading uses the block device interface (sr), while burning sends specialized low-level SCSI commands directly through the generic SCSI driver (sg).',
          '/dev/sr0 only works for USB drives.',
          'The kernel disables /dev/sr0 whenever write operations occur.',
        ],
        correctOptionIndex: 1,
        hint: 'Check Figure 3-3 (Optical device driver schematic).',
        explanation: 'The block device interface only exposes generic read/write block operations; burning optical media requires custom SCSI commands passed via sg.',
      },
    ],
    flashcards: [
      {
        id: 'fc-3-1',
        chapterNumber: 3,
        sectionRef: '3.1',
        front: 'What is the difference between a block device and a character device?',
        back: 'Block devices (b) transfer fixed-size blocks and allow random access (e.g., disks /dev/sda). Character devices (c) handle sequential byte streams without random seeking (e.g., /dev/tty, /dev/null).',
        tags: ['devices', 'dev'],
      },
      {
        id: 'fc-3-2',
        chapterNumber: 3,
        sectionRef: '3.5',
        front: 'What role does udevd play when a new USB drive is plugged in?',
        back: 'The kernel creates sysfs entries and sends a uevent over netlink; udevd reads rules and sysfs attributes to configure permissions and create persistent symlinks (e.g., /dev/disk/by-uuid/...).',
        tags: ['udev', 'sysfs'],
      },
    ],
    keyTakeaways: [
      'Hardware is accessed through /dev device nodes mapped to kernel drivers by major and minor numbers.',
      'sysfs (/sys) exposes the kernel’s live device hierarchy, and udevd reacts to kernel uevents to configure /dev dynamically.',
      'SATA (via libata) and USB mass storage plug into the Linux SCSI subsystem (sd, sr, sg).',
    ],
  },

  {
    number: 4,
    id: 'ch-4',
    part: 'Part II: Core System Internals',
    title: 'Disks and Filesystems',
    subtitle: 'Partitions, Filesystems, Mounting, Swap, LVM, and Inode Internals',
    sectionRange: '4.1 – 4.6 (Note: 4.4.1 omitted in source)',
    status: 'VALIDATED',
    estimatedMinutes: 60,
    prerequisites: [2, 3],
    overview:
      'Chapter 4 peels back every layer of Linux storage—from raw disk sectors and GPT/MBR partition tables to filesystems (ext4, XFS, Btrfs), mounting and /etc/fstab, swap space, Logical Volume Management (LVM), and the classic Unix inode architecture that makes filenames, directories, and hard links work.',
    learningObjectives: [
      'Trace the full storage stack from raw disk hardware through partition mapping, filesystem drivers, and system calls.',
      'Compare MBR and GPT partition tables and manage filesystems with mkfs, mount, umount, blkid, df, and /etc/fstab.',
      'Explain how Logical Volume Manager (LVM) abstracts Physical Volumes (PV), Volume Groups (VG), and Logical Volumes (LV) for online resizing.',
      'Explain how superblocks, directories, inodes, link counts, and data blocks work—and why rm is actually unlink().',
    ],
    visualizerId: 'lvm_inodes',
    visualizerTitle: 'Interactive LVM Extent Allocator & Inode / Hard-Link Visualizer',
    sections: [
      {
        id: 'ch4-4.1',
        number: '4.1',
        title: 'Partitioning Disk Devices & Disk Geometry',
        subsections: ['4.1.1 Viewing Partitions', '4.1.2 Modifying Partitions (MBR vs. GPT)', '4.1.3 Solid-State Disks (SSDs)'],
        bookGroundedSummary:
          'Disks are divided into logical regions called partitions (Figure 4-1), which the kernel exposes as separate block device nodes (/dev/sda1, /dev/sda2) via its partition-mapping layer (Figure 4-2).',
        detailedExplanation: [
          'A typical Linux disk begins with a partition table defining start/end offsets for each partition, and each partition usually holds its own filesystem data structures plus file data (Figure 4-1).',
          'Inside the kernel (Figure 4-2), user programs normally access files through system calls -> filesystem driver -> block device & partition mapping -> SCSI/storage drivers. Administrative tools like parted, fdisk, or mkfs bypass the filesystem layer to perform raw device access directly on /dev/sda or /dev/sda1.',
          'Two partitioning standards exist: legacy MBR (Master Boot Record, limited to 4 primary partitions and 2 TiB disks) and modern GPT (GUID Partition Table, supporting 128+ partitions, disks >2 TiB, and backup partition headers).',
          'Spinning hard disks store data on concentric tracks and sectors across magnetic platters (Figure 4-3), meaning sequential I/O is far faster than random seeks. SSDs eliminate mechanical seek latency using flash cells, though alignment and TRIM/discard remain important for longevity.',
        ],
        figureIds: ['fig-4-1', 'fig-4-2', 'fig-4-3'],
      },
      {
        id: 'ch4-4.2',
        number: '4.2–4.3',
        title: 'Filesystems, Mounting, /etc/fstab, UUIDs, Checking & Swap Space',
        subsections: [
          '4.2.1 Filesystem Types (ext4, XFS, Btrfs, vfat, ISO 9660)',
          '4.2.2 Creating a Filesystem (mkfs)',
          '4.2.3 Mounting a Filesystem & 4.2.4 Filesystem UUIDs (blkid)',
          '4.2.5 Disk Buffering, Caching, and Filesystems (sync)',
          '4.2.6 Filesystem Mount Options & 4.2.7 Remounting',
          '4.2.8 The /etc/fstab Filesystem Table (Listing 4-1)',
          '4.2.9 Alternatives to /etc/fstab & 4.2.10–4.2.12 df, du, fsck',
          '4.3 Swap Space (mkswap, swapon, free)',
        ],
        bookGroundedSummary:
          'A filesystem organizes raw blocks into files and directories. Linux attaches filesystems into the single directory tree via mount, buffers writes in RAM for speed, persists boot-time mounts in /etc/fstab using UUIDs, and uses swap space to extend virtual memory.',
        detailedExplanation: [
          'Linux supports native journaling filesystems—ext4 (default workhorse), XFS (high-throughput servers), and Btrfs (copy-on-write snapshots)—as well as interoperability formats like vfat/exFAT (USB drives) and ISO 9660 (optical images). Journaling records pending metadata changes in a log so recovery after power loss takes seconds.',
          'Before a filesystem can be used, it must be mounted onto an existing empty directory (mount point): `mount /dev/sdb1 /mnt/data`. Because /dev/sd* letters can shift across reboots, `/etc/fstab` identifies partitions by their stable UUID (found via `blkid`).',
          'Because disk I/O is orders of magnitude slower than RAM, the kernel caches reads and buffers dirty writes in memory. Always unmount (`umount`) or `sync` before disconnecting removable media so buffered writes flush cleanly.',
          'Swap space (a swap partition or swapfile activated with `mkswap` and `swapon`) gives the kernel overflow space on disk for inactive anonymous memory pages when RAM fills up.',
        ],
        codeExamples: [
          {
            title: 'Inspecting UUIDs, mounted filesystems, and /etc/fstab (Listing 4-1 style)',
            command: 'blkid && cat /etc/fstab && df -h',
            output: `/dev/sda1: UUID="a9011c2b-1234-4abc-9def-001122334455" TYPE="ext4"
# <file system>                           <mount>  <type>  <options>        <dump> <pass>
UUID=a9011c2b-1234-4abc-9def-001122334455  /        ext4    errors=remount-ro 0      1
UUID=c7720e11-5678-4def-8abc-667788990011  none     swap    sw                0      0`,
            explanation:
              'Each /etc/fstab line has 6 fields: device/UUID, mount point, filesystem type, mount options, dump flag, and fsck pass order (1 for root, 2 for others, 0 to skip).',
          },
        ],
      },
      {
        id: 'ch4-4.4',
        number: '4.4–4.5',
        title: 'Logical Volume Manager (LVM) & Virtual Filesystem Abstraction',
        subsections: [
          '4.4 Working with the Logical Volume Manager (LVM)',
          '4.4.2 Logical Volumes (Note: 4.4.1 omitted in source)',
          '4.4.3 Working with LVM (pvcreate, vgcreate, lvcreate, lvextend)',
          '4.4.4 Building an LVM System & Resizing (Figures 4-4 to 4-8)',
          '4.5 Looking Forward: Inside a Traditional Filesystem',
        ],
        bookGroundedSummary:
          'Traditional disk partitions are rigid contiguous ranges of sectors. LVM introduces a flexible abstraction layer—Physical Volumes (PV) pooled into Volume Groups (VG) and sliced into Logical Volumes (LV)—allowing non-contiguous allocation and live expansion.',
        detailedExplanation: [
          'LVM operates in three layers backed by the kernel Device Mapper (Figure 4-4): (1) Physical Volumes (PVs) are initialized disks or partitions (pvcreate); (2) Volume Groups (VGs) pool one or more PVs into a unified storage pool of fixed-size Physical Extents (vgcreate); (3) Logical Volumes (LVs) are virtual block devices carved out of a VG (lvcreate) that hold filesystems just like partitions.',
          'Consider Figures 4-5 through 4-8: Suppose two 10 GB logical volumes (`mylv1` and `mylv2`) live on a 20 GB volume group (Figure 4-7). If you remove `mylv2` and expand `mylv1`, LVM can even stitch together non-contiguous extents across multiple physical disks seamlessly (Figure 4-8)—something impossible with fixed MBR/GPT partitions!',
          'Remember that expanding an LV (`lvextend`) only enlarges the underlying virtual block device; you must also expand the filesystem inside it (e.g., `resize2fs` for ext4, or `lvextend -r` to resize both together).',
        ],
        figureIds: ['fig-4-4', 'fig-4-5', 'fig-4-6', 'fig-4-7', 'fig-4-8'],
        sourceNotes: [
          'Source Audit Note: Section numbering jumps from 4.4 directly to 4.4.2 in the original source HTML/book.',
        ],
      },
      {
        id: 'ch4-4.6',
        number: '4.6',
        title: 'Inside a Traditional Filesystem: Superblocks, Inodes & Hard Links',
        subsections: [
          '4.6.1 Viewing Inode Details (ls -i, stat)',
          '4.6.2 Working with Filesystems in User Space (FUSE)',
        ],
        bookGroundedSummary:
          'In a traditional Unix/Linux filesystem, filenames are NOT stored inside files! Instead, directories map names to numeric inode numbers, and each inode stores metadata and pointers to data blocks (Figures 4-9 and 4-10).',
        detailedExplanation: [
          'Compare Figure 4-9 (the directory tree users see) with Figure 4-10 (the underlying inode table). A file’s metadata—type, permissions, owner UID/GID, size, timestamps, link count, and pointers to disk data blocks—lives in its inode.',
          'A directory is simply a special table mapping human-readable filenames to inode numbers (including `.` for itself and `..` for its parent).',
          'Because names live in directories and point to inodes, multiple filenames in the same filesystem can point to the EXACT SAME inode. These are hard links (`ln file1 file2`). Each hard link increments the inode’s link count.',
          'When you run `rm file1`, the kernel executes the `unlink()` system call: it removes the directory entry and decrements the inode’s link count. The kernel only frees the inode and data blocks when BOTH the link count reaches 0 AND no running process holds an open file descriptor to that inode!',
        ],
        figureIds: ['fig-4-9', 'fig-4-10'],
        codeExamples: [
          {
            title: 'Verifying shared inodes across hard links',
            command: 'touch alpha.txt && ln alpha.txt beta.txt && ls -li alpha.txt beta.txt',
            output: `524291 -rw-r--r-- 2 juser juser 0 Oct 12 09:15 alpha.txt
524291 -rw-r--r-- 2 juser juser 0 Oct 12 09:15 beta.txt`,
            explanation:
              'Both filenames share inode 524291 and display link count 2. Removing alpha.txt leaves beta.txt and its data completely intact with link count 1.',
          },
        ],
      },
    ],
    glossary: [
      { term: 'Inode', definition: 'Filesystem metadata structure storing file permissions, ownership, timestamps, link count, and data block pointers—but NOT the filename.', sectionRef: '4.6' },
      { term: 'Superblock', definition: 'Master metadata block of a filesystem recording its type, size, block count, and inode table layout.', sectionRef: '4.6' },
      { term: 'LVM (PV / VG / LV)', definition: 'Logical Volume Manager: pools Physical Volumes into Volume Groups and allocates flexible Logical Volumes using Device Mapper extents.', sectionRef: '4.4' },
      { term: 'Journaling', definition: 'Logging filesystem metadata transactions before committing them so crash recovery is fast and consistent.', sectionRef: '4.2.1' },
    ],
    terminalLab: {
      intro: 'Inspect disk usage, /etc/fstab, LVM volumes, and inode link counts in the simulated Linux environment.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch4-t1',
          title: 'Check mounted filesystems and disk space',
          instruction: 'Run df -h to inspect mounted filesystems and available space.',
          hint: 'Type df -h',
          expectedPattern: '^df\\b',
          commandExplanation: 'df reports block usage and mount points for all currently mounted filesystems.',
          sampleCommand: 'df -h',
        },
        {
          id: 'ch4-t2',
          title: 'Inspect LVM Volume Groups and Logical Volumes',
          instruction: 'Run vgs or lvs to view the simulated LVM pool and logical volumes.',
          hint: 'Type lvs and press Enter.',
          expectedPattern: '^(pvs|vgs|lvs)\\b',
          commandExplanation: 'pvs, vgs, and lvs display Physical Volumes, Volume Groups, and Logical Volumes.',
          sampleCommand: 'lvs',
        },
        {
          id: 'ch4-t3',
          title: 'Create a hard link and inspect shared inode numbers',
          instruction: 'Create a hard link from notes.txt to notes_hard.txt and inspect their inode numbers with ls -li.',
          hint: 'Run ln notes.txt notes_hard.txt && ls -li notes.txt notes_hard.txt',
          expectedPattern: 'ls\\s+-(?=.*i)',
          commandExplanation: 'ls -i displays the inode number; hard links share the identical inode and increment the link count.',
          sampleCommand: 'ln notes.txt notes_hard.txt && ls -li notes.txt notes_hard.txt',
        },
      ],
    },
    assessments: [
      {
        id: 'ch4-q1',
        type: 'mcq',
        sectionRef: '4.6',
        prompt: 'A 10 GB log file is deleted with `rm /var/log/huge.log`, yet `df -h` shows the disk is STILL 100% full. Why?',
        options: [
          'ext4 only reclaims deleted blocks after a reboot.',
          'A running daemon still holds an open file descriptor to that inode, so the kernel cannot free its data blocks until the process closes it or restarts.',
          'rm only deletes symbolic links, not regular files.',
          'The file was located in swap space.',
        ],
        correctOptionIndex: 1,
        hint: 'What two conditions must both be zero before the kernel reclaims an inode’s data blocks?',
        explanation: 'Unlinking removes the filename and drops the link count to 0, but data blocks stay allocated as long as any running process keeps the inode open.',
      },
      {
        id: 'ch4-q2',
        type: 'fill_blank',
        sectionRef: '4.4',
        prompt: 'In LVM, one or more Physical Volumes (PVs) are combined into a storage pool called a ________, from which Logical Volumes (LVs) are carved.',
        acceptedAnswers: ['volume group', 'vg', 'volume groups'],
        hint: 'Abbreviated VG (Figure 4-4).',
        explanation: 'A Volume Group (VG) aggregates Physical Volumes into a unified pool of extents for allocating Logical Volumes.',
      },
      {
        id: 'ch4-q3',
        type: 'true_false',
        sectionRef: '4.6',
        prompt: 'True or False: You can create a hard link pointing from a file on /home (/dev/sda2) to a directory on /var (/dev/sdb1).',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'How are inode numbers scoped across separate filesystems?',
        explanation: 'False. Inode numbers are only unique within a single filesystem, so hard links cannot cross filesystem boundaries (use a symbolic link instead).',
      },
      {
        id: 'ch4-q4',
        type: 'scenario',
        sectionRef: '4.2.8',
        prompt: 'You added a second SATA drive to a server and rebooted; now your data partition fails to mount because /dev/sdb1 became /dev/sdc1. What is the best permanent fix in /etc/fstab?',
        options: [
          'Always mount manually after boot.',
          'Replace /dev/sdb1 in /etc/fstab with the filesystem’s persistent UUID=... obtained via blkid.',
          'Use chmod 777 on /dev/sdb1.',
          'Disable udevd.',
        ],
        correctOptionIndex: 1,
        hint: 'Check Section 4.2.4 (Filesystem UUIDs).',
        explanation: 'Filesystem UUIDs are stored inside the filesystem superblock itself and stay constant regardless of kernel device probe order.',
      },
    ],
    flashcards: [
      {
        id: 'fc-4-1',
        chapterNumber: 4,
        sectionRef: '4.6',
        front: 'Where is a file’s filename stored in a Linux filesystem?',
        back: 'Inside its parent directory’s name-to-inode table—NOT inside the file’s inode.',
        tags: ['inodes', 'filesystems'],
      },
      {
        id: 'fc-4-2',
        chapterNumber: 4,
        sectionRef: '4.4',
        front: 'List the three LVM layers in order from hardware to filesystem.',
        back: '1. Physical Volume (PV) — disk/partition\n2. Volume Group (VG) — pooled extents\n3. Logical Volume (LV) — resizable block device holding a filesystem',
        tags: ['lvm', 'storage'],
      },
      {
        id: 'fc-4-3',
        chapterNumber: 4,
        sectionRef: '4.2.8',
        front: 'What are the 6 fields of an /etc/fstab entry?',
        back: '1. Device/UUID  2. Mount point  3. Filesystem type  4. Mount options  5. Dump flag  6. fsck pass order',
        tags: ['fstab', 'mounting'],
      },
    ],
    keyTakeaways: [
      'Storage layers stack cleanly: Hardware -> Partition Table (GPT/MBR) -> Optional LVM (PV/VG/LV) -> Filesystem -> Mount Tree (/).',
      'Always reference persistent mounts in /etc/fstab by UUID rather than volatile /dev/sd* names.',
      'Directories map names to inode numbers; hard links share an inode, and blocks are reclaimed only when link count AND open file handles reach zero.',
    ],
  },
];
