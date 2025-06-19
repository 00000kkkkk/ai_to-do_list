'use client';

import { useEffect, useState } from 'react';
import { TodoList } from '../types/todo';
import { ModalService } from '../services/ModalService';
import { useMobileMenu } from '../hooks/useMobileMenu';

interface MobileMenuProps {
  todoLists: TodoList[];
  onSelectList: (listId: string) => void;
  onDeleteList: (listId: string) => void;
  onCreateList: () => void;
  selectedListId?: string;
}

export function MobileMenu({ 
  todoLists, 
  onSelectList, 
  onDeleteList, 
  onCreateList,
  selectedListId 
}: MobileMenuProps) {
  const { isOpen, openMenu, closeMenu } = useMobileMenu();
  const modalService = ModalService.getInstance();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const handleDeleteList = async (e: React.MouseEvent, list: TodoList) => {
    e.stopPropagation();
    
    const confirmed = await modalService.confirm({
      title: 'Видалити список?',
      message: `Ви впевнені, що хочете видалити список "${list.name}"? Ця дія не може бути скасована.`,
      confirmText: 'Видалити',
      cancelText: 'Скасувати'
    });
    
    if (confirmed) {
      onDeleteList(list.id);
      if (selectedListId === list.id) {
        closeMenu();
      }
    }
  };

  return (
    <>
      <button
        onClick={() => openMenu()}
        className="fixed bottom-6 left-6 w-12 h-12 bg-primary-600 dark:bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl flex sm:hidden items-center justify-center z-50 transition-all duration-300 hover:scale-105"
        title="Меню списків"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className={`fixed inset-0 ${isDark ? 'bg-black/70' : 'bg-black/30'} z-50 sm:hidden mobile-menu-overlay`}
            onClick={() => closeMenu()}
          />
          
          <div className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] sm:w-96 lg:w-[28rem] ${isDark ? 'bg-neutral-100' : 'bg-white'} shadow-xl z-50 transform transition-all duration-300 sm:hidden mobile-menu-panel ${isDark ? 'shadow-black/50' : ''}`}>
                          <div className={`p-4 border-b ${isDark ? 'border-neutral-300' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between">
                                  <h2 className={`text-xl font-bold ${isDark ? 'text-neutral-800' : 'text-neutral-800'}`}>Мої списки</h2>
                                  <button
                    onClick={() => closeMenu()}
                    className={`p-2 ${isDark ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'} rounded-lg transition-all`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-180px)]">
              {todoLists.map(list => {
                const completedCount = list.todos.filter(todo => todo.completed).length;
                const totalCount = list.todos.length;
                const isSelected = selectedListId === list.id;

                return (
                  <div
                    key={list.id}
                    onClick={() => {
                      onSelectList(list.id);
                      closeMenu();
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                                              isSelected 
                          ? `${isDark ? 'bg-primary-200 border-primary-300' : 'bg-primary-100 border-primary-300'}`  
                        : `${isDark ? 'bg-neutral-200 hover:bg-neutral-300' : 'bg-neutral-50 hover:bg-neutral-100'} border-transparent`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold ${isDark ? 'text-neutral-800' : 'text-neutral-800'} truncate`}>{list.name}</h3>
                        <p className={`text-sm ${isDark ? 'text-neutral-600' : 'text-neutral-600'} mt-1`}>
                          {completedCount} з {totalCount} виконано
                        </p>
                        {totalCount > 0 && (
                          <div className="mt-2">
                            <div className={`w-full ${isDark ? 'bg-neutral-300' : 'bg-neutral-200'} rounded-full h-1.5 overflow-hidden`}>
                              <div 
                                className={`h-full bg-gradient-to-r ${isDark ? 'from-primary-600 to-accent-600' : 'from-primary-500 to-accent-500'} rounded-full transition-all duration-500`}
                                style={{ width: `${(completedCount / totalCount) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleDeleteList(e, list)}
                        className={`ml-2 p-1.5 ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-900' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'} rounded transition-all`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}

              {todoLists.length === 0 && (
                <div className="text-center py-8">
                  <p className={`${isDark ? 'text-neutral-500' : 'text-neutral-500'}`}>Немає списків</p>
                </div>
              )}
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'border-neutral-300 bg-neutral-100' : 'border-neutral-200 bg-white'}`}>
              <button
                onClick={() => {
                  onCreateList();
                  closeMenu();
                }}
                className="w-full floating-button py-3 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Створити новий список
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
} 