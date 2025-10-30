export interface Sprint {
  id: number;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  createdAt: string;
  updatedAt: string;
}

export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export interface CreateSprintDto {
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintDto {
  name?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status?: SprintStatus;
}
