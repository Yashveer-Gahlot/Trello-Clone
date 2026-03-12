import React, { useState, useEffect } from 'react';
import { X, AlignLeft, Type } from 'lucide-react';
import useBoardStore from '../../store/useBoardStore';

const CardModal = () => {
  const activeCard = useBoardStore((state) => state.activeCard);
  const closeModal = useBoardStore((state) => state.closeModal);
  const updateCard = useBoardStore((state) => state.updateCard);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when activeCard changes
  useEffect(() => {
    if (activeCard) {
      setTitle(activeCard.title || '');
      setDescription(activeCard.description || '');
    }
  }, [activeCard]);

  if (!activeCard) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateCard(activeCard.id, { title: title.trim(), description: description.trim() });
      closeModal();
    } catch (err) {
      console.error('Failed to save card:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex justify-center items-start pt-20"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 w-full max-w-2xl rounded-xl p-6 text-white shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title Input */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Type size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Title</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-lg font-semibold text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter card title..."
          />
        </div>

        {/* Description Textarea */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <AlignLeft size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Description</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Add a more detailed description..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
