import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X, CheckCircle2 } from "lucide-react";

interface Task {
  task_id: number;
  topic: string;
  description: string;
  created_at?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: { topic: string; description: string };
  setFormData: React.Dispatch<
    React.SetStateAction<{ topic: string; description: string }>
  >;
  editingTask: Task | null;
  isLoading: boolean;
  error: string;
}

// Task Modal Component
const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editingTask,
  isLoading,
  error,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        data-cy="task-modal"
        className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <button
              data-cy="close-btn"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div
              data-cy="error-message"
              className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                data-cy="topic-input"
                type="text"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Enter task topic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                data-cy="description-input"
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                placeholder="Enter task description"
                rows={4}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                data-cy="submit-btn"
                onClick={onSubmit}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {isLoading
                  ? "Saving..."
                  : editingTask
                  ? "Update Task"
                  : "Create Task"}
              </button>
              <button
                data-cy="cancel-btn"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

// Task Card Component
const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  return (
    <div
      data-cy="task-card"
      className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-white/20 hover:scale-105"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {task.topic}
        </h3>
        <div className="flex gap-2 ml-2">
          <button
            data-cy="edit-btn"
            onClick={() => onEdit(task)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            data-cy="delete-btn"
            onClick={() => onDelete(task.task_id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-3">{task.description}</p>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          ID: {task.task_id}
        </span>
      </div>
    </div>
  );
};

interface TaskDisplayPanelProps {
  tasks: Task[];
  isLoading: boolean;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

// Task Display Panel Component
const TaskDisplayPanel: React.FC<TaskDisplayPanelProps> = ({
  tasks,
  isLoading,
  onEditTask,
  onDeleteTask,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Your Tasks</h2>
        <p className="text-white/80">
          {tasks.length > 0
            ? `You have ${tasks.length} task${
                tasks.length !== 1 ? "s" : ""
              } to manage`
            : "No tasks yet - time to get organized!"}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.length === 0 ? (
          <div
            data-cy="empty-state"
            className="col-span-full text-center py-16"
          >
            <CheckCircle2 size={80} className="mx-auto text-white/60 mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-3">
              All caught up!
            </h3>
            <p className="text-white/80 text-lg">
              Create your first task to get started on your productivity
              journey.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface AddTaskPanelProps {
  onOpenModal: () => void;
  tasksCount: number;
}

// Add Task Panel Component
const AddTaskPanel: React.FC<AddTaskPanelProps> = ({
  onOpenModal,
  tasksCount,
}) => {
  return (
    <div className="text-center mb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          Task Manager Pro
        </h1>
        <p className="text-white/90 text-xl">
          Streamline your workflow, boost your productivity
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-md mx-auto mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-2">{tasksCount}</div>
          <div className="text-white/80">Active Tasks</div>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        data-cy="create-task-btn"
        onClick={onOpenModal}
        className="bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto group"
      >
        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
          <Plus size={24} />
        </div>
        <span className="text-lg">Create New Task</span>
      </button>
    </div>
  );
};

// Main TodoApp Component
const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ topic: "", description: "" });

  const API_BASE = import.meta.env.VITE_API_URL;

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/get-all`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new task
  const createTask = async () => {
    try {
      if (!formData.topic.trim() || !formData.description.trim()) {
        setError("Topic and description are required");
        return;
      }

      setIsLoading(true);
      const response = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create task");

      await fetchTasks();
      setFormData({ topic: "", description: "" });
      setIsModalOpen(false);
      setError("");
    } catch (err) {
      setError("Failed to create task");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update a task
  const updateTask = async (taskId: number) => {
    try {
      if (!formData.topic.trim() || !formData.description.trim()) {
        setError("Topic and description are required");
        return;
      }

      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${taskId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update task");

      await fetchTasks();
      setEditingTask(null);
      setIsModalOpen(false);
      setFormData({ topic: "", description: "" });
      setError("");
    } catch (err) {
      setError("Failed to update task");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/${taskId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete task");

      await fetchTasks();
    } catch (err) {
      setError("Failed to delete task");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    if (editingTask) {
      updateTask(editingTask.task_id);
    } else {
      createTask();
    }
  };

  // Open modal for creating new task
  const openCreateModal = () => {
    setFormData({ topic: "", description: "" });
    setEditingTask(null);
    setIsModalOpen(true);
    setError("");
  };

  // Open modal for editing task
  const openEditModal = (task: Task) => {
    setFormData({ topic: task.topic, description: task.description });
    setEditingTask(task);
    setIsModalOpen(true);
    setError("");
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ topic: "", description: "" });
    setError("");
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        {/* Add Task Panel */}
        <AddTaskPanel onOpenModal={openCreateModal} tasksCount={tasks.length} />

        {/* Global Error Message */}
        {error && !isModalOpen && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <X size={20} />
              {error}
            </div>
          </div>
        )}

        {/* Task Display Panel */}
        <TaskDisplayPanel
          tasks={tasks}
          isLoading={isLoading}
          onEditTask={openEditModal}
          onDeleteTask={deleteTask}
        />

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          setFormData={setFormData}
          editingTask={editingTask}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
};

export default TodoApp;
