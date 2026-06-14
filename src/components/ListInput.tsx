"use client";

import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";

interface ListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  emptyLabel?: string;
}

export default function ListInput({
  items,
  onChange,
  placeholder = "Ketik item...",
  addLabel = "Tambah",
  emptyLabel = "Belum ada item",
}: ListInputProps) {
  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {items.length} item
        </span>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg py-6 text-center">
          <span className="text-sm text-slate-400">{emptyLabel}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-100 group"
            >
              <div className="flex flex-col gap-0.5 shrink-0">
                <span className="text-xs font-medium text-slate-400 text-center w-5">
                  {index + 1}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="w-5 h-4 bg-white rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                  >
                    <ChevronUp className="w-3 h-3 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="w-5 h-4 bg-white rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 border border-slate-200"
                  >
                    <ChevronDown className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item}
                onChange={(e) => handleUpdate(index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
