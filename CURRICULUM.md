# CURRICULUM.md — Learning Architecture & Progression

Grounded strictly in the 17-chapter sequence of *How Linux Works, 3rd Edition* (Brian Ward).

---

## 1. Curriculum Structure (3 Progressive Tiers)

### Part I — Mental Model & Shell Foundations (Chapters 1–2)
Establishes the three-level abstraction hierarchy (Hardware, Kernel, User Space), the `fork()`/`exec()` process lifecycle, essential shell navigation, quoting, redirection, permissions, archiving, and the Filesystem Hierarchy Standard (FHS).

- **Ch 1: The Big Picture** — Abstractions, kernel duties (CPU, memory, devices, syscalls), user space, root vs. normal users.
  - *Interactive Lab*: 3-Layer Linux Architecture & `fork()`/`exec()` Step-Through Visualizer + Introductory Terminal Exploration.
- **Ch 2: Basic Commands and Directory Hierarchy** — Shell mechanics, streams (`stdin`/`stdout`/`stderr`), pipelines, permissions/modes, links, archives, and directory tree roles (`/bin`, `/dev`, `/etc`, `/usr`, `/var`, `/proc`, `/sys`, `/run`).
  - *Interactive Lab*: File Mode & Octal `chmod`/`umask` Calculator + Interactive FHS Directory Explorer + Core Command Terminal Lab.

### Part II — System Internals: Hardware, Storage, Boot, Services, Processes & Networking (Chapters 3–10)
Traces a Linux system from hardware devices up through disks, filesystems, bootloaders, `systemd`, system configuration, resource accounting, and the full TCP/IP & network service stack.

- **Ch 3: Devices** — Device files (`/dev`), block/character/pipe/socket nodes, `sysfs`, `udev`/`udevd`, SCSI subsystem (`sd`/`sr`/`sg`), `libata`, `lsscsi`, `dd`. *Prereqs: Ch 1, Ch 2.*
  - *Interactive Lab*: SCSI & Storage Driver Stack Inspector + `lsscsi`/`udevadm`/`dd` Terminal Lab.
- **Ch 4: Disks and Filesystems** — MBR vs. GPT partitioning, filesystem types (`ext4`, `XFS`, `Btrfs`, `vfat`), mounting & `/etc/fstab`, UUIDs, swap, Logical Volume Manager (PV → VG → LV), and filesystem internals (superblock, inodes, hard links, `fsck`). *Prereqs: Ch 2, Ch 3.*
  - *Interactive Lab*: LVM Extent Mapper (PV/VG/LV resize simulator) & Interactive Inode / Hard-Link / `unlink()` Graph + Partition/Mount/LVM Terminal Lab.
- **Ch 5: How the Linux Kernel Boots** — 4-stage startup, UEFI/BIOS, GRUB 2 boot menu & kernel parameters, `initramfs` root handoff, `dmesg`, kernel command line. *Prereqs: Ch 1, Ch 4.*
  - *Interactive Lab*: 4-Stage Boot Pipeline & Interactive GRUB Kernel Parameter Editor + `dmesg`/`lsblk` Lab.
- **Ch 6: How User Space Starts** — PID 1 (`init` / `systemd`), unit types (`.service`, `.target`, `.socket`, `.mount`), unit dependencies (`Wants`, `Requires`, `After`), socket activation & parallel startup vs. legacy SysV/Upstart. *Prereqs: Ch 5.*
  - *Interactive Lab*: Sequential vs. systemd Socket-Activated Parallel Boot Timeline Simulator + `systemctl` Lab.
- **Ch 7: System Configuration: Logging, System Time, Batch Jobs, and Users** — `/etc` structure, `journald`/`journalctl` & `rsyslog`, `/etc/passwd`/`shadow`/`group`, NTP/RTC/timezones, `cron` & `systemd` timers, and Pluggable Authentication Modules (PAM). *Prereqs: Ch 2, Ch 6.*
  - *Interactive Lab*: `/etc/passwd` Inspector, Crontab Schedule Explorer & PAM Rule Stack Evaluator (`requisite`/`required`/`sufficient`) + `journalctl`/`crontab` Lab.
- **Ch 8: A Closer Look at Processes and Resource Utilization** — Process monitoring (`ps`, `top`, `lsof`), signals (`SIGTERM`, `SIGKILL`, `SIGHUP`), `nice`/scheduling, CPU time (`user`/`sys`/`iowait`), load averages, virtual memory & page faults (`vmstat`, `free`), I/O (`iostat`, `iotop`), tracing (`strace`/`ltrace`), and `cgroups` v1 vs. v2. *Prereqs: Ch 1, Ch 6, Ch 7.*
  - *Interactive Lab*: Virtual Memory Demand-Paging Simulator & cgroups v1 vs. v2 Hierarchy Explorer + `ps`/`vmstat`/`strace`/`lsof` Lab.
- **Ch 9: Understanding Your Network and Its Configuration** — Packet layers, IPv4 CIDR & subnet masks, IPv6 structure, longest-prefix routing tables, ARP, DNS, DHCP, `ip`/`nmcli`, TCP three-way handshake & UDP, NAT, and `iptables` (`INPUT`/`FORWARD`/`OUTPUT`). *Prereqs: Ch 6, Ch 7.*
  - *Interactive Lab*: IPv4 CIDR/Longest-Prefix Route Matcher & `iptables` Packet-Chain Tracer + `ip`/`iptables`/`host` Lab.
- **Ch 10: Network Applications and Services** — Client/server socket model (`listen`/`accept`/`fork`), SSH & public-key auth, diagnostics (`lsof -i`, `netstat`/`ss`, `tcpdump`, `nmap`), RPC, and network security principles. *Prereqs: Ch 8, Ch 9.*
  - *Interactive Lab*: `accept()`/`fork()` Concurrent Server Socket Flow Visualizer + `ss`/`lsof`/`ssh` Diagnostics Lab.

### Part III — Automation, Sharing, User Environments, Desktop, Build Systems & Virtualization (Chapters 11–17)
Applies Linux internals to shell programming, remote file transfer, environment configuration, desktop architecture, compilers/build tools, and containers/VMs.

- **Ch 11: Introduction to Shell Scripts** — Shebang (`#!`), quoting & expansion rules, exit status (`$?`), conditionals (`if`/`[ ]`/`case`), loops (`for`/`while`), functions, `sed`/`awk`, and safe subshell/temp-file idioms. *Prereqs: Ch 2.*
  - *Interactive Lab*: Shell Quoting & Variable/Glob Expansion Sandbox + Script Debugging Exercises.
- **Ch 12: Network File Transfer and Sharing** — Quick HTTP serving, `scp`/`sftp`, `rsync` delta sync & trailing-slash semantics (`--delete`, `-a`, `-n`), Samba (SMB/CIFS), and SSHFS/NFS concepts. *Prereqs: Ch 9, Ch 10.*
  - *Interactive Lab*: `rsync` Trailing-Slash & `--delete` Directory Tree Simulator + `rsync` Command Lab.
- **Ch 13: User Environments** — Login vs. non-login interactive shells, startup files (`.bash_profile`, `.bashrc`, `/etc/profile`), `PATH` ordering, aliases, prompts (`PS1`), and safe startup file practices. *Prereqs: Ch 2, Ch 11.*
  - *Interactive Lab*: Shell Startup Order & `PATH` Resolution Terminal Exercises.
- **Ch 14: A Brief Survey of the Linux Desktop and Printing** — Display servers (X11 vs. Wayland), compositors, desktop environments, D-Bus IPC, font rendering, and CUPS printing architecture. *Prereqs: Ch 6, Ch 10.*
  - *Interactive Lab*: Conceptual Architecture Walkthrough & Diagnostics Scenarios.
- **Ch 15: Development Tools** — C compilation pipeline (preprocess → compile → assemble → link), shared vs. static libraries (`ldd`, `ldconfig`, `LD_LIBRARY_PATH`), `make` dependency graphs & timestamps, scripting languages, and debugging (`gdb`). *Prereqs: Ch 2, Ch 11.*
  - *Interactive Lab*: Interactive `make` Dependency Graph & Timestamp Rebuilder + `ldd`/`make` Terminal Lab.
- **Ch 16: Introduction to Compiling Software from C Source Code** — Source tarballs, GNU Autotools (`./configure`, `make`, `make install`), `--prefix`, `pkg-config`, patching, and diagnosing missing headers/library link errors. *Prereqs: Ch 15.*
  - *Interactive Lab*: Build Error Diagnostics & Autotools Troubleshooting Lab.
- **Ch 17: Virtualization** — Full virtualization (hypervisors, KVM/QEMU, virtio) vs. OS-level containers (namespaces, cgroups, OverlayFS), Docker networking (`docker0` bridge, `veth`, `netns`, NAT), and language runtimes (`venv`). *Prereqs: Ch 4, Ch 8, Ch 9.*
  - *Interactive Lab*: Docker `netns` / `docker0` Bridge & OverlayFS Copy-on-Write Visualizer + `docker` Inspection Lab.

---

## 2. Assessment & Mastery Policy

Progress is explicitly distinguished from true mastery:

| Mastery State | Criteria |
| :--- | :--- |
| **Not started** | Zero sections studied and no assessment attempts recorded. |
| **In progress** | At least one section marked studied OR assessment attempted below passing threshold without full review. |
| **Needs revision** | Chapter explicitly flagged as difficult by learner, OR latest assessment score < 70%, OR unresolved incorrect answers logged. |
| **Completed** | All chapter sections studied AND chapter assessment passed with ≥ 75% accuracy (with varied question formats: MCQ, True/False, Fill-in-the-blank, Command-writing, Output interpretation, Debugging, Scenario, and Conceptual Short Answer). |

Spaced-repetition flashcards use an SM-2 scheduling interval (`Again`, `Hard`, `Good`, `Easy`) stored locally in IndexedDB to reinforce long-term retention across sessions.
