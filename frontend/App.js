import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, RefreshCw } from 'lucide-react';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const tempId = Date.now();
    const optimisticTodo = {
      id: tempId,
      title: newTodo,
      completed: false,
      created_at: new Date().toISOString(),
    };

    setTodos([optimisticTodo, ...todos]);
    setNewTodo('');

    try {
      const res = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTodo })
      });
      const savedTodo = await res.json();
      setTodos([savedTodo, ...todos.filter(t => t.id !== tempId)]);
    } catch (error) {
      setTodos(todos);
      alert('Failed to add todo. Please try again.');
    }
  };

  const toggleTodo = async (id, completed) => {
    setTodos(todos.map(t => 
      t.id === id ? { ...t, completed: !completed } : t
    ));

    try {
      await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
    } catch (error) {
      setTodos(todos);
      alert('Failed to update todo.');
    }
  };

  const deleteTodo = async (id) => {
    setTodos(todos.filter(t => t.id !== id));
    try {
      await fetch(`http://localhost:5000/api/todos/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      fetchTodos();
      alert('Failed to delete todo.');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            ✨ Todo Master
          </h1>
          <p className="text-gray-500 mb-6">Distributed System Edition</p>

          <form onSubmit={addTodo} className="flex gap-3 mb-8">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Plus size={20} />
              Add
            </button>
          </form>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'active' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
            <button
              onClick={fetchTodos}
              className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Sync
            </button>
          </div>

          <div className="space-y-3">
            {loading && todos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Loading todos...</div>
            ) : filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {filter === 'all' ? 'No todos yet. Add one above!' : `No ${filter} todos`}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`group flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition hover:shadow-md ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                      todo.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-indigo-500'
                    }`}
                  >
                    {todo.completed && <Check size={14} />}
                  </button>
                  <span
                    className={`flex-1 text-lg ${
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {todo.created_at ? new Date(todo.created_at).toLocaleDateString() : ''}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between text-sm text-gray-500">
            <span>{todos.filter(t => !t.completed).length} active</span>
            <span>{todos.filter(t => t.completed).length} completed</span>
            <span>{todos.length} total</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;