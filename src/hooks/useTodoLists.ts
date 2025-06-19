import { useState, useEffect, useCallback } from 'react';
import { TodoList, Todo, CreateTodoRequest } from '../types/todo';
import { StorageService } from '../services/StorageService';

export const useTodoLists = () => {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(false);
  
  const storageService = StorageService.getInstance();

  const loadTodoLists = useCallback(() => {
    try {
      const lists = storageService.todoLists;
      setTodoLists(lists);
    } catch {
    }
  }, [storageService]);

  useEffect(() => {
    loadTodoLists();
  }, [loadTodoLists]);

  const createList = useCallback(async (name: string): Promise<TodoList | null> => {
    try {
      const newList = storageService.createList(name);
      setTodoLists(prev => [...prev, newList]);
      return newList;
    } catch {
      return null;
    }
  }, [storageService]);

  const deleteList = useCallback(async (listId: string): Promise<boolean> => {
    try {
      const success = storageService.deleteList(listId);
      if (success) {
        setTodoLists(prev => prev.filter(list => list.id !== listId));
      }
      return success;
    } catch {
      return false;
    }
  }, [storageService]);

  const updateList = useCallback(async (listId: string, updates: Partial<TodoList>): Promise<TodoList | null> => {
    try {
      const updatedList = storageService.updateList(listId, updates);
      if (updatedList) {
        setTodoLists(prev => prev.map(list => 
          list.id === listId ? updatedList : list
        ));
      }
      return updatedList;
    } catch {
      return null;
    }
  }, [storageService]);

  const addTodoToList = useCallback(async (listId: string, todoText: string): Promise<Todo | null> => {
    try {
      const newTodo = storageService.addTodoToList(listId, todoText);
      if (newTodo) {
        loadTodoLists();
      }
      return newTodo;
    } catch {
      return null;
    }
  }, [storageService, loadTodoLists]);

  const addMultipleTodosToList = useCallback(async (listId: string, todos: Todo[]): Promise<boolean> => {
    try {
      const success = storageService.addMultipleTodosToList(listId, todos);
      if (success) {
        loadTodoLists();
      }
      return success;
    } catch {
      return false;
    }
  }, [storageService, loadTodoLists]);

  const generateAndAddTodos = useCallback(async (listId: string, prompt: string): Promise<Todo[] | null> => {
    try {
      setLoading(true);

      const request: CreateTodoRequest = { listId, prompt };
      
      const response = await fetch('/api/generate-todo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        return null;
      }

      if (data.todos && data.todos.length > 0) {
        const addedTodos = data.todos.map((todo: Omit<Todo, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }));
        
        await addMultipleTodosToList(listId, addedTodos);
        return addedTodos;
      }

      if (data.todo) {
        const addedTodo = await addTodoToList(listId, data.todo.text);
        return addedTodo ? [addedTodo] : null;
      }

      return null;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [addTodoToList, addMultipleTodosToList]);

  const generateAndAddTodo = generateAndAddTodos;

  const updateTodo = useCallback(async (listId: string, todoId: string, updates: Partial<Todo>): Promise<Todo | null> => {
    try {
      const updatedTodo = storageService.updateTodo(listId, todoId, updates);
      if (updatedTodo) {
        loadTodoLists();
      }
      return updatedTodo;
    } catch {
      return null;
    }
  }, [storageService, loadTodoLists]);

  const deleteTodo = useCallback(async (listId: string, todoId: string): Promise<boolean> => {
    try {
      const success = storageService.deleteTodo(listId, todoId);
      if (success) {
        loadTodoLists();
      }
      return success;
    } catch {
      return false;
    }
  }, [storageService, loadTodoLists]);

  const toggleTodo = useCallback(async (listId: string, todoId: string): Promise<Todo | null> => {
    const list = todoLists.find(l => l.id === listId);
    const todo = list?.todos.find(t => t.id === todoId);
    
    if (!todo) return null;

    return updateTodo(listId, todoId, { completed: !todo.completed });
  }, [todoLists, updateTodo]);

  return {
    todoLists,
    loading,
    createList,
    deleteList,
    updateList,
    addTodoToList,
    generateAndAddTodo,
    generateAndAddTodos,
    updateTodo,
    deleteTodo,
    toggleTodo
  };
}; 