export type ProcessingStatus =
  | 'NOT PROCESSED'
  | 'IN PROGRESS'
  | 'PROCESSED'
  | 'VALIDATED';

export type MasteryStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'needs_revision';

export type VisualizerId =
  | 'architecture_fork'
  | 'permissions_fhs'
  | 'scsi_storage'
  | 'lvm_inodes'
  | 'boot_grub'
  | 'systemd_timeline'
  | 'config_cron_pam'
  | 'memory_cgroups'
  | 'network_iptables'
  | 'socket_accept_fork'
  | 'shell_quoting'
  | 'rsync_slash'
  | 'make_graph'
  | 'docker_netns_overlay';

export interface BookFigure {
  id: string; // e.g. 'fig-1-1'
  number: string; // e.g. 'Figure 1-1'
  chapterNumber: number;
  caption: string;
  sourceHtmlPath: string; // e.g. 'images/000000.png'
  url: string; // e.g. '/assets/aistudio/000000_315d973e.png'
  note?: string; // e.g. original errata note
}

export interface ReferenceTable {
  id: string;
  number: string; // e.g. 'Table 2-1'
  title: string;
  headers: string[];
  rows: string[][];
}

export interface CodeExample {
  title: string;
  command: string;
  output?: string;
  explanation: string;
  isSupplemental?: boolean;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  sectionRef: string;
}

export interface ChapterSection {
  id: string; // e.g. 'ch1-1.1'
  number: string; // e.g. '1.1'
  title: string;
  subsections?: string[];
  bookGroundedSummary: string;
  detailedExplanation: string[];
  supplementalNote?: string;
  figureIds?: string[];
  codeExamples?: CodeExample[];
  table?: ReferenceTable;
  quickCheck?: {
    prompt: string;
    answer: string;
  };
  sourceNotes?: string[];
}

export interface LabTask {
  id: string;
  title: string;
  instruction: string;
  hint: string;
  expectedPattern: string; // regex string matched against command or simulated terminal state
  commandExplanation: string;
  sampleCommand: string;
}

export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_blank'
  | 'command_write'
  | 'output_interpret'
  | 'debug'
  | 'scenario'
  | 'short_answer';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  sectionRef: string;
  prompt: string;
  codeBlock?: string;
  options?: string[]; // for mcq / true_false / output_interpret / scenario
  acceptedAnswers?: string[]; // normalized strings or regex patterns for fill_blank / command_write / debug / short_answer
  correctOptionIndex?: number; // for option-based questions
  rubricKeywords?: string[]; // for short_answer self-check + keyword matcher
  hint: string;
  explanation: string;
  isSupplemental?: boolean;
}

export interface FlashcardItem {
  id: string;
  chapterNumber: number;
  sectionRef: string;
  front: string;
  back: string;
  tags: string[];
}

export interface ChapterModule {
  number: number;
  id: string;
  part: 'Part I: Foundations' | 'Part II: Core System Internals' | 'Part III: Automation, Services & Tooling';
  title: string;
  subtitle: string;
  sectionRange: string;
  status: ProcessingStatus;
  estimatedMinutes: number;
  prerequisites: number[];
  overview: string;
  learningObjectives: string[];
  visualizerId?: VisualizerId;
  visualizerTitle?: string;
  sections: ChapterSection[];
  glossary: GlossaryTerm[];
  terminalLab: {
    intro: string;
    initialDir: string;
    tasks: LabTask[];
  };
  assessments: AssessmentQuestion[];
  flashcards: FlashcardItem[];
  keyTakeaways: string[];
  sourceNotes?: string[];
}

export interface SourceAnomaly {
  id: string;
  category: 'Missing Asset' | 'TOC Discrepancy' | 'LOI Omission' | 'Source Erratum' | 'Version Note';
  severity: 'info' | 'warning';
  location: string;
  description: string;
  resolution: string;
}

export interface ContentDatabase {
  meta: {
    bookTitle: string;
    edition: string;
    author: string;
    publisher: string;
    year: number;
    generatedAt: string;
    totalChapters: number;
    totalFigures: number;
    auditStatus: ProcessingStatus;
  };
  figures: BookFigure[];
  anomalies: SourceAnomaly[];
  chapters: ChapterModule[];
}
