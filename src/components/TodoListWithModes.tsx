'use client';

import { TodoList as TodoListType } from '../types/todo';
import { ViewMode } from '../services/ViewModeService';
import { ModalService } from '../services/ModalService';
import { TodoItem } from './TodoItem';
import { useState, useEffect, useRef } from 'react';

interface TodoListWithModesProps {
  todoList: TodoListType;
  viewMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  onTransitionToLarge: () => void;
  onToggleTodo: (listId: string, todoId: string) => void;
  onDeleteTodo: (listId: string, todoId: string) => void;
  onUpdateTodo: (listId: string, todoId: string, text: string) => void;
  onAddTodo: (listId: string, text: string) => void;
  onGenerateTodo: (listId: string, prompt: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateListName: (listId: string, name: string) => void;
  loading: boolean;
}

export function TodoListWithModes({
  todoList,
  viewMode,
  onModeChange,
  onTransitionToLarge,
  onToggleTodo,
  onDeleteTodo,
  onUpdateTodo,
  onAddTodo,
  onGenerateTodo,
  onDeleteList,
  onUpdateListName,
  loading
}: TodoListWithModesProps) {
  const [newTodoText, setNewTodoText] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState(todoList.name);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const completedCount = todoList.todos.filter(todo => todo.completed).length;
  const totalCount = todoList.todos.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    if (viewMode !== ViewMode.COMPACT && containerRef.current) {
      containerRef.current.focus();
    }
  }, [viewMode]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(todoList.id, newTodoText.trim());
      setNewTodoText('');
    }
  };

  const handleGenerateTodos = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiPrompt.trim()) {
      onGenerateTodo(todoList.id, aiPrompt.trim());
      setAiPrompt('');
    }
  };

  const handleUpdateListName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingName.trim() && editingName !== todoList.name) {
      onUpdateListName(todoList.id, editingName.trim());
    }
    setIsEditingName(false);
  };

  const renderCompactView = () => (
    <div 
      className="todo-list-compact todo-card p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col"
      onClick={() => onModeChange(ViewMode.MEDIUM)}
    >
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-800 truncate pr-2">{todoList.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-neutral-500 whitespace-nowrap">{completedCount}/{totalCount}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onModeChange(ViewMode.MEDIUM);
            }}
            className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg transition-all group opacity-70 hover:opacity-100"
            title="Відкрити для додавання завдань"
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      {totalCount > 0 && (
        <div className="mb-3 md:mb-4">
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1 flex-1 overflow-hidden">
        {todoList.todos.slice(0, 3).map(todo => (
          <div key={todo.id} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${todo.completed ? 'bg-accent-500' : 'bg-neutral-300'}`} />
            <span className={`text-xs sm:text-sm truncate ${todo.completed ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>
              {todo.text}
            </span>
          </div>
        ))}
        {totalCount > 3 && (
          <span className="text-xs text-neutral-400">+{totalCount - 3} інші...</span>
        )}
        {totalCount === 0 && (
          <div className="text-center py-4">
            <p className="text-xs sm:text-sm text-neutral-400">Натисніть щоб додати завдання</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderMediumView = () => {
    return (
      <>
        <div className="todo-list-medium" ref={containerRef} tabIndex={-1}>
                      <div className={`todo-list-content ${isMobileDevice ? 'mobile-medium-content' : 'p-4 sm:p-5 md:p-6'}`}>
            <div className="flex items-center justify-between mb-4 p-4 pb-0">
              <button
                onClick={() => onModeChange(ViewMode.COMPACT)}
                className="close-overlay-button"
                title="Закрити (Esc)"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2">
                {!isMobileDevice && (
                  <button
                    onClick={onTransitionToLarge}
                    className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                    title="Розширити для редагування"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={async () => {
                    const modalService = ModalService.getInstance();
                    const confirmed = await modalService.confirm({
                      title: 'Видалити список?',
                      message: `Ви впевнені, що хочете видалити список "${todoList.name}"? Ця дія не може бути скасована.`,
                      confirmText: 'Видалити',
                      cancelText: 'Скасувати'
                    });
                    
                    if (confirmed) {
                      onModeChange(ViewMode.COMPACT);
                      setTimeout(() => {
                        onDeleteList(todoList.id);
                      }, 300);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Видалити список"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`${isMobileDevice ? 'mobile-medium-scrollable' : ''}`}>
              <div className="px-4">
                <div className="mb-4">
                  {isEditingName && isMobileDevice ? (
                    <form onSubmit={handleUpdateListName} className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="morphing-input text-xl font-bold"
                        autoFocus
                      />
                      <button type="submit" className="floating-button py-2 text-sm">
                        Зберегти
                      </button>
                    </form>
                  ) : (
                    <h2 
                      className={`text-xl sm:text-2xl font-bold text-neutral-800 mb-2 ${isMobileDevice ? 'cursor-pointer hover:text-primary-600' : ''}`}
                      onClick={isMobileDevice ? () => setIsEditingName(true) : undefined}
                    >
                      {todoList.name}
                    </h2>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-xs sm:text-sm text-neutral-600">
                      Виконано: {completedCount} з {totalCount}
                    </span>
                    {progressPercentage === 100 && (
                      <span className="text-xs sm:text-sm text-accent-600 font-semibold">✨ Всі завдання виконані!</span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-neutral-200 rounded-full h-2 sm:h-3 mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                <div className={`${isMobileDevice ? 'mobile-todo-items' : 'todo-items-container'}`}>
                  {todoList.todos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm sm:text-base text-neutral-500">Немає завдань</p>
                      {!isMobileDevice && (
                        <p className="text-xs sm:text-sm text-neutral-400 mt-2">Перейдіть в режим редагування щоб додати</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {todoList.todos.map(todo => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onToggle={(todoId) => onToggleTodo(todoList.id, todoId)}
                          onDelete={(todoId) => onDeleteTodo(todoList.id, todoId)}
                          onUpdate={(todoId, text) => onUpdateTodo(todoList.id, todoId, text)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {isMobileDevice && (
                  <>
                    <form onSubmit={handleAddTodo} className="flex flex-col gap-3 mt-4">
                      <input
                        type="text"
                        value={newTodoText}
                        onChange={(e) => setNewTodoText(e.target.value)}
                        placeholder="Додати нове завдання..."
                        className="morphing-input text-sm"
                      />
                      <button 
                        type="submit" 
                        className="floating-button py-2.5 text-sm"
                        disabled={!newTodoText.trim()}
                      >
                        Додати
                      </button>
                    </form>

                    <div className="mt-6 mb-4">
                      <h3 className="text-lg font-bold text-neutral-800 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        AI Асистент
                      </h3>
                      
                      <form onSubmit={handleGenerateTodos} className="space-y-3">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Опишіть завдання, які потрібно згенерувати..."
                          className="morphing-input w-full h-20 resize-none text-sm"
                        />
                        <button 
                          type="submit"
                          className="floating-button w-full py-2.5 text-sm"
                          disabled={!aiPrompt.trim() || loading}
                        >
                          {loading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Генерую...
                            </div>
                          ) : (
                            'Згенерувати завдання'
                          )}
                        </button>
                      </form>

                      <div className="mt-4 space-y-3">
                        <h4 className="text-xs font-semibold text-neutral-700">Швидкі дії:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setAiPrompt('Згенеруй список завдань на ранок')}
                            className="text-xs p-2 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors text-left"
                          >
                            🌅 Ранкові справи
                          </button>
                          <button
                            onClick={() => setAiPrompt('Створи робочі завдання на день')}
                            className="text-xs p-2 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors text-left"
                          >
                            💼 Робочі завдання
                          </button>
                          <button
                            onClick={() => setAiPrompt('Додай список покупок')}
                            className="text-xs p-2 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors text-left"
                          >
                            🛒 Список покупок
                          </button>
                          <button
                            onClick={() => setAiPrompt('Згенеруй план тренування')}
                            className="text-xs p-2 bg-neutral-50 rounded-lg hover:bg-primary-50 transition-colors text-left"
                          >
                            💪 Тренування
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </>
    );
  };

  const renderLargeView = () => (
    <div className="todo-list-large" ref={containerRef} tabIndex={-1}>
      <div className="todo-list-content-large p-4 sm:p-6 md:p-8">
        <button
          onClick={() => onModeChange(ViewMode.COMPACT)}
          className="close-overlay-button"
          title="Закрити (Esc)"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="todo-content-section">
          <div className="mb-4 md:mb-6">
            {isEditingName ? (
              <form onSubmit={handleUpdateListName} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="morphing-input flex-1 text-xl sm:text-2xl font-bold"
                  autoFocus
                />
                <button type="submit" className="floating-button px-4 py-2 text-sm">
                  Зберегти
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <h2 
                  className="text-2xl sm:text-3xl font-bold text-neutral-800 cursor-pointer hover:text-primary-600 transition-colors pr-4"
                  onClick={() => setIsEditingName(true)}
                >
                  {todoList.name}
                </h2>
                <button
                  onClick={async () => {
                    const modalService = ModalService.getInstance();
                    const confirmed = await modalService.confirm({
                      title: 'Видалити список?',
                      message: `Ви впевнені, що хочете видалити список "${todoList.name}"? Ця дія не може бути скасована.`,
                      confirmText: 'Видалити',
                      cancelText: 'Скасувати'
                    });
                    
                    if (confirmed) {
                      onModeChange(ViewMode.COMPACT);
                      setTimeout(() => {
                        onDeleteList(todoList.id);
                      }, 300);
                    }
                  }}
                  className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-700">Прогрес</span>
              <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-600">{completedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-300 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 dark:from-primary-600 dark:via-secondary-600 dark:to-accent-600 rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {progressPercentage === 100 && (
              <div className="mt-2 text-center">
                <span className="text-xs sm:text-sm text-accent-600 dark:text-accent-700 font-semibold">✨ Всі завдання виконані!</span>
              </div>
            )}
          </div>

          <div className="todo-items-container-large">
            {todoList.todos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-neutral-500">Почніть додавати завдання</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {todoList.todos.map(todo => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={(todoId) => onToggleTodo(todoList.id, todoId)}
                    onDelete={(todoId) => onDeleteTodo(todoList.id, todoId)}
                    onUpdate={(todoId, text) => onUpdateTodo(todoList.id, todoId, text)}
                  />
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3 mt-4">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Додати нове завдання..."
              className="morphing-input flex-1 text-sm sm:text-base"
            />
            <button 
              type="submit" 
              className="floating-button px-4 sm:px-6 py-2.5 sm:py-3 whitespace-nowrap text-sm sm:text-base"
              disabled={!newTodoText.trim()}
            >
              Додати
            </button>
          </form>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-200 rounded-lg sm:rounded-xl p-4 sm:p-6 mt-6 md:mt-0 overflow-y-auto">
          <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-neutral-700 mb-3 sm:mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Асистент
          </h3>
          
          <form onSubmit={handleGenerateTodos} className="space-y-3 sm:space-y-4">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Опишіть завдання, які потрібно згенерувати..."
              className="morphing-input w-full h-24 sm:h-32 resize-none text-sm sm:text-base"
            />
            <button 
              type="submit"
              className="floating-button w-full py-2.5 sm:py-3 text-sm sm:text-base"
              disabled={!aiPrompt.trim() || loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Генерую...
                </div>
              ) : (
                'Згенерувати завдання'
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 space-y-3">
            <h4 className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-700">Швидкі дії:</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAiPrompt('Згенеруй список завдань на ранок')}
                className="text-xs sm:text-sm p-2 bg-white dark:bg-neutral-100 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-100 transition-colors text-left text-neutral-700 dark:text-neutral-700"
              >
                🌅 Ранкові справи
              </button>
              <button
                onClick={() => setAiPrompt('Створи робочі завдання на день')}
                className="text-xs sm:text-sm p-2 bg-white dark:bg-neutral-100 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-100 transition-colors text-left text-neutral-700 dark:text-neutral-700"
              >
                💼 Робочі завдання
              </button>
              <button
                onClick={() => setAiPrompt('Додай список покупок')}
                className="text-xs sm:text-sm p-2 bg-white dark:bg-neutral-100 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-100 transition-colors text-left text-neutral-700 dark:text-neutral-700"
              >
                🛒 Список покупок
              </button>
              <button
                onClick={() => setAiPrompt('Згенеруй план тренування')}
                className="text-xs sm:text-sm p-2 bg-white dark:bg-neutral-100 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-100 transition-colors text-left text-neutral-700 dark:text-neutral-700"
              >
                💪 Тренування
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (viewMode) {
    case ViewMode.COMPACT:
      return renderCompactView();
    case ViewMode.MEDIUM:
      return renderMediumView();
    case ViewMode.LARGE:
      return isMobileDevice ? renderMediumView() : renderLargeView();
    default:
      return renderCompactView();
  }
} 