import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronRight, 
  AlertCircle,
  FileText,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { firebaseService } from '../services/firebaseService';
import { Task, Order, User as StaffUser } from '../types';

interface TasksViewProps {
  currentUser: any;
  orders: Order[];
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type ViewMode = 'board' | 'list';

export function TasksView({ currentUser, orders, showNotification }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  
  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  
  // Create Task form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    order_id: '',
    assigned_to: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const tenantInfo = firebaseService.getTenantInfo();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedTasks, fetchedStaff] = await Promise.all([
        firebaseService.getTasks(),
        firebaseService.getUsers()
      ]);
      setTasks(fetchedTasks);
      setStaff(fetchedStaff);
    } catch (err) {
      console.error("Error loading task data:", err);
      showNotification("Failed to load production tasks.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      showNotification("Task title is required.", "error");
      return;
    }

    try {
      const selectedStaff = staff.find(s => s.id === newTask.assigned_to);
      const selectedOrder = orders.find(o => o.id === newTask.order_id);

      const taskToSave: Omit<Task, 'id' | 'created_at'> = {
        title: newTask.title,
        description: newTask.description,
        order_id: newTask.order_id || undefined,
        order_number: selectedOrder ? (selectedOrder.job_order_id || selectedOrder.id.substring(0, 8)) : undefined,
        assigned_to: newTask.assigned_to || undefined,
        assigned_name: selectedStaff ? selectedStaff.full_name : undefined,
        due_date: newTask.due_date || undefined,
        priority: newTask.priority,
        status: 'pending',
        created_by: currentUser.id || currentUser.staff_id || 'system',
        created_by_name: currentUser.full_name || currentUser.username
      };

      await firebaseService.createTask(taskToSave);
      showNotification("Task created successfully!", "success");
      setIsCreateModalOpen(false);
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        order_id: '',
        assigned_to: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium'
      });
      
      loadData();
    } catch (err: any) {
      console.error("Create task error:", err);
      showNotification(err.message || "Failed to create task.", "error");
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await firebaseService.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      showNotification(`Task status updated to ${newStatus.replace('_', ' ')}`, "success");
    } catch (err) {
      console.error("Update task status error:", err);
      showNotification("Failed to update status.", "error");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await firebaseService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      showNotification("Task deleted successfully.", "success");
    } catch (err) {
      console.error("Delete task error:", err);
      showNotification("Failed to delete task.", "error");
    }
  };

  // Filter tasks based on selections
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.order_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesStaff = staffFilter === 'all' || task.assigned_to === staffFilter;

    return matchesSearch && matchesPriority && matchesStaff;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'medium': return 'bg-amber-50 border-amber-100 text-amber-700';
      default: return 'bg-sky-50 border-sky-100 text-sky-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-indigo-500 animate-spin-slow" />;
      case 'cancelled': return <X className="w-5 h-5 text-slate-400" />;
      default: return <AlertCircle className="w-5 h-5 text-amber-500 animate-pulse" />;
    }
  };

  const columns: { id: Task['status']; label: string; color: string }[] = [
    { id: 'pending', label: 'Queued / Pending', color: 'border-t-amber-400 bg-amber-50/10' },
    { id: 'in_progress', label: 'In Production', color: 'border-t-indigo-500 bg-indigo-50/10' },
    { id: 'completed', label: 'Completed', color: 'border-t-emerald-500 bg-emerald-50/10' },
    { id: 'cancelled', label: 'On Hold / Cancelled', color: 'border-t-slate-400 bg-slate-50/10' }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Title & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
              {tenantInfo.name || 'Junub Printing'} ERP
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Production Tasks
          </h1>
          <p className="text-xs text-slate-500 font-medium">Assign, track, and manage job card execution tasks for design & printing staff.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-100">
            <button 
              onClick={() => setViewMode('board')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Kanban Board
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Detailed List
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search title, details, order..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">⚡ All Priorities</option>
            <option value="high">🔴 High Priority</option>
            <option value="medium">🟡 Medium Priority</option>
            <option value="low">🟢 Low Priority</option>
          </select>
        </div>

        <div>
          <select
            value={staffFilter}
            onChange={e => setStaffFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">👤 All Assignees</option>
            {staff.map(s => (
              <option key={s.id} value={s.id}>👤 {s.full_name} ({s.role})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end">
          <button 
            onClick={loadData}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            Refresh List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></span>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading task workflow...</p>
          </div>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`rounded-3xl border border-slate-100 shadow-sm p-4 ${col.color} border-t-4 flex flex-col min-h-[500px]`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{col.label}</span>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-600">{colTasks.length}</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-slate-200/50 rounded-2xl flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">No active tasks</p>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <motion.div
                        key={task.id}
                        layoutId={`task-${task.id}`}
                        className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative group"
                      >
                        {/* Priority Badge */}
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-1 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-xs font-black text-slate-800 leading-snug mb-1">{task.title}</h4>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 font-medium mb-3 line-clamp-2">{task.description}</p>
                        )}

                        <div className="border-t border-slate-50 pt-3 space-y-2 text-[10px] text-slate-500 font-bold">
                          {task.order_number && (
                            <div className="flex items-center gap-1.5 text-indigo-600">
                              <FileText className="w-3.5 h-3.5" />
                              Order ID: {task.order_number}
                            </div>
                          )}

                          {task.assigned_name && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <User className="w-3.5 h-3.5" />
                              Assignee: {task.assigned_name}
                            </div>
                          )}

                          {task.due_date && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Calendar className="w-3.5 h-3.5" />
                              Due: {task.due_date}
                            </div>
                          )}
                        </div>

                        {/* Action buttons to advance status */}
                        <div className="mt-4 pt-3 border-t border-slate-50 flex gap-2">
                          {task.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'pending')}
                              className="flex-1 py-1 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Queue
                            </button>
                          )}
                          {task.status !== 'in_progress' && task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                              className="flex-1 py-1 px-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Work
                            </button>
                          )}
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              className="flex-1 py-1 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded-lg transition-colors"
                            >
                              Done
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List View */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Task Title & Details</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Order</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Assigned To</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Due Date</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 uppercase tracking-widest text-xs font-black">
                      No production tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map(task => (
                    <tr key={task.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(task.status)}
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs font-black text-slate-800">{task.title}</p>
                        {task.description && (
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{task.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        {task.order_number ? (
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            {task.order_number}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 border rounded-full text-[10px] font-black uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                            {task.assigned_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{task.assigned_name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-500">
                        {task.due_date || 'No Date'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={task.status}
                            onChange={(e) => handleUpdateStatus(task.id, e.target.value as any)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-600 focus:outline-none"
                          >
                            <option value="pending">Queued</option>
                            <option value="in_progress">Work</option>
                            <option value="completed">Done</option>
                            <option value="cancelled">On Hold</option>
                          </select>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Create Production Task</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Task Title / Operation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design roll-up banner layout"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none rounded-2xl text-xs font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Detailed description (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed print specifications, layout, dimensions, color preferences..."
                    value={newTask.description}
                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none rounded-2xl text-xs font-medium transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Link to Job / Order (optional)</label>
                  <select
                    value={newTask.order_id}
                    onChange={e => setNewTask({...newTask, order_id: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">None / Internal Task</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>
                        📦 Order #{o.job_order_id || o.id.substring(0,8)} - {o.customer_name || 'Walk-in'} ({o.description?.substring(0, 30)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assign to Staff Member</label>
                  <select
                    value={newTask.assigned_to}
                    onChange={e => setNewTask({...newTask, assigned_to: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Assign Later / Pool</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        👤 {s.full_name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-100 cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
