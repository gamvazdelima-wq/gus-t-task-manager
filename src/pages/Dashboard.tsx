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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h2 className="text-4xl font-normal text-[#1D1B20] tracking-tight">Tasks</h2>
                    <p className="text-[#49454F] mt-1 text-lg">Manage your goals</p>
                </div>

                {/* Material Search Bar */}
                <div className="flex-1 w-full md:max-w-md mx-auto md:mx-6">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#49454F]" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-4 py-3 bg-[#Ece6f0] border-none rounded-full text-[#1D1B20] placeholder-[#49454F] focus:outline-none focus:ring-2 focus:ring-[#6750A4] focus:bg-[#E6E0E9] transition-all shadow-sm hover:shadow-md"
                            placeholder="Search tasks"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                    {/* Filter Chip */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                            className="appearance-none bg-transparent pl-3 pr-8 py-2 text-sm font-medium text-[#49454F] border border-[#79747E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6750A4] cursor-pointer hover:bg-[#E6E0E9]/50 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Done</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#49454F] pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-[#Ece6f0] p-1 rounded-full border border-[#CAC4D0]">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#E8DEF8] text-[#1D192B] shadow-sm' : 'text-[#49454F] hover:bg-[#E6E0E9]'}`}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-[#E8DEF8] text-[#1D192B] shadow-sm' : 'text-[#49454F] hover:bg-[#E6E0E9]'}`}
                            title="List View"
                        >
                            <ListIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-[#Ece6f0] rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="bg-[#E8DEF8] w-24 h-24 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                        {searchQuery ? <Search className="w-10 h-10 text-[#6750A4]" /> : <ListIcon className="w-10 h-10 text-[#6750A4]" />}
                    </div>
                    <h3 className="text-2xl font-normal text-[#1D1B20]">
                        {searchQuery ? 'No matching tasks' : 'You are all caught up'}
                    </h3>
                    <p className="text-[#49454F] max-w-sm mx-auto mt-2 text-lg">
                        {searchQuery ? `Couldn't find anything for "${searchQuery}"` : 'Create a task to get started.'}
                    </p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredTasks.map(task => (
                        <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                    ))}
                </div>
            )}

            {/* Extended FAB for Create Task */}
            <button
                onClick={handleCreateNew}
                className="fixed bottom-8 right-8 flex items-center gap-3 bg-[#E8DEF8] hover:bg-[#D0BCFF] text-[#1D192B] pl-4 pr-6 py-4 rounded-[16px] shadow-lg hover:shadow-xl transition-all active:scale-95 duration-200 z-40 group border border-[#CAC4D0]/30"
            >
                <Plus className="w-6 h-6" />
                <span className="font-medium text-base">New Task</span>
            </button>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTasks}
                taskToEdit={taskToEdit}
            />
        </div>
    );
}
