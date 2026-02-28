export type JobStatus = 'applied' | 'interviewing' | 'offered' | 'rejected' | 'direct-reject'|'saved';

export interface Job {
  id: string;
  company: string;
  role: string;
  status: JobStatus;
  url?: string;
  salary?: string;
  notes?: string;
  appliedDate: Date;
  updatedDate: Date;
}

export interface ResumeAnalysis {
  score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}
