'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTodoLists } from '../hooks/useTodoLists';
import { useViewMode } from '../hooks/useViewMode';
import { ViewMode } from '../services/ViewModeService';
import { TodoListWithModes } from '../components/TodoListWithModes';
import { TypedText } from '../components/TypedText';

import { MobileMenu } from '../components/MobileMenu';

export default function Home() {
  const [newListName, setNewListName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    todoLists,
    loading,
    createList,
    deleteList,
    updateList,
    addTodoToList,
    generateAndAddTodos,
    updateTodo,
    deleteTodo,
    toggleTodo
  } = useTodoLists();

  const {
    activeOverlay,
    getViewMode,
    setViewMode,
    transitionToLarge,
    closeOverlay
  } = useViewMode();

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      const newList = await createList(newListName.trim());
      setNewListName('');
      if (newList) {
        setViewMode(newList.id, ViewMode.MEDIUM);
      }
    }
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const isOverlayClick = target.classList.contains('overlay-backdrop');
    
    if (isOverlayClick && activeOverlay) {
      closeOverlay();
    }
  }, [activeOverlay, closeOverlay]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const totalTodos = todoLists.reduce((acc, list) => acc + list.todos.length, 0);
  const completedTodos = todoLists.reduce((acc, list) => 
    acc + list.todos.filter(todo => todo.completed).length, 0
  );

  const handleSelectList = (listId: string) => {
    setViewMode(listId, ViewMode.MEDIUM);
  };

  const handleCreateNewList = () => {
    const input = document.querySelector('input[placeholder*="Назва списку"]') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  };

  return (
    <>
      {activeOverlay && <div className="overlay-backdrop" />}
      
      <MobileMenu
        todoLists={todoLists}
        onSelectList={handleSelectList}
        onDeleteList={deleteList}
        onCreateList={handleCreateNewList}
        selectedListId={activeOverlay || undefined}
      />
      
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto" ref={containerRef}>
          <header className="text-center mb-8 md:mb-12 slide-in">
            <div className="mb-4 md:mb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold gradient-text mb-2 md:mb-4">
                <TypedText
                  strings={[
                    'AI Todo Lists',
                    'Розумний планувальник',
                    'Організатор завдань',
                    'AI Todo Lists'
                  ]}
                  typeSpeed={80}
                  backSpeed={50}
                  backDelay={2000}
                  startDelay={1000}
                  loop={true}
                  showCursor={true}
                  cursorChar='|'
                />
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto px-4">
                Організуйте свої завдання з допомогою штучного інтелекту та досягайте більшого кожен день
              </p>
            </div>
            
            {totalTodos > 0 && (
              <div className="inline-block glass-card rounded-xl md:rounded-2xl p-4 md:p-6 fade-in">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-1">{totalTodos}</div>
                    <div className="text-neutral-500">Всього завдань</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-neutral-200"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-accent-600 mb-1">{completedTodos}</div>
                    <div className="text-neutral-500">Виконано</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-neutral-200"></div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1">
                      {totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%
                    </div>
                    <div className="text-neutral-500">Прогрес</div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-6">
                  <div className="w-full bg-neutral-200 rounded-full h-2 md:h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </header>



          <div className="max-w-2xl mx-auto mb-8 md:mb-12">
            <div className="glass-card rounded-xl md:rounded-2xl p-6 md:p-8 slide-in">
              <form onSubmit={handleCreateList} className="space-y-4 md:space-y-6">
                <div className="text-center mb-4 md:mb-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-neutral-800 mb-1 md:mb-2">
                    Створити новий список
                  </h3>
                  <p className="text-sm md:text-base text-neutral-600">
                    Почніть організовувати свої завдання з розумним плануванням
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Назва списку (наприклад: Робочі завдання)"
                    className="morphing-input flex-1 text-sm md:text-base text-neutral-800 placeholder-neutral-400"
                  />
                  <button
                    type="submit"
                    className="floating-button px-6 md:px-8 py-2.5 md:py-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                    disabled={loading || !newListName.trim()}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm md:text-base">Створюю...</span>
                      </div>
                    ) : (
                      <span className="text-sm md:text-base">Створити</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-fr">
            {todoLists.map((todoList, index) => {
              const viewMode = getViewMode(todoList.id);
              const isInOverlay = viewMode !== ViewMode.COMPACT;
              const isLargeMode = viewMode === ViewMode.LARGE;
              const shouldHide = isLargeMode || (isInOverlay && window?.innerWidth < 768);
              
              return (
                <div 
                  key={todoList.id} 
                  className={`slide-in ${shouldHide ? 'opacity-0 pointer-events-none' : isInOverlay ? 'opacity-30' : ''}`} 
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <TodoListWithModes
                    todoList={todoList}
                    viewMode={ViewMode.COMPACT}
                    onModeChange={(mode) => setViewMode(todoList.id, mode)}
                    onTransitionToLarge={() => {
                      if (window.innerWidth >= 640) {
                        transitionToLarge(todoList.id);
                      }
                    }}
                    onToggleTodo={toggleTodo}
                    onDeleteTodo={deleteTodo}
                    onUpdateTodo={(listId, todoId, text) => updateTodo(listId, todoId, { text })}
                    onAddTodo={addTodoToList}
                    onGenerateTodo={generateAndAddTodos}
                    onDeleteList={deleteList}
                    onUpdateListName={(listId, name) => updateList(listId, { name })}
                    loading={loading}
                  />
                </div>
              );
            })}
          </div>

          {activeOverlay && todoLists.map((todoList) => {
            const viewMode = getViewMode(todoList.id);
            if (viewMode === ViewMode.COMPACT || todoList.id !== activeOverlay) return null;
            
            return (
              <TodoListWithModes
                key={`overlay-${todoList.id}`}
                todoList={todoList}
                viewMode={viewMode}
                onModeChange={(mode) => setViewMode(todoList.id, mode)}
                onTransitionToLarge={() => {
                  if (window.innerWidth >= 640) {
                    transitionToLarge(todoList.id);
                  }
                }}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
                onUpdateTodo={(listId, todoId, text) => updateTodo(listId, todoId, { text })}
                onAddTodo={addTodoToList}
                onGenerateTodo={generateAndAddTodos}
                onDeleteList={deleteList}
                onUpdateListName={(listId, name) => updateList(listId, { name })}
                loading={loading}
              />
            );
          })}

          {todoLists.length === 0 && (
            <div className="text-center py-12 md:py-20 fade-in col-span-full px-4">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 floating">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2-7V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9l-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3 md:mb-4">
                Почніть з першого списку
              </h3>
              <p className="text-base md:text-lg text-neutral-600 max-w-md mx-auto">
                Створіть свій перший список завдань, щоб почати організовувати своє життя з розумним підходом
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
