import { SourceAnomaly } from './types';

export const SOURCE_ANOMALIES: SourceAnomaly[] = [
  {
    id: 'anom-missing-assets',
    category: 'Missing Asset',
    severity: 'warning',
    location: 'index_64a2c1d0.html & style_e47422b4.css',
    description:
      'Decorative chapter-opener image (images/000041.png, referenced 17x), publisher logo (images/000042.png), cover.xhtml, and custom annotation fonts (NSAnnotations-Mono.otf / NSAnnotations500-Mono.otf) are referenced in the HTML/CSS but were not included in the uploaded files.',
    resolution:
      'All 41 instructional figures (images/000000.png through images/000040.png) are present and verified. Missing decorative art and fonts do not impact curriculum accuracy and are cleanly replaced by native typographic badges.',
  },
  {
    id: 'anom-loi-truncated',
    category: 'LOI Omission',
    severity: 'info',
    location: 'Front-matter <nav type="loi">',
    description:
      'The EPUB List of Illustrations stops at Figure 9-7 (36 entries), omitting Figures 10-1, 12-1, 12-2, 15-1, and 17-1 even though all five appear in the chapter body HTML and uploaded PNG set.',
    resolution:
      'All 41 instructional figures have been mapped from the authoritative chapter bodies and embedded in their exact chapters.',
  },
  {
    id: 'anom-toc-omissions',
    category: 'TOC Discrepancy',
    severity: 'info',
    location: 'Front-matter Table of Contents vs. Chapter Bodies',
    description:
      'Five top-level section headings (5.5 GRUB Introduction, 6.1 Introduction to init, 8.5 Introduction to Resource Monitoring, 9.11 Introduction to Network Interface Configuration, and 12.3 Introduction to File Sharing) exist in the chapter body HTML but were dropped by the Calibre TOC conversion. Additionally, section 4.4.1 does not exist in either TOC or body (jumps from 4.4 to 4.4.2).',
    resolution:
      'Restored all five body headings into the module hierarchy while preserving the exact numbering of Chapter 4 (including the original 4.4 -> 4.4.2 numbering).',
  },
  {
    id: 'anom-artwork-typos',
    category: 'Source Erratum',
    severity: 'info',
    location: 'Figure 4-5 & Figure 6-1',
    description:
      'Original book illustrations contain minor print typos: Figure 6-1 labels "mutli-user.target" instead of "multi-user.target", and Figure 4-5 shows a stray "8" before "(10GB)" on mylv1/mylv2.',
    resolution:
      'Original figures are preserved verbatim for authenticity, with non-intrusive caption notes flagging the typos.',
  },
  {
    id: 'anom-text-errata',
    category: 'Source Erratum',
    severity: 'info',
    location: 'Chapter 1.5 & Chapter 17.3',
    description:
      'Chapter 1.5 cross-references "Chapter 3" for pseudo-users (actually detailed in Chapter 7.3.2). Chapter 17.3 creates a virtual environment named "test-venv" and then activates ". test-env/bin/activate" (missing the "v").',
    resolution:
      'Cross-references in this learning lab link accurately to Chapter 7, and the venv typo is called out transparently in Chapter 17.',
  },
  {
    id: 'anom-version-notes',
    category: 'Version Note',
    severity: 'info',
    location: 'Chapters 9, 10, and 12',
    description:
      'The 3rd edition teaches netstat, iptables, and Python 2 SimpleHTTPServer in specific examples while noting newer replacements.',
    resolution:
      'Primary explanations stay faithful to the book; modern equivalents (ss, nftables, python3 -m http.server) are explicitly labeled as [Supplemental].',
  },
];
