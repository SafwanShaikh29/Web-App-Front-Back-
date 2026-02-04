import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = ({ setAuth }) => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");

  // Fetch User & Tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/me');
        setUser(userRes.data);
        fetchTasks();
      } catch (err) {
        console.error(err);
        logout();
      }
    };
    fetchData();
  }, []);

  const fetchTasks = async (query = "") => {
    try {
      const res = await api.get(`/tasks?search=${query}`);
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchTasks(e.target.value);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await api.post('/tasks', { title: newTask });
      setTasks([res.data, ...tasks]);
      setNewTask("");
      toast.success("Task added");
    } catch (err) {
      toast.error("Error adding task");
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Error deleting task");
    }
  };

  const toggleTask = async (task) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { isCompleted: !task.isCompleted });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      toast.error("Error updating task");
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">TaskManager</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}</span>
          <button onClick={logout} className="text-red-500 hover:text-red-700 font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-10 p-6">
        {/* Create & Search */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <input 
              type="text" 
              className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add</button>
          </form>
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full border p-2 rounded bg-gray-50"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? <p className="text-center text-gray-500">No tasks found.</p> : null}
          {tasks.map(task => (
            <div key={task._id} className="bg-white p-4 rounded shadow flex justify-between items-center transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={task.isCompleted} 
                  onChange={() => toggleTask(task)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className={`${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </span>
              </div>
              <button onClick={() => deleteTask(task._id)} className="text-gray-400 hover:text-red-500">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;