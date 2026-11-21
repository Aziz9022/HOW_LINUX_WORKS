# SOURCE_MANIFEST.md — Stage 1 Source Audit

**Primary Source Authority**: *How Linux Works: What Every Superuser Should Know*, 3rd Edition  
**Author**: Brian Ward  
**Publisher**: No Starch Press (Copyright © 2021)  
**Audit Method**: Direct inspection of the user-supplied HTML conversion (`index_64a2c1d0.html`), stylesheet (`style_e47422b4.css`), and all 41 PNG illustrations (`000000`–`000040`).

---

## 1. Source File Inventory

| Logical Source Reference | Workspace Path | Runtime Public URL | Type | Status |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` (book HTML) | `/public/assets/aistudio/index_64a2c1d0.html` | `/assets/aistudio/index_64a2c1d0.html` | HTML (Calibre EPUB conversion) | VALIDATED |
| `style.css` (book CSS) | `/public/assets/aistudio/style_e47422b4.css` | `/assets/aistudio/style_e47422b4.css` | CSS | VALIDATED |
| `images/000000.png` – `images/000040.png` | `/public/assets/aistudio/0000XX_<hash>.png` | `/assets/aistudio/0000XX_<hash>.png` | 41 PNG Figures | VALIDATED |
| `images/000041.png` | *(Missing from uploaded files)* | — | Decorative chapter opener art (referenced 17x) | NOT PROCESSED (MISSING) |
| `images/000042.png` | *(Missing from uploaded files)* | — | Publisher title-page logo (referenced 1x) | NOT PROCESSED (MISSING) |
| `cover.xhtml` | *(Missing from uploaded files)* | — | EPUB cover wrapper referenced in nav | NOT PROCESSED (MISSING) |
| `NSAnnotations-Mono.otf` / `NSAnnotations500-Mono.otf` | *(Missing from uploaded files)* | — | Custom circled-callout monospace fonts in CSS | NOT PROCESSED (MISSING) |

---

## 2. Exact Chapter Hierarchy & Processing Status

All 17 chapters follow the exact order and section numbering found in `index_64a2c1d0.html`.

| Ch | Exact Book Title | Body Section Range | Figures | Tables / Listings | Processing Status |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | The Big Picture | 1.1 – 1.6 | Fig 1-1, 1-2, 1-3 | — | VALIDATED |
| 2 | Basic Commands and Directory Hierarchy | 2.1 – 2.21 | Fig 2-1, 2-2 | Tables 2-1 to 2-4 | VALIDATED |
| 3 | Devices | 3.1 – 3.6 | Fig 3-1, 3-2, 3-3 | — | VALIDATED |
| 4 | Disks and Filesystems | 4.1 – 4.6 *(no 4.4.1)* | Fig 4-1 to 4-10 | Listing 4-1 | VALIDATED |
| 5 | How the Linux Kernel Boots | 5.1 – 5.8 *(5.5 in body)* | Fig 5-1, 5-2 | — | VALIDATED |
| 6 | How User Space Starts | 6.1 – 6.9 *(6.1 in body)* | Fig 6-1, 6-2, 6-3 | — | VALIDATED |
| 7 | System Configuration: Logging, System Time, Batch Jobs, and Users | 7.1 – 7.11 | Fig 7-1 to 7-4 | Listings 7-1 to 7-4 | VALIDATED |
| 8 | A Closer Look at Processes and Resource Utilization | 8.1 – 8.7 *(8.5 in body)* | Fig 8-1, 8-2 | Listings 8-1 to 8-3 | VALIDATED |
| 9 | Understanding Your Network and Its Configuration | 9.1 – 9.28 *(9.11 in body)* | Fig 9-1 to 9-7 | Tables 9-1, 9-2 | VALIDATED |
| 10 | Network Applications and Services | 10.1 – 10.10 | Fig 10-1 | Tables 10-1 to 10-3 | VALIDATED |
| 11 | Introduction to Shell Scripts | 11.1 – 11.14 | — | Tables 11-1 to 11-3 | VALIDATED |
| 12 | Network File Transfer and Sharing | 12.1 – 12.8 *(12.3 in body)* | Fig 12-1, 12-2 | — | VALIDATED |
| 13 | User Environments | 13.1 – 13.7 | — | — | VALIDATED |
| 14 | A Brief Survey of the Linux Desktop and Printing | 14.1 – 14.7 | — | — | VALIDATED |
| 15 | Development Tools | 15.1 – 15.6 | Fig 15-1 | — | VALIDATED |
| 16 | Introduction to Compiling Software from C Source Code | 16.1 – 16.7 | — | — | VALIDATED |
| 17 | Virtualization | 17.1 – 17.3 | Fig 17-1 | — | VALIDATED |

*Front Matter (Reviews, Title Page, Copyright, About the Author, Acknowledgments, Preface) and Back Matter (Bibliography, Index) were audited for structural context and cross-references.*

---

## 3. Complete Figure Mapping (41/41 Instructional Figures Verified)

| Figure | Chapter | Source HTML Path | Workspace Runtime URL | Caption in Source |
| :--- | :---: | :--- | :--- | :--- |
| Fig 1-1 | 1 | `images/000000.png` | `/assets/aistudio/000000_315d973e.png` | General Linux system organization |
| Fig 1-2 | 1 | `images/000001.png` | `/assets/aistudio/000001_a4fe83d5.png` | Starting a new process |
| Fig 1-3 | 1 | `images/000002.png` | `/assets/aistudio/000002_902e314b.png` | Process types and interactions |
| Fig 2-1 | 2 | `images/000003.png` | `/assets/aistudio/000003_6687523b.png` | The pieces of a file mode |
| Fig 2-2 | 2 | `images/000004.png` | `/assets/aistudio/000004_b1357f80.png` | Linux directory hierarchy |
| Fig 3-1 | 3 | `images/000005.png` | `/assets/aistudio/000005_54b2b9e4.png` | SCSI bus with host adapter and devices |
| Fig 3-2 | 3 | `images/000006.png` | `/assets/aistudio/000006_f6ff2d63.png` | Linux SCSI subsystem schematic |
| Fig 3-3 | 3 | `images/000007.png` | `/assets/aistudio/000007_625fcee1.png` | Optical device driver schematic |
| Fig 4-1 | 4 | `images/000008.png` | `/assets/aistudio/000008_76a43a62.png` | Typical Linux disk schematic |
| Fig 4-2 | 4 | `images/000009.png` | `/assets/aistudio/000009_21069f94.png` | Kernel schematic for disk access |
| Fig 4-3 | 4 | `images/000010.png` | `/assets/aistudio/000010_f2e577a5.png` | Top-down view of a hard disk |
| Fig 4-4 | 4 | `images/000011.png` | `/assets/aistudio/000011_f7cba876.png` | How PVs and logical volumes fit together in a volume group |
| Fig 4-5 | 4 | `images/000012.png` | `/assets/aistudio/000012_ba9bca67.png` | Constructing a logical volume system |
| Fig 4-6 | 4 | `images/000013.png` | `/assets/aistudio/000013_1ef2db58.png` | Results of reconfiguring logical volumes |
| Fig 4-7 | 4 | `images/000014.png` | `/assets/aistudio/000014_b1e7b00f.png` | How LVM arranges `mylv1` and `mylv2` |
| Fig 4-8 | 4 | `images/000015.png` | `/assets/aistudio/000015_95a6f2eb.png` | Arrangement after removing `mylv2` and expanding `mylv1` |
| Fig 4-9 | 4 | `images/000016.png` | `/assets/aistudio/000016_8c151ff2.png` | User-level representation of a filesystem |
| Fig 4-10 | 4 | `images/000017.png` | `/assets/aistudio/000017_4a14fa1c.png` | Inode structure of the filesystem shown in Figure 4-9 |
| Fig 5-1 | 5 | `images/000018.png` | `/assets/aistudio/000018_883913c2.png` | GRUB menu |
| Fig 5-2 | 5 | `images/000019.png` | `/assets/aistudio/000019_6ea24f26.png` | GRUB configuration editor |
| Fig 6-1 | 6 | `images/000020.png` | `/assets/aistudio/000020_1cfd9cea.png` | Unit dependency graph |
| Fig 6-2 | 6 | `images/000021.png` | `/assets/aistudio/000021_57fe0208.png` | Sequential boot timeline with a resource dependency |
| Fig 6-3 | 6 | `images/000022.png` | `/assets/aistudio/000022_1f284ba0.png` | systemd boot timeline with a resource unit |
| Fig 7-1 | 7 | `images/000023.png` | `/assets/aistudio/000023_2aad55cf.png` | An entry in the password file |
| Fig 7-2 | 7 | `images/000024.png` | `/assets/aistudio/000024_482b7252.png` | An entry in the `group` file |
| Fig 7-3 | 7 | `images/000025.png` | `/assets/aistudio/000025_a19193ab.png` | An entry in the crontab file |
| Fig 7-4 | 7 | `images/000026.png` | `/assets/aistudio/000026_4a82739c.png` | PAM rule execution flow |
| Fig 8-1 | 8 | `images/000027.png` | `/assets/aistudio/000027_121f3f78.png` | cgroups v1 |
| Fig 8-2 | 8 | `images/000028.png` | `/assets/aistudio/000028_08f0cc7f.png` | cgroups v2 |
| Fig 9-1 | 9 | `images/000029.png` | `/assets/aistudio/000029_329c815b.png` | Typical LAN with router providing internet access |
| Fig 9-2 | 9 | `images/000030.png` | `/assets/aistudio/000030_627790aa.png` | Network with IP addresses |
| Fig 9-3 | 9 | `images/000031.png` | `/assets/aistudio/000031_28688145.png` | Subnet and interface ID of a typical IPv6 address |
| Fig 9-4 | 9 | `images/000032.png` | `/assets/aistudio/000032_bc025873.png` | Sending a message with TCP |
| Fig 9-5 | 9 | `images/000033.png` | `/assets/aistudio/000033_6200ab32.png` | Two subnets joined with a router |
| Fig 9-6 | 9 | `images/000034.png` | `/assets/aistudio/000034_7766dec0.png` | Chain-processing sequence for incoming packets from a network |
| Fig 9-7 | 9 | `images/000035.png` | `/assets/aistudio/000035_6795b123.png` | Chain-processing sequence for outgoing packets from a local process |
| Fig 10-1 | 10 | `images/000036.png` | `/assets/aistudio/000036_e5e9f50a.png` | One method for accepting and processing incoming connections |
| Fig 12-1 | 12 | `images/000037.png` | `/assets/aistudio/000037_9920f345.png` | Normal `rsync` copy |
| Fig 12-2 | 12 | `images/000038.png` | `/assets/aistudio/000038_a221dc35.png` | Effect of trailing slash in `rsync` |
| Fig 15-1 | 15 | `images/000039.png` | `/assets/aistudio/000039_a9ff98ac.png` | Makefile dependencies |
| Fig 17-1 | 17 | `images/000040.png` | `/assets/aistudio/000040_995bb226.png` | Bridge network in Docker |

---

## 4. Verified Source Limitations, Missing Files & Conversion Anomalies

1. **Missing non-instructional assets**: `images/000041.png` (chapter opener graphic), `images/000042.png` (No Starch Press logo), `cover.xhtml`, and `NSAnnotations-Mono.otf` / `NSAnnotations500-Mono.otf` are referenced in the HTML/CSS but were not supplied. Zero instructional diagrams are missing (all 41 figures `000000`–`000040` are present and verified).
2. **Incomplete List of Illustrations (LOI)**: The front-matter `<nav type="loi">` terminates at Figure 9-7 (36 entries), omitting Figures 10-1, 12-1, 12-2, 15-1, and 17-1 even though all five exist in the body HTML and uploaded PNGs. All 41 are restored in this learning lab.
3. **Calibre TOC Omissions & Numbering Gaps**:
   - Section `4.4.1` does not exist in either the TOC or chapter body (the source jumps directly from `4.4` to `4.4.2`).
   - Five major headings — `5.5 GRUB Introduction`, `6.1 Introduction to init`, `8.5 Introduction to Resource Monitoring`, `9.11 Introduction to Network Interface Configuration`, and `12.3 Introduction to File Sharing` — exist as `<h2>` elements in the chapter bodies but were dropped from the Calibre TOC. The learning lab restores all five from the authoritative chapter bodies.
4. **Original Source Errata & Version Notes** (preserved faithfully and annotated as `[Supplemental]` where helpful):
   - Figure 6-1 artwork spells `mutli-user.target` instead of `multi-user.target`.
   - Figure 4-5 artwork contains a stray `8` in `mylv1 8(10GB)` and `mylv2 8(10GB)`.
   - Chapter 17.3 creates a virtual environment named `test-venv` (`python3 -m venv test-venv`) and then shows `. test-env/bin/activate` (missing the `v`).
   - Chapter 12.1 references Python 2 `python -m SimpleHTTPServer`; the modern Python 3 equivalent (`python3 -m http.server`) is explicitly labeled `[Supplemental]`.
   - Chapters 9 and 10 teach `iptables` and `netstat` as primary examples; modern `nftables` and `ss` equivalents are provided as `[Supplemental]` notes aligned with the author's own forward-looking remarks.
   - Chapter 1.5 cross-references "Chapter 3" for pseudo-users; pseudo-users are actually detailed in Chapter 7.3.2.
