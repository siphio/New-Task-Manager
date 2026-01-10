export type Category = 'work' | 'personal' | 'team' | 'self-improvement';
export type Priority = 'low' | 'medium' | 'high';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  dueDate: string; // ISO date string
  scheduledTime?: {
    start: string; // ISO datetime
    end: string;   // ISO datetime
  };
  subtasks: Subtask[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  dueDate: string;
  scheduledTime?: {
    start: string;
    end: string;
  };
  subtasks?: Omit<Subtask, 'id'>[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  completed?: boolean;
  subtasks?: Subtask[];
}
