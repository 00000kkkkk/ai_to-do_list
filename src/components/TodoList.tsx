'use client';

import { useState } from 'react';
import { TodoList as TodoListType } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todoList: TodoListType;
  isExpanded: boolean;
  onToggleExpansion: () => void;
  onListInteraction: () => void;
  onToggleTodo: (listId: string, todoId: string) => void;
  onDeleteTodo: (listId: string, todoId: string) => void;
  onUpdateTodo: (listId: string, todoId: string, text: string) => void;
  onAddTodo: (listId: string, text: string) => void;
  onGenerateTodo: (listId: string, prompt: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateListName: (listId: string, name: string) => void;
  loading: boolean;
}

export function TodoList({
  todoList,
  isExpanded,
  onToggleExpansion,
  onListInteraction,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodo,
  onAddTodo,
  onGenerateTodo,
  onDeleteList,
  onUpdateListName,
  loading
}: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(todoList.name);
  const [showAiInput, setShowAiInput] = useState(false);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(todoList.id, newTodoText.trim());
      setNewTodoText('');
      onListInteraction();
    }
  };

  const handleGenerateTodos = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      onGenerateTodo(todoList.id, aiPrompt.trim());
      setAiPrompt('');
      setShowAiInput(false);
      onListInteraction();
    }
  };

  const handleUpdateListName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim() && editingName !== todoList.name) {
      onUpdateListName(todoList.id, editingName.trim());
    }
    setIsEditingName(false);
    onListInteraction();
  };

  const completedCount = todoList.todos.filter(todo => todo.completed).length;
  const totalCount = todoList.todos.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`expandable-list ${isExpanded ? 'expanded' : ''} ${
      isExpanded 
        ? 'md:col-span-2 xl:col-span-3 transform scale-105' 
        : ''
    }`}>
      <div 
        className="todo-card p-8 h-full flex flex-col"
        onClick={!isExpanded ? onToggleExpansion : undefined}
      >
        <div className="flex items-center justify-between mb-6">
          {isEditingName ? (
            <form onSubmit={handleUpdateListName} className="flex-1 flex gap-3">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="morphing-input flex-1 text-xl font-bold text-neutral-800"
                autoFocus
                onClick={onListInteraction}
              />
              <button 
                type="submit"
                className="floating-button px-4 py-2 text-sm"
              >
                Зберегти
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingName(todoList.name);
                  setIsEditingName(false);
                }}
                className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-all duration-200"
              >
                Скасувати
              </button>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpansion();
                  }}
                  className={`expand-button p-2 text-neutral-400 hover:bg-primary-50 hover:text-primary-600 rounded-lg group ${
                    isExpanded ? 'expanded' : ''
                  }`}
                  title={isExpanded ? "Згорнути список" : "Розгорнути список"}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isExpanded ? 'rotate-90' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <h2 
                  className="text-2xl font-bold text-neutral-800 cursor-pointer hover:text-primary-600 transition-colors duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                    onListInteraction();
                  }}
                  title="Клікніть для редагування"
                >
                  {todoList.name}
                </h2>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteList(todoList.id);
                }}
                className="p-3 text-neutral-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300 group"
                title="Видалити список"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>

{!isExpanded && totalCount > 0 && (
        <div className="mb-4 text-center">
          <div className="compact-progress inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full border border-primary-100">
            <span className="text-sm text-neutral-600">{completedCount}/{totalCount}</span>
            <div className="w-16 h-2 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {isExpanded && totalCount > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl border border-primary-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-neutral-700">
              Прогрес виконання
            </span>
            <span className="text-sm text-neutral-600 bg-white px-3 py-1 rounded-full">
              {completedCount} з {totalCount}
            </span>
          </div>
          
          <div className="relative w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="text-xs text-neutral-600 mt-3 text-center">
            {progressPercentage === 100 ? (
              <span className="text-accent-600 font-semibold">Всі завдання виконано! 🎉</span>
            ) : (
              `${Math.round(progressPercentage)}% завершено`
            )}
          </div>
        </div>
      )}

{isExpanded ? (
        <div className="flex-1 space-y-4 mb-8">
          {todoList.todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-4 floating">
                <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-neutral-500 mb-1 font-medium">Поки що немає завдань</p>
              <p className="text-sm text-neutral-400">Додайте перше завдання нижче</p>
            </div>
          ) : (
            todoList.todos.map((todo, index) => (
              <div key={todo.id} className="slide-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <TodoItem
                  todo={todo}
                  onToggle={(todoId) => onToggleTodo(todoList.id, todoId)}
                  onDelete={(todoId) => onDeleteTodo(todoList.id, todoId)}
                  onUpdate={(todoId, text) => onUpdateTodo(todoList.id, todoId, text)}
                />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 mb-4">
          {todoList.todos.length > 0 && (
            <div className="space-y-2">
              {todoList.todos.slice(0, 3).map((todo, index) => (
                <div 
                  key={todo.id} 
                  className="preview-todo flex items-center gap-3 p-2 bg-neutral-50 rounded-lg cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onListInteraction();
                  }}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    todo.completed ? 'bg-accent-500 shadow-sm' : 'bg-neutral-300'
                  }`}></div>
                  <span className={`text-sm truncate transition-all duration-300 ${
                    todo.completed ? 'line-through text-neutral-500' : 'text-neutral-700'
                  }`}>
                    {todo.text}
                  </span>
                </div>
              ))}
              {todoList.todos.length > 3 && (
                <div 
                  className="text-center py-2 cursor-pointer hover:bg-neutral-50 rounded-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onListInteraction();
                  }}
                >
                  <span className="text-xs text-neutral-500 hover:text-neutral-700">
                    +{todoList.todos.length - 3} ще завдань...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 pt-6 border-t border-neutral-200">
          <form onSubmit={handleAddTodo} className="flex gap-3">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Додати нове завдання..."
              className="morphing-input flex-1 text-neutral-800 placeholder-neutral-400"
            />
            <button 
              type="submit" 
              className="floating-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!newTodoText.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </form>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAiInput(!showAiInput)}
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-accent-100 to-accent-200 text-accent-700 font-medium rounded-xl hover:from-accent-200 hover:to-accent-300 transition-all duration-300 flex items-center justify-center gap-2 group ${showAiInput ? 'ring-2 ring-accent-300' : ''}`}
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI генератор
            </button>
          </div>

          {showAiInput && (
            <div className="fade-in">
              <form onSubmit={handleGenerateTodos} className="flex gap-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Опишіть, які завдання потрібні..."
                  className="morphing-input flex-1 text-neutral-800 placeholder-neutral-400"
                />
                <button 
                  type="submit"
                  className="floating-button px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={!aiPrompt.trim() || loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
} 