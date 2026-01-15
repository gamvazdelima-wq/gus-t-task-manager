import { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List as ListIcon, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Task, TaskStatus } from '../types';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';

export default function Dashboard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

    useEffect(() => {
        fetchTasks();
    }, [user]);

    async function fetchTasks() {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching tasks:', error);
            } else {
                setTasks(data as Task[]);
            }
        } finally {
            setLoading(false);
        }
    }

    const handleCreateNew = () => {
        setTaskToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsModalOpen(true);
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">My Tasks</h2>
                    <p className="text-slate-500 mt-1">Manage your goals and priorities</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm shadow-sm"
                            placeholder="Search tasks..."
                        />
                    </div>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-slate-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                            className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Done</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>

                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            title="List View"
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95 ml-auto md:ml-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>New Task</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        {searchQuery ? <Search className="w-8 h-8 text-slate-300" /> : <ListIcon className="w-8 h-8 text-slate-300" />}
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">
                        {searchQuery ? 'No tasks found' : 'No tasks yet'}
                    </h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        {searchQuery ? `No matches for "${searchQuery}"` : 'Get started by creating your first task to stay organized.'}
                    </p>
                    {!searchQuery && (
                        <button
                            onClick={handleCreateNew}
                            className="mt-6 text-indigo-600 font-semibold hover:text-indigo-700"
                        >
                            Create Task
                        </button>
                    )}
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                    ))}
                </div>
            )}

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTasks}
                taskToEdit={taskToEdit}
            />
        </div>
    );
}
