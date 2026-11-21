import { ChapterModule } from './types';

export const CHAPTERS_5_TO_8: ChapterModule[] = [
  {
    number: 5,
    id: 'ch-5',
    part: 'Part II: Core System Internals',
    title: 'How the Linux Kernel Boots',
    subtitle: 'Firmware, GRUB 2, Kernel Parameters, initramfs, and Root Filesystem Handoff',
    sectionRange: '5.1 – 5.8 (5.5 restored from chapter body)',
    status: 'VALIDATED',
    estimatedMinutes: 35,
    prerequisites: [1, 4],
    overview:
      'What actually happens between pressing the power button and seeing a login prompt? Chapter 5 walks chronologically through the Linux boot sequence: BIOS/UEFI firmware initialization, the GRUB 2 bootloader, loading the compressed kernel and initramfs into RAM, passing kernel parameters, mounting the real root filesystem, and launching PID 1.',
    learningObjectives: [
      'Trace the four sequential stages of Linux startup from firmware to user space.',
      'Explain why an initial RAM filesystem (initramfs) is needed to mount root filesystems on LVM, RAID, or encrypted disks.',
      'Inspect and temporarily edit GRUB 2 boot entries and kernel command-line parameters (root=, ro, init=, quiet).',
      'Diagnose early hardware and kernel initialization events using dmesg and /proc/cmdline.',
    ],
    visualizerId: 'boot_grub',
    visualizerTitle: 'Interactive 4-Stage Boot Pipeline & GRUB Parameter Sandbox',
    sections: [
      {
        id: 'ch5-5.1',
        number: '5.1–5.4',
        title: 'Startup Messages, Boot Stages, Kernel Initialization & Kernel Parameters',
        subsections: [
          '5.1 Startup Messages (dmesg)',
          '5.2 Kernel Initialization and Boot Options',
          '5.3 Kernel Parameters (/proc/cmdline, root=, ro)',
          '5.4 Bootloaders: What They Do (BIOS vs. UEFI)',
        ],
        bookGroundedSummary:
          'Linux boots in four crisp stages: (1) BIOS/UEFI firmware, (2) Bootloader (GRUB), (3) Kernel + initramfs initialization, and (4) init/systemd starting user space.',
        detailedExplanation: [
          'Stage 1 (Firmware): Power-on firmware initializes hardware and locates a bootloader—either legacy BIOS reading the MBR boot sector or modern UEFI loading an EFI binary (e.g., grubx64.efi) from the FAT32 EFI System Partition (ESP).',
          'Stage 2 (Bootloader): GRUB presents a boot menu (Figure 5-1), loads the Linux kernel image (e.g., /boot/vmlinuz-...) and initial RAM disk (initrd/initramfs) into memory, and hands over a kernel command line.',
          'Stage 3 (Kernel + initramfs): The kernel decompresses itself, probes core devices, unpacks the initramfs temporary root filesystem into RAM, loads storage/LVM/crypto drivers from it (bridging Chapter 4’s UUID/LVM storage layer), mounts the real root filesystem read-only (`ro`) first so fsck can verify it, and executes `switch_root` to discard initramfs and launch PID 1 (Chapter 6).',
          'Key kernel parameters visible in `/proc/cmdline` include `root=UUID=...` (locates the real root partition unambiguously even if disk letter ordering shifts), `ro` (mount read-only initially), `quiet`/`splash` (suppresses verbose boot logs), and `systemd.unit=rescue.target` or `init=/bin/sh` (emergency recovery overrides when normal startup fails).',
        ],
        codeExamples: [
          {
            title: 'Inspecting active kernel boot parameters and early kernel ring buffer',
            command: 'cat /proc/cmdline && dmesg | head -n 5',
            output: `BOOT_IMAGE=/boot/vmlinuz-5.15.0-91-generic root=UUID=a9011c2b-1234-4abc-9def-001122334455 ro quiet
[    0.000000] Linux version 5.15.0-91-generic (gcc 11.4.0)
[    0.142110] ACPI: Core revision 20210730
[    0.489201] scsi host0: ahci
[    0.512044] EXT4-fs (sda1): mounted filesystem with ordered data mode`,
            explanation:
              '/proc/cmdline shows the exact parameters GRUB passed to the kernel; dmesg displays the kernel ring buffer messages captured during boot.',
          },
        ],
      },
      {
        id: 'ch5-5.5',
        number: '5.5–5.8',
        title: 'GRUB Introduction, Interactive Editing, Configuration & Chainloading',
        subsections: [
          '5.5 GRUB Introduction (restored from body)',
          '5.6 Inspecting and Editing GRUB at Boot (Figures 5-1 & 5-2)',
          '5.7 GRUB Configuration (/boot/grub/grub.cfg, /etc/default/grub, update-grub)',
          '5.8 Installing GRUB & UEFI vs. MBR Details',
        ],
        bookGroundedSummary:
          'GRUB 2 is the standard Linux bootloader. Its menu (Figure 5-1) lets you select kernels or press "e" to edit boot commands interactively (Figure 5-2) for single-boot recovery without permanently altering /boot/grub/grub.cfg.',
        detailedExplanation: [
          'Pressing `e` in the GRUB menu opens the interactive configuration editor (Figure 5-2), displaying lines such as `set root=(hd0,gpt2)`, `linux /boot/vmlinuz-... root=UUID=... ro`, and `initrd /boot/initrd.img-...`. Edits made here apply ONLY to the current boot—ideal for removing `quiet` to diagnose a hang or booting into emergency mode.',
          'Never edit `/boot/grub/grub.cfg` directly! Instead, adjust `/etc/default/grub` or scripts under `/etc/grub.d/` and regenerate the config with `grub-mkconfig -o /boot/grub/grub.cfg` (or `update-grub` on Debian/Ubuntu).',
          'Why does GRUB exist in multiple pieces? On legacy MBR disks, the 446-byte MBR boot sector is far too tiny to understand ext4 or GPT, so GRUB splits into boot.img (MBR) -> core.img (filesystem driver) -> `/boot/grub/` modules. On UEFI, firmware natively reads the FAT32 ESP and executes GRUB’s full `.efi` binary directly.',
          'Boot troubleshooting workflow: if a broken `/etc/fstab` entry or bad driver blocks boot, press `e` in GRUB, remove `quiet`/`splash` to see the exact kernel panic or mount failure, or append `systemd.unit=emergency.target` to drop into a root recovery shell without modifying disk configuration.',
        ],
        figureIds: ['fig-5-1', 'fig-5-2'],
        supplementalNote:
          'On modern UEFI systems with Secure Boot enabled, the firmware typically launches a signed `shimx64.efi` binary first, which verifies the signature of `grubx64.efi` and the Linux kernel before executing them.',
        sourceNotes: [
          'Source Audit Note: Heading 5.5 ("GRUB Introduction") is present in the chapter body HTML but was dropped from the Calibre EPUB Table of Contents; restored here.',
        ],
      },
    ],
    glossary: [
      { term: 'initramfs / initrd', definition: 'A small compressed cpio archive loaded into RAM by the bootloader containing early modules and tools needed to assemble LVM/RAID/encryption and mount the real root filesystem.', sectionRef: '5.2' },
      { term: 'EFI System Partition (ESP)', definition: 'A FAT32 partition read directly by UEFI firmware to load OS bootloaders like grubx64.efi.', sectionRef: '5.4' },
      { term: 'dmesg', definition: 'Utility that prints the kernel ring buffer, capturing hardware detection, driver messages, and early boot diagnostics.', sectionRef: '5.1' },
    ],
    terminalLab: {
      intro: 'Inspect kernel boot parameters, kernel ring buffer messages, and GRUB configuration files.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch5-t1',
          title: 'Inspect the active kernel command line',
          instruction: 'Read /proc/cmdline to see which kernel image and root UUID were passed by GRUB.',
          hint: 'Run cat /proc/cmdline',
          expectedPattern: 'cat\\s+/proc/cmdline',
          commandExplanation: 'The kernel exposes its boot-time parameter string at /proc/cmdline.',
          sampleCommand: 'cat /proc/cmdline',
        },
        {
          id: 'ch5-t2',
          title: 'Examine early boot messages',
          instruction: 'Run dmesg to inspect simulated kernel hardware initialization logs.',
          hint: 'Type dmesg and press Enter.',
          expectedPattern: '^dmesg',
          commandExplanation: 'dmesg dumps kernel ring buffer logs from hardware probing and root mount.',
          sampleCommand: 'dmesg',
        },
      ],
    },
    assessments: [
      {
        id: 'ch5-q1',
        type: 'mcq',
        sectionRef: '5.2',
        prompt: 'Why do most Linux distributions require an initramfs image during boot instead of mounting the root filesystem directly from the kernel?',
        options: [
          'Because the Linux kernel cannot read ext4 filesystems.',
          'Because modular storage drivers, LVM, RAID, or disk-encryption unlock tools live in user space or modules that are needed BEFORE the real root filesystem can be mounted.',
          'Because GRUB cannot load a kernel without an initramfs.',
          'Because initramfs replaces systemd after boot completes.',
        ],
        correctOptionIndex: 1,
        hint: 'Think of the chicken-and-egg problem when root sits on LVM or LUKS encryption.',
        explanation: 'A generic distribution kernel keeps many drivers as modules and needs user-space helpers (lvm, cryptsetup) inside initramfs to make the real root device accessible.',
      },
      {
        id: 'ch5-q2',
        type: 'true_false',
        sectionRef: '5.6',
        prompt: 'True or False: Pressing "e" in the GRUB menu and modifying the linux kernel line permanently overwrites /boot/grub/grub.cfg.',
        options: ['True', 'False'],
        correctOptionIndex: 1,
        hint: 'How does GRUB handle interactive boot-time edits?',
        explanation: 'False. Interactive edits in the GRUB editor apply strictly to that single boot session, making them safe for troubleshooting.',
      },
      {
        id: 'ch5-q3',
        type: 'fill_blank',
        sectionRef: '5.3',
        prompt: 'Which virtual file in /proc displays the exact command-line parameters passed to the running kernel at boot?',
        acceptedAnswers: ['/proc/cmdline'],
        hint: 'Starts with /proc/cmd...',
        explanation: '/proc/cmdline outputs the active kernel parameter line verbatim.',
      },
      {
        id: 'ch5-q4',
        type: 'scenario',
        sectionRef: '5.3',
        prompt: 'Why is the root filesystem initially mounted with the `ro` (read-only) kernel parameter during boot?',
        options: [
          'So users cannot log in.',
          'So filesystem consistency checks (fsck) can safely inspect and repair the root filesystem before anything writes to it, after which user space remounts it read-write.',
          'Because GRUB only supports read-only filesystems.',
          'Because ext4 cannot be mounted read-write by the kernel.',
        ],
        correctOptionIndex: 1,
        hint: 'What happens if fsck modifies a filesystem that is already being written to?',
        explanation: 'Running fsck on a read-write mounted filesystem risks severe corruption; mounting ro first ensures safe verification before remounting rw.',
      },
    ],
    flashcards: [
      {
        id: 'fc-5-1',
        chapterNumber: 5,
        sectionRef: '5.2',
        front: 'What are the four main stages of the Linux boot process?',
        back: '1. BIOS/UEFI firmware\n2. Bootloader (GRUB 2)\n3. Kernel + initramfs initialization\n4. init / systemd starting user space (PID 1)',
        tags: ['boot', 'kernel'],
      },
      {
        id: 'fc-5-2',
        chapterNumber: 5,
        sectionRef: '5.7',
        front: 'Which file should you edit to permanently customize GRUB defaults, and why not grub.cfg?',
        back: 'Edit /etc/default/grub (and /etc/grub.d/) then run grub-mkconfig / update-grub, because /boot/grub/grub.cfg is auto-generated and overwritten on kernel updates.',
        tags: ['grub', 'boot'],
      },
    ],
    keyTakeaways: [
      'Boot proceeds linearly: Firmware -> GRUB -> Kernel + initramfs -> PID 1.',
      'initramfs solves the chicken-and-egg problem of mounting complex root storage (LVM, RAID, encryption).',
      'GRUB interactive edits ("e") are temporary and invaluable for recovery; persistent changes belong in /etc/default/grub.',
    ],
  },

  {
    number: 6,
    id: 'ch-6',
    part: 'Part II: Core System Internals',
    title: 'How User Space Starts',
    subtitle: 'PID 1, systemd Units, Dependencies, Socket Activation, and Legacy Init Systems',
    sectionRange: '6.1 – 6.9 (6.1 restored from chapter body)',
    status: 'VALIDATED',
    estimatedMinutes: 45,
    prerequisites: [5],
    overview:
      'Once the kernel mounts the root filesystem, it launches a single user-space process—PID 1 (init). Chapter 6 explains how modern Linux systems use systemd to orchestrate services, targets, mounts, and sockets in parallel using dependency graphs rather than slow sequential shell scripts.',
    learningObjectives: [
      'Explain PID 1’s responsibility as the ancestor of all user-space processes.',
      'Distinguish systemd unit types (.service, .target, .socket, .mount, .timer) and configuration precedence (/usr/lib vs. /etc).',
      'Trace dependency relationships (Wants, Requires, After, Before) and explain how socket activation enables parallel startup.',
      'Manage services, inspect unit status, and change targets with systemctl.',
    ],
    visualizerId: 'systemd_timeline',
    visualizerTitle: 'Sequential vs. systemd Socket-Activated Parallel Boot Simulator',
    sections: [
      {
        id: 'ch6-6.1',
        number: '6.1–6.4',
        title: 'Introduction to init, systemd Units, Dependencies & Targets',
        subsections: [
          '6.1 Introduction to init (restored from body)',
          '6.2 Identifying Your init',
          '6.3 systemd (Units, Targets, Configuration Directories)',
          '6.4 systemd Unit Dependency Graph (Figure 6-1)',
        ],
        bookGroundedSummary:
          'systemd replaces fragile SysV shell scripts with declarative unit files organized into a dependency graph (Figure 6-1) rooted at default.target (typically graphical.target or multi-user.target).',
        detailedExplanation: [
          'Every resource systemd manages is a Unit: `.service` (daemons/processes), `.target` (grouping milestones like `multi-user.target` or `graphical.target`), `.socket` (network or IPC listening sockets), `.mount` (filesystem mounts), and `.timer` (scheduled activations).',
          'Configuration precedence follows a clean separation: vendor defaults live in `/lib/systemd/system` (or `/usr/lib/systemd/system`), while local administrator overrides and enablement symlinks live in `/etc/systemd/system` (which always take priority over `/lib`).',
          'Notice an essential subtlety in systemd dependencies (Figure 6-1): `Wants=` and `Requires=` express ACTIVATION dependencies ("start B when starting A"), whereas `After=` and `Before=` express ORDERING dependencies ("wait for B to finish starting before launching A"). Without `After=`, systemd starts Wanted units simultaneously!',
        ],
        figureIds: ['fig-6-1'],
        sourceNotes: [
          'Source Audit Note: Heading 6.1 ("Introduction to init") exists in the body HTML but was omitted from the Calibre TOC; restored here. Figure 6-1’s original artwork spells "mutli-user.target" instead of "multi-user.target".',
        ],
      },
      {
        id: 'ch6-6.5',
        number: '6.5–6.9',
        title: 'Parallel Startup, Socket Activation, systemctl, Shutdown & Legacy Init',
        subsections: [
          '6.5 How systemd Starts Services in Parallel (Figures 6-2 & 6-3)',
          '6.6 Controlling systemd with systemctl',
          '6.7 Writing Your Own Unit Files & 6.8 Shutting Down Your System',
          '6.9 Legacy Init Systems (System V init, Runlevels, Upstart)',
        ],
        bookGroundedSummary:
          'Traditional sequential boot stalls whenever Service B must wait for Service A to finish initializing (Figure 6-2). systemd breaks this bottleneck via socket/resource units (Figure 6-3) so dependent services launch in parallel.',
        detailedExplanation: [
          'Compare Figure 6-2 (sequential boot) with Figure 6-3 (systemd boot with a resource unit): Suppose Service B talks to Service A over a Unix or TCP socket (such as syslog or D-Bus). In a sequential boot, B cannot even start until A is completely ready.',
          'With systemd socket activation, PID 1 itself creates the listening socket unit FIRST (taking milliseconds) and immediately starts BOTH A and B in parallel! Any early connection B sends to the socket is safely buffered by the kernel until A finishes initializing and accepts the socket from systemd.',
          'Common `systemctl` operations: `systemctl status <unit>` (inspect state + recent logs), `systemctl cat <unit>` (print the active unit file and any overrides), `systemctl start/stop/restart/reload <unit>`, `systemctl enable/disable <unit>` (create/remove boot symlinks under `.wants/`), and `systemctl list-units --type=service`.',
          'Anatomy of a custom `.service` unit (Section 6.7): `[Unit]` declares `Description=`, `After=`, and `Wants=`/`Requires=`; `[Service]` sets `Type=` (`simple` for foreground processes, `forking` for classic daemonizing programs, `oneshot` for short setup scripts), `ExecStart=`, and `Restart=on-failure`; `[Install]` declares `WantedBy=multi-user.target` so `systemctl enable` knows which target should pull the service in at boot.',
          'Historically, Linux used System V init (`/etc/init.d` shell scripts linked into `/etc/rcN.d` runlevels 0–6) and briefly Upstart. Understanding runlevel equivalents (runlevel 3 ≈ `multi-user.target`, runlevel 5 ≈ `graphical.target`) helps when reading legacy documentation.',
        ],
        figureIds: ['fig-6-2', 'fig-6-3'],
        codeExamples: [
          {
            title: 'Inspecting systemd services and dependencies',
            command: 'systemctl list-units --type=service && systemctl status ssh.service',
            output: `UNIT                 LOAD   ACTIVE SUB     DESCRIPTION
cron.service         loaded active running Regular background program processing daemon
ssh.service          loaded active running OpenBSD Secure Shell server
systemd-journald.service loaded active running Journal Service`,
            explanation:
              'systemctl communicates directly with PID 1 over D-Bus to report live unit states, PIDs, cgroup slices, and recent journal entries.',
          },
        ],
      },
    ],
    glossary: [
      { term: 'Unit', definition: 'A configuration object managed by systemd—such as .service, .target, .socket, .mount, or .timer.', sectionRef: '6.3' },
      { term: 'Socket Activation', definition: 'Technique where systemd opens listening sockets upfront so dependent services can start in parallel while the kernel buffers early requests.', sectionRef: '6.5' },
      { term: 'Wants vs. After', definition: 'Wants= triggers another unit to start; After= enforces startup ordering. Activation and ordering are independent in systemd.', sectionRef: '6.4' },
    ],
    terminalLab: {
      intro: 'Control and inspect simulated systemd services, targets, and dependencies using systemctl.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch6-t1',
          title: 'List active systemd services',
          instruction: 'Use systemctl list-units --type=service to inspect running services.',
          hint: 'Run systemctl list-units --type=service',
          expectedPattern: '^systemctl\\s+list-units',
          commandExplanation: 'list-units queries PID 1 for currently loaded units and their ACTIVE/SUB states.',
          sampleCommand: 'systemctl list-units --type=service',
        },
        {
          id: 'ch6-t2',
          title: 'Inspect a specific service unit',
          instruction: 'Check the detailed status of ssh.service using systemctl status ssh.service.',
          hint: 'Run systemctl status ssh.service',
          expectedPattern: '^systemctl\\s+status\\s+ssh',
          commandExplanation: 'systemctl status shows unit load path, active state, main PID, and recent journal lines.',
          sampleCommand: 'systemctl status ssh.service',
        },
        {
          id: 'ch6-t3',
          title: 'Read a systemd unit file definition',
          instruction: 'Inspect the [Unit], [Service], and [Install] sections of ssh.service with systemctl cat ssh.service.',
          hint: 'Run systemctl cat ssh.service',
          expectedPattern: '^systemctl\\s+cat\\s+',
          commandExplanation: 'systemctl cat prints the exact unit file and any /etc/systemd/system override snippets currently active.',
          sampleCommand: 'systemctl cat ssh.service',
        },
      ],
    },
    assessments: [
      {
        id: 'ch6-q1',
        type: 'mcq',
        sectionRef: '6.5',
        prompt: 'How does systemd socket activation speed up system boot compared to traditional sequential startup (Figures 6-2 and 6-3)?',
        options: [
          'It compiles services into the Linux kernel.',
          'systemd creates the listening socket upfront and launches both provider and consumer services in parallel; the kernel buffers early client messages until the provider is ready.',
          'It skips starting networking until a user logs in.',
          'It disables all dependency checks during boot.',
        ],
        correctOptionIndex: 1,
        hint: 'Look at the timeline in Figure 6-3.',
        explanation: 'Decoupling socket creation from daemon readiness lets consumer services start immediately without waiting on provider initialization.',
      },
      {
        id: 'ch6-q2',
        type: 'debug',
        sectionRef: '6.4',
        prompt: 'An admin creates myapp.service with `Requires=postgresql.service`, expecting myapp to wait until PostgreSQL finishes starting—yet systemd starts both simultaneously. What directive is missing?',
        options: ['Wants=postgresql.service', 'After=postgresql.service', 'WantedBy=postgresql.service', 'Type=forking'],
        correctOptionIndex: 1,
        hint: 'In systemd, activation dependencies and ordering dependencies are separate directives.',
        explanation: 'Requires= only guarantees that postgresql.service is activated alongside myapp; you must ALSO specify After=postgresql.service to enforce startup order.',
      },
      {
        id: 'ch6-q3',
        type: 'command_write',
        sectionRef: '6.6',
        prompt: 'Write the systemctl command to configure nginx.service to start automatically at boot (without needing to start it immediately).',
        acceptedAnswers: ['systemctl enable nginx.service', 'systemctl enable nginx', 'sudo systemctl enable nginx.service', 'sudo systemctl enable nginx'],
        hint: 'Use the enable subcommand.',
        explanation: '`systemctl enable` creates the symlink in the appropriate `.wants` directory under `/etc/systemd/system`.',
      },
      {
        id: 'ch6-q4',
        type: 'true_false',
        sectionRef: '6.3',
        prompt: 'True or False: Unit files placed in /etc/systemd/system take precedence over vendor unit files of the same name in /lib/systemd/system.',
        options: ['True', 'False'],
        correctOptionIndex: 0,
        hint: 'Where should local administrators place custom overrides so package upgrades don’t overwrite them?',
        explanation: 'True. /etc/systemd/system overrides /lib/systemd/system (and /usr/lib/systemd/system), preserving local changes across package updates.',
      },
    ],
    flashcards: [
      {
        id: 'fc-6-1',
        chapterNumber: 6,
        sectionRef: '6.4',
        front: 'What is the difference between Wants=, Requires=, and After= in a systemd unit file?',
        back: 'Wants= starts another unit (continues if it fails); Requires= starts it and fails if it fails; After= controls ordering only (must be paired with Wants/Requires to wait).',
        tags: ['systemd', 'dependencies'],
      },
      {
        id: 'fc-6-2',
        chapterNumber: 6,
        sectionRef: '6.3',
        front: 'What is the modern systemd target equivalent to traditional multi-user text mode (runlevel 3) vs. desktop mode (runlevel 5)?',
        back: 'multi-user.target (non-graphical server/CLI) vs. graphical.target (desktop environment).',
        tags: ['systemd', 'targets'],
      },
    ],
    keyTakeaways: [
      'systemd (PID 1) models services, targets, mounts, and sockets as units in a dependency graph.',
      'Activation (Wants/Requires) and ordering (After/Before) are independent directives.',
      'Socket activation lets systemd start dependent services in parallel while the kernel buffers early traffic.',
    ],
  },

  {
    number: 7,
    id: 'ch-7',
    part: 'Part II: Core System Internals',
    title: 'System Configuration: Logging, System Time, Batch Jobs, and Users',
    subtitle: '/etc Layout, journald/syslog, /etc/passwd & group, NTP, cron, systemd Timers, and PAM',
    sectionRange: '7.1 – 7.11',
    status: 'VALIDATED',
    estimatedMinutes: 55,
    prerequisites: [2, 6],
    overview:
      'Chapter 7 demystifies the core administrative subsystems that keep a Linux host healthy and secure: centralized system logging (systemd-journald and syslog), user/group account databases, system clock and NTP synchronization, recurring jobs (cron and systemd timers), and Pluggable Authentication Modules (PAM).',
    learningObjectives: [
      'Query structured binary logs with journalctl and distinguish journald from classic text syslog (/var/log).',
      'Decode every colon-separated field of /etc/passwd, /etc/shadow, and /etc/group.',
      'Author and interpret 5-field crontab schedules and compare cron with systemd timer units.',
      'Trace PAM rule execution (requisite, required, sufficient, optional) to predict authentication allow/deny verdicts.',
    ],
    visualizerId: 'config_cron_pam',
    visualizerTitle: 'Interactive /etc/passwd Inspector, Crontab Evaluator & PAM Rule Simulator',
    sections: [
      {
        id: 'ch7-7.1',
        number: '7.1–7.2',
        title: 'The /etc Directory Structure & System Logging (journald & syslog)',
        subsections: ['7.1 /etc Directory Structure', '7.2 System Logging (systemd-journald, journalctl, syslog)'],
        bookGroundedSummary:
          'System-wide configuration lives in /etc, while diagnostic logs are collected centrally by systemd-journald (queried via journalctl) and often forwarded to traditional text log daemons (rsyslog) writing under /var/log.',
        detailedExplanation: [
          'Modern Linux distributions use `systemd-journald` to capture kernel messages, early boot logs, and stdout/stderr from every systemd service into structured binary journals. Unlike plain text logs, journal entries carry indexed metadata (`_SYSTEMD_UNIT`, `_PID`, `PRIORITY`).',
          'Key `journalctl` filters: `journalctl -u ssh.service` (filter by unit), `journalctl -f` (follow live), `journalctl -p err` (errors and higher), `journalctl -b` (current boot only), and `journalctl --since "1 hour ago"`.',
          'Traditional syslog (typically `rsyslogd`) classifies messages by facility (e.g., `auth`, `daemon`, `kern`, `mail`) and priority (`debug`, `info`, `warning`, `err`, `crit`) and writes them into text files such as `/var/log/syslog` or `/var/log/auth.log`, managed with `logrotate` so logs never exhaust disk space.',
        ],
        codeExamples: [
          {
            title: 'Filtering structured logs with journalctl',
            command: 'journalctl -u ssh.service -n 5',
            output: `Oct 12 08:00:04 linuxlab systemd[1]: Started OpenBSD Secure Shell server.
Oct 12 08:04:11 linuxlab sshd[1415]: Accepted publickey for juser from 10.23.2.4 port 51204 ssh2
Oct 12 08:04:11 linuxlab sshd[1415]: pam_unix(sshd:session): session opened for user juser(uid=1000)`,
            explanation:
              'journalctl -u targets a single service unit and -n limits output to the most recent entries.',
          },
        ],
      },
      {
        id: 'ch7-7.3',
        number: '7.3–7.5',
        title: 'User & Group Management (/etc/passwd, /etc/shadow, /etc/group) & System Time',
        subsections: [
          '7.3 User Management Files (/etc/passwd, /etc/shadow, /etc/group, pseudo-users)',
          '7.4 Gettys and Login',
          '7.5 Setting the Time (RTC, System Clock, Timezones, NTP)',
        ],
        bookGroundedSummary:
          'User identities map between usernames and numeric UIDs/GIDs in /etc/passwd (Figure 7-1) and /etc/group (Figure 7-2), while password hashes sit isolated in root-only /etc/shadow.',
        detailedExplanation: [
          'Every line of `/etc/passwd` has 7 colon-separated fields (Figure 7-1): `username:x:UID:GID:GECOS(real name):home_directory:login_shell`. Because `/etc/passwd` must be world-readable so commands like `ls -l` can resolve UIDs to names, the second field holds `x` and actual salted password hashes live in `/etc/shadow` (readable only by root/shadow).',
          'Every line of `/etc/group` has 4 fields (Figure 7-2): `group_name:x:GID:comma_separated_supplementary_members`. Pseudo-users (like `www-data` or `nobody`) typically have `/usr/sbin/nologin` or `/bin/false` as their shell and locked password fields (`*` or `!`) so nobody can interactively log into them.',
          'Linux keeps two clocks: the hardware battery-backed RTC (real-time clock, best stored in UTC) and the kernel’s system clock (synchronized continuously via NTP—e.g., `systemd-timesyncd` or `chronyd`). Local display timezones are selected by symlinking `/etc/localtime` into `/usr/share/zoneinfo/`.',
        ],
        figureIds: ['fig-7-1', 'fig-7-2'],
      },
      {
        id: 'ch7-7.6',
        number: '7.6–7.11',
        title: 'Scheduling Tasks (cron, at, systemd Timers) & Pluggable Authentication Modules (PAM)',
        subsections: [
          '7.6 Scheduling Recurring Tasks with cron (Figure 7-3)',
          '7.7 Scheduling One-Time Tasks with at',
          '7.8 Scheduling Tasks with systemd Timer Units (Listings 7-1 & 7-2)',
          '7.9 Understanding User IDs and User Switching (su, sudo)',
          '7.10 User Identification and Authentication (NSS, PAM, Listings 7-3 & 7-4, Figure 7-4)',
          '7.11 Looking Forward',
        ],
        bookGroundedSummary:
          'Recurring batch tasks are scheduled with cron (Figure 7-3) or systemd timers, while login/sudo authentication flows through configurable PAM rule stacks under /etc/pam.d/ (Figure 7-4).',
        detailedExplanation: [
          'A user `crontab` line has 5 time fields followed by the command (Figure 7-3): `minute (0-59)  hour (0-23)  day-of-month (1-31)  month (1-12)  day-of-week (0-7)  command`. An asterisk (`*`) matches every value; `*/15` means every 15 units. Always edit user crontabs via `crontab -e` and inspect with `crontab -l`.',
          'systemd `.timer` units (paired with matching `.service` units) offer an alternative to cron with calendar expressions (`OnCalendar=`), randomized delays, persistent catch-up after downtime (`Persistent=true`), and automatic journald logging.',
          'Pluggable Authentication Modules (PAM) decouple applications (`login`, `sshd`, `sudo`) from authentication backends (local `/etc/shadow`, LDAP, 2FA). Rules in `/etc/pam.d/<service>` run top-to-bottom (Figure 7-4) using control flags:',
          '• `requisite`: Failure aborts the entire stack immediately (denied). Success continues.\n• `required`: Failure is recorded, yet PAM STILL runs remaining modules before denying at the end (prevents leaking which check failed).\n• `sufficient`: Success immediately grants access ONLY IF no prior `required` rule failed; failure is ignored.\n• `optional`: Result matters only if it is the sole module.',
        ],
        figureIds: ['fig-7-3', 'fig-7-4'],
        quickCheck: {
          prompt: 'In PAM (Figure 7-4), if a `required` rule fails and the very next `sufficient` rule succeeds, is authentication granted or denied?',
          answer:
            'Denied! A `sufficient` rule can only short-circuit to ALLOW if all preceding `required` rules succeeded.',
        },
      },
    ],
    glossary: [
      { term: '/etc/shadow', definition: 'Restricted file (readable only by root/shadow) storing salted password hashes and password expiration metadata.', sectionRef: '7.3' },
      { term: 'crontab', definition: 'Table of scheduled recurring jobs using 5 time fields (min, hour, dom, month, dow) executed by cron.', sectionRef: '7.6' },
      { term: 'PAM (Pluggable Authentication Modules)', definition: 'Modular framework under /etc/pam.d/ allowing Linux services to authenticate users via stacked control rules (requisite, required, sufficient, optional).', sectionRef: '7.10' },
    ],
    terminalLab: {
      intro: 'Inspect user/group databases, crontab schedules, and systemd journal logs in the simulated shell.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch7-t1',
          title: 'Inspect /etc/passwd and /etc/group',
          instruction: 'Display your entry in /etc/passwd using grep juser /etc/passwd.',
          hint: 'Run grep juser /etc/passwd',
          expectedPattern: 'grep.*juser.*/etc/passwd',
          commandExplanation: 'Shows all 7 fields: username, shadow placeholder x, UID, GID, GECOS, home dir, and shell.',
          sampleCommand: 'grep juser /etc/passwd',
        },
        {
          id: 'ch7-t2',
          title: 'View scheduled cron jobs',
          instruction: 'List the current user’s crontab entries with crontab -l.',
          hint: 'Type crontab -l',
          expectedPattern: '^crontab\\s+-l',
          commandExplanation: 'crontab -l reads the user’s active cron schedule from /var/spool/cron.',
          sampleCommand: 'crontab -l',
        },
        {
          id: 'ch7-t3',
          title: 'Query service logs with journalctl',
          instruction: 'Inspect recent SSH service logs using journalctl -u ssh.service.',
          hint: 'Run journalctl -u ssh.service',
          expectedPattern: '^journalctl',
          commandExplanation: 'journalctl queries indexed binary logs stored by systemd-journald.',
          sampleCommand: 'journalctl -u ssh.service',
        },
      ],
    },
    assessments: [
      {
        id: 'ch7-q1',
        type: 'output_interpret',
        sectionRef: '7.6',
        prompt: 'When does the following crontab entry run?',
        codeBlock: '30 2 * * 0 /usr/local/bin/backup.sh',
        options: [
          'Every 30 minutes on February 1st',
          'At 2:30 AM every Sunday',
          'At 3:02 AM every day of the week',
          'Every 2 hours on the 30th of each month',
        ],
        correctOptionIndex: 1,
        hint: 'Fields in Figure 7-3: minute(30), hour(2), dom(*), month(*), dow(0 = Sunday).',
        explanation: 'Minute 30, Hour 02 (2:30 AM), any day of month (*), any month (*), day of week 0 (Sunday).',
      },
      {
        id: 'ch7-q2',
        type: 'scenario',
        sectionRef: '7.10',
        prompt: 'A PAM stack has: (1) `auth required pam_a.so` [FAIL], (2) `auth sufficient pam_b.so` [PASS], (3) `auth required pam_c.so` [PASS]. What is the final authentication verdict and execution trace?',
        options: [
          'GRANTED at step 2 because pam_b.so is sufficient.',
          'DENIED immediately at step 1 without running step 2 or 3.',
          'All three modules execute, and authentication is DENIED at the end because a required module failed.',
          'GRANTED at step 3 because two of three modules passed.',
        ],
        correctOptionIndex: 2,
        hint: 'Contrast `required` vs. `requisite`, and check how `sufficient` behaves after a prior failure (Figure 7-4).',
        explanation: 'A failed `required` rule records failure but does NOT stop execution; `sufficient` cannot override an earlier `required` failure, so execution finishes and returns DENY.',
      },
      {
        id: 'ch7-q3',
        type: 'fill_blank',
        sectionRef: '7.3',
        prompt: 'Because /etc/passwd must remain world-readable, Linux stores actual salted password hashes in which root-restricted file?',
        acceptedAnswers: ['/etc/shadow'],
        hint: 'Look at the "x" placeholder in the second field of /etc/passwd.',
        explanation: '/etc/shadow isolates password hashes and aging policy with strict root/shadow permissions.',
      },
      {
        id: 'ch7-q4',
        type: 'command_write',
        sectionRef: '7.2',
        prompt: 'Write the journalctl command to display logs specifically for the unit cron.service.',
        acceptedAnswers: ['journalctl -u cron.service', 'journalctl -u cron', 'journalctl --unit=cron.service', 'journalctl --unit cron.service'],
        hint: 'Use the -u (--unit) flag.',
        explanation: '`journalctl -u cron.service` filters the systemd journal to entries tagged with `_SYSTEMD_UNIT=cron.service`.',
      },
    ],
    flashcards: [
      {
        id: 'fc-7-1',
        chapterNumber: 7,
        sectionRef: '7.3',
        front: 'What are the 7 colon-separated fields of an /etc/passwd line (Figure 7-1)?',
        back: 'username : password_placeholder(x) : UID : GID : GECOS(comment/name) : home_dir : login_shell',
        tags: ['users', 'passwd'],
      },
      {
        id: 'fc-7-2',
        chapterNumber: 7,
        sectionRef: '7.10',
        front: 'What is the crucial difference between PAM `requisite` and `required` control flags?',
        back: 'Both fail authentication on failure, but `requisite` aborts immediately whereas `required` continues evaluating remaining rules before failing at the end.',
        tags: ['pam', 'security'],
      },
    ],
    keyTakeaways: [
      'systemd-journald stores structured, filterable logs queried via journalctl.',
      '/etc/passwd maps usernames to UIDs publicly, while /etc/shadow isolates password hashes.',
      'cron uses 5-field schedules (min hour dom month dow); systemd timers add catch-up and journal integration.',
      'PAM stacks evaluate control flags (requisite, required, sufficient, optional) top-to-bottom to enforce modular authentication.',
    ],
  },

  {
    number: 8,
    id: 'ch-8',
    part: 'Part II: Core System Internals',
    title: 'A Closer Look at Processes and Resource Utilization',
    subtitle: 'Tracking Processes, Open Files (lsof), Tracing (strace), Load, Virtual Memory, I/O, and cgroups',
    sectionRange: '8.1 – 8.7 (8.5 restored from chapter body)',
    status: 'VALIDATED',
    estimatedMinutes: 55,
    prerequisites: [1, 6, 7],
    overview:
      'When a Linux machine feels sluggish, guessing wastes hours. Chapter 8 gives you the diagnostic toolkit to measure exactly where time and resources go: inspecting open files with lsof, tracing live syscalls with strace, interpreting CPU time and load averages, understanding demand-paged virtual memory and swap thrashing, profiling disk I/O, and isolating resources with cgroups v1 and v2.',
    learningObjectives: [
      'Trace active processes, parent/child trees, and open file handles using ps, top, and lsof.',
      'Diagnose failing or hung binaries by observing real-time system calls with strace.',
      'Interpret load averages, CPU utilization splits (user, sys, iowait), and virtual memory page faults (vmstat, free).',
      'Compare cgroups v1 (per-controller hierarchies) with cgroups v2 (unified hierarchy) for resource control.',
    ],
    visualizerId: 'memory_cgroups',
    visualizerTitle: 'Virtual Memory Demand-Paging Simulator & cgroups v1 vs. v2 Explorer',
    sections: [
      {
        id: 'ch8-8.1',
        number: '8.1–8.4',
        title: 'Tracking Processes, lsof, Tracing with strace/ltrace & Threads',
        subsections: [
          '8.1 Tracking Processes (top, ps)',
          '8.2 Finding Open Files with lsof',
          '8.3 Tracing Program Execution and System Calls (strace, ltrace)',
          '8.4 Threads (Single-threaded vs. Multi-threaded, ps m)',
        ],
        bookGroundedSummary:
          'Beyond basic ps/top monitoring, lsof reveals every file, directory, and network socket a process holds open, while strace lets you watch the exact system calls a program makes to the kernel.',
        detailedExplanation: [
          'In Linux, a process holds open files, pipes, libraries, and network sockets. `lsof` (List Open Files) answers crucial operational questions: "Which process is preventing me from unmounting /mnt/usb?" (`lsof /mnt/usb`) or "Which process is listening on port 80?" (`lsof -i :80`).',
          '`strace` intercepts and prints every system call a program invokes (along with arguments and return values or errors like `ENOENT` or `EACCES`). When a program exits silently or complains "file not found" without saying WHICH file, `strace` reveals the exact failing `openat()` call in seconds!',
          '`ltrace` performs a similar trace for shared library calls instead of kernel syscalls.',
          'Threads are lightweight execution contexts sharing the same process address space and open file descriptors (created via the `clone()` syscall). `ps m` shows individual threads under a process.',
        ],
        codeExamples: [
          {
            title: 'Finding a missing config file using strace',
            command: 'strace -e openat myapp 2>&1 | tail -n 3',
            output: `openat(AT_FDCWD, "/etc/myapp.conf", O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, "/home/juser/.myapprc", O_RDONLY) = -1 ENOENT (No such file or directory)
+++ exited with 1 +++`,
            explanation:
              'Filtering with `-e openat` immediately pinpoints the exact config paths the binary tried to open before exiting.',
          },
        ],
      },
      {
        id: 'ch8-8.5',
        number: '8.5–8.6',
        title: 'Resource Monitoring: Load Averages, Memory, Virtual Memory, CPU & Disk I/O',
        subsections: [
          '8.5 Introduction to Resource Monitoring (restored from body)',
          '8.6 Measuring CPU Time, Adjusting Priorities (nice/renice), Load Averages (uptime)',
          '8.6.4 Memory & Virtual Memory (Demand Paging, Page Faults, vmstat)',
          '8.6.5 Monitoring CPU and Memory Performance & I/O Monitoring (iostat, iotop)',
        ],
        bookGroundedSummary:
          'Effective performance troubleshooting isolates the true bottleneck—CPU, RAM/swap thrashing, or disk I/O—using uptime, time, free, vmstat, and iostat.',
        detailedExplanation: [
          'Load average (shown by `uptime` and `top` as 1-, 5-, and 15-minute averages) measures the average number of processes either runnable (waiting for CPU) OR in uninterruptible sleep (usually waiting on disk I/O). A load average of 4.0 saturates a 4-core CPU, whereas 4.0 on a 16-core server still leaves ample headroom.',
          'Virtual memory relies on demand paging: the kernel only loads 4 KB memory pages into physical RAM when a process actually touches them. A **minor page fault** resolves quickly from pages already in RAM (e.g., shared libraries or cache); a **major page fault** must read from disk or swap, which is thousands of times slower.',
          'Look closely at `vmstat 2` output: high `si`/`so` (swap in / swap out) alongside high `wa` (I/O wait) indicates **thrashing**—the system is spending more time shuffling pages to and from disk than running useful code! Remember also that Linux uses "free" RAM aggressively for disk page cache (`buff/cache` in `free -h`), which is reclaimed instantly when apps need memory—so always check the `available` column, not `free`.',
        ],
        codeExamples: [
          {
            title: 'Reading memory availability and vmstat counters',
            command: 'free -h && vmstat 1 2',
            output: `               total        used        free      shared  buff/cache   available
Mem:            15Gi       3.2Gi       2.1Gi       240Mi       9.8Gi        11Gi
Swap:          2.0Gi          0B       2.0Gi
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 2201400 310200 9981200  0    0     4    12  145  280  6  2 92  0  0`,
            explanation:
              'Despite only 2.1 GiB strictly "free", 11 GiB is "available" because buff/cache is reclaimable. Zero si/so confirms no swap thrashing.',
          },
        ],
        sourceNotes: [
          'Source Audit Note: Heading 8.5 ("Introduction to Resource Monitoring") exists in the body HTML but was omitted from the Calibre TOC; restored here.',
        ],
      },
      {
        id: 'ch8-8.7',
        number: '8.7',
        title: 'Control Groups (cgroups v1 vs. cgroups v2)',
        subsections: ['8.7.1 Viewing cgroups', '8.7.2 Manipulating cgroups (v1 vs. v2, Figures 8-1 & 8-2)'],
        bookGroundedSummary:
          'Control groups (cgroups) are the Linux kernel mechanism that accounts for and limits CPU, memory, and I/O consumption across groups of processes—forming the foundation for both systemd resource limits and Linux containers.',
        detailedExplanation: [
          'In **cgroups v1** (Figure 8-1), every resource controller (`cpu`, `memory`, `blkio`, `pids`) maintained its own independent directory hierarchy under `/sys/fs/cgroup/<controller>/`. A single process could belong to completely different paths across controllers, which made coordinating cross-controller limits (such as buffered disk writeback involving both memory and I/O) notoriously complex.',
          'In **cgroups v2** (Figure 8-2), Linux adopts a **single unified hierarchy**: every process belongs to exactly one cgroup node, and controllers (`cpu`, `memory`, `io`) are enabled cleanly along that unified tree. systemd exposes cgroups directly via slices (`system.slice`, `user.slice`) and properties like `MemoryMax=` or `CPUQuota=`.',
        ],
        figureIds: ['fig-8-1', 'fig-8-2'],
      },
    ],
    glossary: [
      { term: 'strace', definition: 'Diagnostic tool that traces and prints every system call made by a process along with its arguments and return code.', sectionRef: '8.3' },
      { term: 'Major vs. Minor Page Fault', definition: 'Minor faults map pages already in RAM (fast); major faults must fetch pages from disk/swap (slow).', sectionRef: '8.6.4' },
      { term: 'cgroups (Control Groups)', definition: 'Kernel feature that tracks, limits, and prioritizes CPU, memory, and I/O resources for hierarchies of processes.', sectionRef: '8.7' },
    ],
    terminalLab: {
      intro: 'Diagnose simulated system load, memory utilization, open files, and syscalls.',
      initialDir: '/home/juser',
      tasks: [
        {
          id: 'ch8-t1',
          title: 'Check load averages and memory availability',
          instruction: 'Run uptime and free -h to inspect system load and reclaimable page cache.',
          hint: 'Run uptime && free -h',
          expectedPattern: '(uptime|free)',
          commandExplanation: 'uptime reports 1/5/15-min load averages; free -h shows true available RAM including reclaimable cache.',
          sampleCommand: 'uptime && free -h',
        },
        {
          id: 'ch8-t2',
          title: 'Inspect virtual memory & swap counters',
          instruction: 'Run vmstat to check runnable processes (r), blocked I/O (b), and swap activity (si/so).',
          hint: 'Type vmstat',
          expectedPattern: '^vmstat',
          commandExplanation: 'vmstat summarizes process queues, memory, paging/swap, I/O blocks, and CPU percentages.',
          sampleCommand: 'vmstat',
        },
        {
          id: 'ch8-t3',
          title: 'Trace open files or syscalls',
          instruction: 'Run lsof or strace ls to inspect open descriptors or system calls.',
          hint: 'Run strace ls',
          expectedPattern: '^(lsof|strace)',
          commandExplanation: 'lsof maps processes to open files/sockets; strace reveals every kernel system call.',
          sampleCommand: 'strace ls',
        },
      ],
    },
    assessments: [
      {
        id: 'ch8-q1',
        type: 'output_interpret',
        sectionRef: '8.6.4',
        prompt: 'A 16 GB server reports: `total: 16Gi, used: 3.1Gi, free: 400Mi, buff/cache: 12.5Gi, available: 12.4Gi`. Is the server running out of RAM?',
        options: [
          'Yes—only 400 MiB is free, so processes are about to crash.',
          'No—Linux uses spare RAM for disk caching (buff/cache) and reclaims it immediately on demand; 12.4 GiB is available.',
          'Yes—unless swap is at least 32 GiB.',
          'Cannot tell without restarting systemd.',
        ],
        correctOptionIndex: 1,
        hint: 'Look at the `available` column vs. `free` in `free -h`.',
        explanation: 'Unused RAM is wasted RAM in Linux; the kernel caches filesystem blocks in buff/cache and frees them automatically when applications request memory.',
      },
      {
        id: 'ch8-q2',
        type: 'mcq',
        sectionRef: '8.7',
        prompt: 'What is the core architectural difference between cgroups v1 (Figure 8-1) and cgroups v2 (Figure 8-2)?',
        options: [
          'cgroups v1 only works for Docker; v2 only works for virtual machines.',
          'cgroups v1 places each resource controller in its own separate hierarchy, whereas cgroups v2 enforces a single unified hierarchy where each process belongs to one cgroup.',
          'cgroups v2 removes memory limits in favor of CPU-only scheduling.',
          'cgroups v1 runs in user space while v2 runs in the BIOS.',
        ],
        correctOptionIndex: 1,
        hint: 'Compare Figure 8-1 and Figure 8-2.',
        explanation: 'cgroups v2’s unified hierarchy solves cross-controller coordination issues (like accounting buffered disk writes to both memory and I/O controllers).',
      },
      {
        id: 'ch8-q3',
        type: 'scenario',
        sectionRef: '8.3',
        prompt: 'A compiled binary exits immediately with "Error: cannot initialize" and no other message. Which tool will best show you which configuration file or shared resource failed to open?',
        options: ['uptime', 'strace', 'iostat', 'renice'],
        correctOptionIndex: 1,
        hint: 'Which tool prints every system call (like openat) and its kernel error code?',
        explanation: 'strace logs every openat/stat/connect syscall and its exact errno (such as ENOENT or EACCES), exposing hidden startup failures.',
      },
      {
        id: 'ch8-q4',
        type: 'fill_blank',
        sectionRef: '8.6.4',
        prompt: 'When a process accesses a virtual memory page that must be fetched from disk or swap space (rather than already residing in RAM), the kernel handles a ________ page fault.',
        acceptedAnswers: ['major', 'major page fault'],
        hint: 'Contrast with a "minor" page fault.',
        explanation: 'Major page faults require disk I/O and severely impact latency if they happen repeatedly (thrashing).',
      },
    ],
    flashcards: [
      {
        id: 'fc-8-1',
        chapterNumber: 8,
        sectionRef: '8.6',
        front: 'What two process states contribute to Linux load averages?',
        back: '1. Runnable processes (using or waiting for CPU)\n2. Processes in uninterruptible sleep (state D, typically waiting on disk I/O)',
        tags: ['performance', 'load'],
      },
      {
        id: 'fc-8-2',
        chapterNumber: 8,
        sectionRef: '8.7',
        front: 'How do cgroups v1 and cgroups v2 differ in hierarchy design?',
        back: 'v1 maintains separate independent trees per controller (cpu, memory, blkio). v2 uses a single unified hierarchy so each process lives in one cgroup with multiple controllers.',
        tags: ['cgroups', 'kernel'],
      },
    ],
    keyTakeaways: [
      'Use lsof to trace open files/sockets and strace to inspect live system calls.',
      'Check `available` memory (not raw `free`) and watch vmstat `si`/`so` for swap thrashing.',
      'cgroups v2 unifies CPU, memory, and I/O control into a single process hierarchy.',
    ],
  },
];
