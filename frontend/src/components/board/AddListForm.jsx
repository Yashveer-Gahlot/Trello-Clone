import React, { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

const AddListForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);
  const board = useBoardStore((state) => state.board);
  const addList = useBoardStore((state) => state.addList);

  // Auto-focus the input when editing mode is activated
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !board?.id) return;

    try {
      await addList(title.trim(), board.id);
      setTitle('');
      // Keep editing mode open so user can add multiple lists quickly
    } catch (err) {
      console.error('Failed to add list:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTitle('');
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-72 flex-shrink-0 bg-white/20 hover:bg-white/30 text-white rounded-xl p-3 flex items-center gap-2 font-medium transition-colors cursor-pointer"
      >
        <Plus size={18} />
        Add another list
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-72 flex-shrink-0 bg-gray-900/80 rounded-xl p-2 shadow-lg"
    >
      <input
        ref={inputRef}
        type="text"
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
        className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Add list
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </form>
  );
};

export default AddListForm;
