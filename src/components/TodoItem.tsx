'use client';

import { useState, useRef, useEffect } from 'react';
import { Todo } from '../types/todo';
import { SwipeService } from '../services/SwipeService';
import { ModalService } from '../services/ModalService';

interface TodoItemProps {
  todo: Todo;
  onToggle: (todoId: string) => void;
  onDelete: (todoId: string) => void;
  onUpdate: (todoId: string, text: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const swipeServiceRef = useRef<SwipeService | null>(null);
  const modalService = ModalService.getInstance();

  useEffect(() => {
    if (!containerRef.current || window.innerWidth > 768) return;

    if (!swipeServiceRef.current) {
      swipeServiceRef.current = SwipeService.create();
    }

    swipeServiceRef.current.attach(containerRef.current, {
      onSwipeLeft: async () => {
        const confirmed = await modalService.confirm({
          title: 'Видалити завдання?',
          message: `Ви впевнені, що хочете видалити завдання "${todo.text}"?`,
          confirmText: 'Видалити',
          cancelText: 'Скасувати'
        });
        
        if (confirmed) {
          onDelete(todo.id);
        }
        setSwipeProgress(0);
        setSwipeDirection(null);
      },
      onMove: (progress: number, direction: string) => {
        if (direction === 'left') {
          setSwipeProgress(progress);
          setSwipeDirection('left');
        } else {
          setSwipeProgress(0);
          setSwipeDirection(null);
        }
      },
      onEnd: () => {
        setSwipeProgress(0);
        setSwipeDirection(null);
      }
    }, {
      threshold: 80,
      allowedTime: 1000,
      restraint: 80
    });

    return () => {
      if (swipeServiceRef.current) {
        swipeServiceRef.current.detach();
        swipeServiceRef.current = null;
      }
    };
  }, [todo.id, todo.text, onDelete, modalService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim() && editText !== todo.text) {
      onUpdate(todo.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`todo-item-container relative overflow-hidden ${
        swipeDirection === 'left' ? 'swipe-active' : ''
      }`}
      style={{ touchAction: 'pan-y' }}
    >
      {swipeDirection === 'left' && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-center bg-red-500 text-white px-4 sm:px-6 transition-all duration-300"
          style={{
            width: `${swipeProgress * 100}px`,
            opacity: swipeProgress
          }}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      )}
      
      <div className={`group relative p-3 sm:p-4 bg-neutral-50 dark:bg-neutral-100 rounded-lg sm:rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
        todo.completed 
          ? 'border-accent-200 bg-gradient-to-r from-accent-50 to-neutral-50 dark:from-accent-100 dark:to-neutral-100' 
          : 'border-neutral-200 dark:border-neutral-300 hover:border-primary-300 dark:hover:border-primary-400'
      }`}
      style={{
        transform: swipeDirection === 'left' ? `translateX(-${swipeProgress * 100}px)` : 'translateX(0)',
        transition: swipeProgress > 0 ? 'none' : 'transform 0.3s'
      }}
      >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          onClick={() => onToggle(todo.id)}
          className="mt-0.5 sm:mt-1 flex-shrink-0 group/checkbox"
        >
          <div className={`w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-md sm:rounded-lg flex items-center justify-center transition-all duration-300 ${
            todo.completed 
              ? 'bg-gradient-to-br from-accent-500 to-accent-600 border-accent-500 scale-110' 
              : 'border-neutral-300 hover:border-primary-400 hover:bg-primary-50 group-hover/checkbox:scale-105'
          }`}>
            {todo.completed && (
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="morphing-input flex-1 text-sm sm:text-base text-neutral-800 dark:text-neutral-700"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="floating-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
              >
                Зберегти
              </button>
              <button 
                type="button" 
                onClick={handleCancel} 
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-neutral-100 dark:bg-neutral-200 text-neutral-700 dark:text-neutral-600 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-300 transition-all duration-200"
              >
                Скасувати
              </button>
            </div>
          </form>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1 min-w-0">
                <p 
                  className={`text-sm sm:text-base cursor-pointer transition-all duration-300 break-words ${
                    todo.completed 
                      ? 'line-through text-neutral-500 dark:text-neutral-400 opacity-75' 
                      : 'text-neutral-800 dark:text-neutral-700 hover:text-primary-600 dark:hover:text-primary-500 font-medium'
                  }`}
                  onClick={() => setIsEditing(true)}
                >
                  {todo.text}
                </p>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs">Створено: {new Date(todo.createdAt).toLocaleDateString('uk-UA')}</span>
                  </div>
                  {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
                    <>
                      <span className="hidden sm:block w-1 h-1 bg-neutral-300 rounded-full"></span>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-xs">Оновлено: {new Date(todo.updatedAt).toLocaleDateString('uk-UA')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex gap-1 sm:gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:bg-primary-50 dark:hover:bg-primary-100 hover:text-primary-600 dark:hover:text-primary-500 rounded-md sm:rounded-lg transition-all duration-200 group/edit"
                  title="Редагувати"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/edit:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="p-1.5 sm:p-2 text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-100 hover:text-red-500 dark:hover:text-red-400 rounded-md sm:rounded-lg transition-all duration-200 group/delete"
                  title="Видалити"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/delete:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
} 