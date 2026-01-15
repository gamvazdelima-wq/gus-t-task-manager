import { format } from 'date-fns';
import { Calendar, CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import type { Task } from '../types';
import { cn } from '../lib/utils';

interface TaskCardProps {
    task: Task;
    onEdit?: (task: Task) => void;
}

const statusConfig = {
    pending: { label: 'To Do', icon: Circle, color: 'text-slate-500 bg-slate-50 border-slate-200' },
    in_progress: { label: 'In Progress', icon: Clock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    completed: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' },
};

const priorityConfig = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700 font-bold',
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
    const StatusIcon = statusConfig[task.status].icon;

    return (
        <div
            onClick={() => onEdit?.(task)}
            className="group bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border", statusConfig[task.status].color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusConfig[task.status].label}</span>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold", priorityConfig[task.priority])}>
                    {task.priority}
                </span>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                {task.title}
            </h3>

            {task.description && (
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
                {task.due_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{format(new Date(task.due_date), 'MMM d, yyyy')}</span>
                    </div>
                )}
                {/* Placeholder for categories if we had them fetched */}
            </div>
        </div>
    );
}
