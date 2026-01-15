export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    objective: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    start_date: string | null;
    due_date: string | null;
    end_date_real: string | null;
    created_at: string;
    // Join fields if any, we might need task_categories later
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string | null;
}
