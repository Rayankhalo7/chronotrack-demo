export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type ProjectDTO = {
  id: string;
  name: string;
  color: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntryDTO = {
  id: string;
  projectId: string;
  projectName?: string;
  projectColor?: string | null;
  startedAt: string;
  endedAt: string | null;
  note: string | null;
  durationMinutes: number | null;
};
