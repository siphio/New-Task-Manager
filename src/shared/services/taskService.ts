import { supabase } from './supabase';
import { Task, UpdateTaskInput } from '@/shared/types';

// Check if we're in guest/demo mode
const isGuestMode = () => {
  const authStore = localStorage.getItem('taskflow-auth');
  if (!authStore) return true;
  try {
    const parsed = JSON.parse(authStore);
    return parsed.state?.user?.id === 'guest-user' || !parsed.state?.isAuthenticated;
  } catch {
    return true;
  }
};

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    if (isGuestMode()) {
      // In guest mode, tasks are managed entirely in Zustand store
      return [];
    }

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbTaskToTask);
  },

  async createTask(task: Task): Promise<Task> {
    if (isGuestMode()) {
      // Guest mode: task already created in store
      return task;
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate,
        scheduled_start: task.scheduledTime?.start,
        scheduled_end: task.scheduledTime?.end,
        subtasks: task.subtasks,
        completed: task.completed,
        completed_at: task.completedAt,
        created_at: task.createdAt,
        updated_at: task.updatedAt,
        user_id: task.userId,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbTaskToTask(data);
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<void> {
    if (isGuestMode()) return;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
    if (input.scheduledTime !== undefined) {
      updateData.scheduled_start = input.scheduledTime?.start;
      updateData.scheduled_end = input.scheduledTime?.end;
    }
    if (input.subtasks !== undefined) updateData.subtasks = input.subtasks;
    if (input.completed !== undefined) {
      updateData.completed = input.completed;
      updateData.completed_at = input.completed ? new Date().toISOString() : null;
    }

    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  async deleteTask(id: string): Promise<void> {
    if (isGuestMode()) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Helper to map database columns to Task interface
function mapDbTaskToTask(dbTask: Record<string, unknown>): Task {
  return {
    id: dbTask.id as string,
    title: dbTask.title as string,
    description: dbTask.description as string | undefined,
    category: dbTask.category as Task['category'],
    priority: dbTask.priority as Task['priority'],
    dueDate: dbTask.due_date as string,
    scheduledTime: dbTask.scheduled_start ? {
      start: dbTask.scheduled_start as string,
      end: dbTask.scheduled_end as string,
    } : undefined,
    subtasks: (dbTask.subtasks as Task['subtasks']) || [],
    completed: dbTask.completed as boolean,
    completedAt: dbTask.completed_at as string | undefined,
    createdAt: dbTask.created_at as string,
    updatedAt: dbTask.updated_at as string,
    userId: dbTask.user_id as string,
  };
}
