import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, CheckCircle2, Circle, AlignLeft } from 'lucide-react';
import type { Task, TaskPriority } from '../types';
import { cn } from '../lib/utils';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-[#E8F5E9] text-[#1B5E20]',
    medium: 'bg-[#FFF3E0] text-[#E65100]',
    high: 'bg-[#FFEBEE] text-[#C62828]',
    urgent: 'bg-[#FCE4EC] text-[#880E4F] ring-1 ring-[#F48FB1]',
};

export default function TaskCard({ task, onEdit }: TaskCardProps) {
    const [categories, setCategories] = useState<{ name: string, id: string }[]>([]);

    useEffect(() => {
        supabase
            .from('task_categories')
            .select('categories(name, id)')
            .eq('task_id', task.id)
            .then(({ data }) => {
                if (data) {
                    setCategories(data.map((item: any) => item.categories));
                }
            });
    }, [task.id]);

    return (
        <div
            onClick={() => onEdit(task)}
            className="group bg-[#F7F2FA] hover:bg-[#F3EDF7] rounded-[24px] p-6 cursor-pointer transition-all duration-300 hover:shadow-md border border-transparent hover:border-[#CAC4D0] relative flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium tracking-wide border border-transparent uppercase",
                    priorityColors[task.priority]
                )}>
                    {task.priority}
                </div>

                {task.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-[#1B5E20]" />
                ) : (
                    <Circle className="w-6 h-6 text-[#79747E] group-hover:text-[#6750A4] transition-colors" />
                )}
            </div>

            <h3 className={cn(
                "text-xl font-normal text-[#1D1B20] mb-2 line-clamp-2",
                task.status === 'completed' && "line-through text-[#79747E]"
            )}>
                {task.title}
            </h3>

            {task.description && (
                <p className="text-[#49454F] text-sm mb-4 line-clamp-3">
                    {task.description}
                </p>
            )}

            <div className="mt-auto flex flex-col gap-3">
                {/* Categories as Chips */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(cat => (
                            <span key={cat.id} className="bg-white px-2 py-0.5 rounded-md text-[11px] font-medium text-[#49454F] border border-[#E7E0EC]">
                                {cat.name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-4 text-[#79747E] text-xs pt-2 border-t border-[#E7E0EC]/50">
                    {task.due_date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                    )}
                    {task.description && (
                        <div className="flex items-center gap-1.5">
                            <AlignLeft className="w-3.5 h-3.5" />
                            <span>Desc</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
