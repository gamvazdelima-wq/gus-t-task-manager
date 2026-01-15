import { useState, useEffect } from 'react';
import { X, Calendar, Flag, AlignLeft, Type, CheckCircle2, Tag as TagIcon, Plus } from 'lucide-react';
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
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
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
        if (!newCategoryName.trim() || !user) return;
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: newCategoryName.trim(), user_id: user.id }])
            .select()
            .single();

        if (!error && data) {
            setCategories([...categories, data as Category]);
            setSelectedCategoryIds([...selectedCategoryIds, data.id]);
            setNewCategoryName('');
            setIsCreatingCategory(false);
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
        if (!user) return;
        setLoading(true);

        try {
            const taskData = {
                title,
                description: description || null,
                status,
                priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                user_id: user.id,
            };

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
                taskId = data.id;
            }

            if (taskId) {
                // Handle Categories link
                // First delete existing (easiest for full sync) if editing
                if (taskToEdit) {
                    await supabase.from('task_categories').delete().eq('task_id', taskId);
                }

                // Insert new
                if (selectedCategoryIds.length > 0) {
                    const categoryInserts = selectedCategoryIds.map(categoryId => ({
                        task_id: taskId,
                        category_id: categoryId,
                        user_id: user.id
                    }));
                    await supabase.from('task_categories').insert(categoryInserts);
                }
            }

            onSuccess();
            onClose();
            if (!taskToEdit) resetForm();
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Failed to save task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all text-left">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800">
                        {taskToEdit ? 'Edit Task' : 'New Task'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                            <Type className="w-4 h-4 text-slate-400" /> Title
                        </label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                            <AlignLeft className="w-4 h-4 text-slate-400" /> Description
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-slate-400" /> Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            >
                                <option value="pending">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Done</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                                <Flag className="w-4 h-4 text-slate-400" /> Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" /> Due Date
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            style={{ colorScheme: 'light' }}
                        />
                    </div>

                    {/* Categories Section */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-2"><TagIcon className="w-4 h-4 text-slate-400" /> Categories</span>
                            <button
                                type="button"
                                onClick={() => setIsCreatingCategory(!isCreatingCategory)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> New Category
                            </button>
                        </label>

                        {isCreatingCategory && (
                            <div className="flex gap-2 mb-3 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Category Name"
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                                />
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Add
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
                                        "px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer select-none",
                                        selectedCategoryIds.includes(cat.id)
                                            ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                                    )}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            {categories.length === 0 && !isCreatingCategory && (
                                <span className="text-xs text-slate-400 italic">No categories yet. Create one!</span>
                            )}
                        </div>
                    </div>
                </form>

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
