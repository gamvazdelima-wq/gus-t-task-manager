import { useState, useEffect } from 'react';
import { X, Flag, CheckCircle2, Plus, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskPriority, TaskStatus, Category } from '../types';
import { cn } from '../lib/utils';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    taskToEdit?: Task | null;
}

export default function CreateTaskModal({ isOpen, onClose, onSuccess, taskToEdit }: CreateTaskModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>('pending');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [dueDate, setDueDate] = useState('');

    // Category State
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            fetchCategories();
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description || '');
                setStatus(taskToEdit.status);
                setPriority(taskToEdit.priority);
                setDueDate(taskToEdit.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : '');
                fetchTaskCategories(taskToEdit.id);
            } else {
                resetForm();
            }
        }
    }, [taskToEdit, isOpen]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setStatus('pending');
        setPriority('medium');
        setDueDate('');
        setSelectedCategoryIds([]);
        setIsCreatingCategory(false);
        setNewCategoryName('');
        setError(null);
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) console.error("Error fetching categories:", error);
        if (data) setCategories(data as Category[]);
    };

    const fetchTaskCategories = async (taskId: string) => {
        const { data } = await supabase
            .from('task_categories')
            .select('category_id')
            .eq('task_id', taskId);

        if (data) {
            setSelectedCategoryIds(data.map((item: any) => item.category_id));
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        if (!user) {
            setError("You must be logged in to create categories.");
            return;
        }

        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{ name: newCategoryName.trim(), user_id: user.id }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setCategories([...categories, data as Category]);
                setSelectedCategoryIds([...selectedCategoryIds, data.id]);
                setNewCategoryName('');
                setIsCreatingCategory(false);
            }
        } catch (err: any) {
            console.error("Error creating category:", err);
            setError(`Failed to create category: ${err.message}`);
        }
    };

    const toggleCategory = (categoryId: string) => {
        if (selectedCategoryIds.includes(categoryId)) {
            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== categoryId));
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        console.log("Submitting task form...");

        if (!user) {
            const msg = 'User session not found. Please reload the page and login again.';
            console.error(msg);
            setError(msg);
            return;
        }

        if (!title.trim()) {
            const msg = 'Task title is required.';
            console.error(msg);
            setError(msg);
            return;
        }

        setLoading(true);

        try {
            const taskData = {
                title: title.trim(),
                description: description?.trim() || null,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                user_id: user.id,
            };

            console.log("Task Payload:", taskData);

            let taskId = taskToEdit?.id;

            if (taskToEdit) {
                const { error } = await supabase
                    .from('tasks')
                    .update(taskData)
                    .eq('id', taskToEdit.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('tasks')
                    .insert([taskData])
                    .select()
                    .single();

                if (error) throw error;
                if (!data) throw new Error("No data returned from insert");
                taskId = data.id;
            }

            console.log("Task ID processed:", taskId);

            if (taskId) {
                // Update categories
                if (taskToEdit) {
                    await supabase.from('task_categories').delete().eq('task_id', taskId);
                }

                if (selectedCategoryIds.length > 0) {
                    const categoryInserts = selectedCategoryIds.map(categoryId => ({
                        task_id: taskId,
                        category_id: categoryId,
                        user_id: user.id
                    }));
                    const { error: catError } = await supabase.from('task_categories').insert(categoryInserts);
                    if (catError) console.error("Error linking categories:", catError);
                }
            }

            console.log("Task saved successfully!");
            onSuccess();
            onClose();
            if (!taskToEdit) resetForm();

        } catch (err: any) {
            console.error('CRITICAL Error saving task:', err);
            setError(`Error saving task: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
            <div className="bg-[#FEF7FF] rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] md:max-h-[85vh]">
                <div className="px-6 py-4 flex justify-between items-center shrink-0">
                    <h3 className="text-2xl font-normal text-[#1D1B20]">
                        {taskToEdit ? 'Edit task' : 'New task'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E6E0E9] transition-colors text-[#49454F]">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mx-6 mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form id="task-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="peer w-full px-4 pt-6 pb-2 bg-[#Ece6f0] border-b-2 border-[#79747E] rounded-t-lg text-[#1D1B20] placeholder-transparent focus:outline-none focus:border-[#6750A4] transition-all"
                            placeholder="Title"
                            id="task-title"
                        />
                        <label htmlFor="task-title" className="absolute left-4 top-2 text-xs text-[#6750A4] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#49454F] peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#6750A4]">
                            Task Title
                        </label>
                    </div>

                    <div className="relative">
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="peer w-full px-4 pt-6 pb-2 bg-[#Ece6f0] border-b-2 border-[#79747E] rounded-t-lg text-[#1D1B20] placeholder-transparent focus:outline-none focus:border-[#6750A4] transition-all resize-none"
                            placeholder="Description"
                            id="task-desc"
                        />
                        <label htmlFor="task-desc" className="absolute left-4 top-2 text-xs text-[#6750A4] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#49454F] peer-placeholder-shown:top-4 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#6750A4]">
                            Description
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-[#49454F] mb-1 ml-1">Status</label>
                            <div className="relative">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    className="w-full pl-3 pr-8 py-3 bg-[#F3EDF7] border border-[#79747E] rounded-lg text-[#1D1B20] focus:outline-none focus:ring-2 focus:ring-[#6750A4] appearance-none"
                                >
                                    <option value="pending">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Done</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <CheckCircle2 className="w-4 h-4 text-[#49454F]" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-[#49454F] mb-1 ml-1">Priority</label>
                            <div className="relative">
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                    className="w-full pl-3 pr-8 py-3 bg-[#F3EDF7] border border-[#79747E] rounded-lg text-[#1D1B20] focus:outline-none focus:ring-2 focus:ring-[#6750A4] appearance-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <Flag className="w-4 h-4 text-[#49454F]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[#49454F] mb-1 ml-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F3EDF7] border border-[#79747E] rounded-lg text-[#1D1B20] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>

                    {/* Categories Section */}
                    <div className="bg-[#F3EDF7] p-4 rounded-xl">
                        <label className="block text-sm font-medium text-[#49454F] mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">Categories</span>
                            <button
                                type="button"
                                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                className="text-xs text-[#6750A4] font-bold uppercase tracking-wide flex items-center gap-1 hover:bg-[#E8DEF8] px-2 py-1 rounded"
                            >
                                <Plus className="w-3 h-3" /> New
                            </button>
                        </label>

                        {isCreatingCategory && (
                            <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#79747E] rounded-lg focus:outline-none focus:border-[#6750A4]"
                                    placeholder="Category Name"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    className="px-4 py-2 bg-[#6750A4] text-white text-xs font-bold rounded-lg hover:bg-[#6750A4]/90 transition-colors"
                                >
                                    ADD
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => toggleCategory(cat.id)}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-sm font-medium border transition-all cursor-pointer select-none",
                                        selectedCategoryIds.includes(cat.id)
                                            ? "bg-[#E8DEF8] text-[#1D192B] border-[#E8DEF8]"
                                            : "bg-transparent text-[#49454F] border-[#79747E]"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="flex justify-end gap-2 px-6 py-4 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#6750A4] hover:bg-[#E8DEF8]/50 rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="task-form"
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-[#6750A4] hover:bg-[#6750A4]/90 rounded-full shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
