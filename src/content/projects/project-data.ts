export interface Project {
  title: string;
  description: string;
  stack: string[];
  impact: string;
  repo?: string;
  demo?: string;
}

export const projects: Project[] = [];
