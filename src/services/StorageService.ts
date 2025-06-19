import { TodoList, Todo } from '../types/todo';

export class StorageService {
  private static instance: StorageService;
  private readonly STORAGE_KEY = 'ai_todo_lists';

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  get todoLists(): TodoList[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const lists = JSON.parse(data);
      return lists.map((list: Omit<TodoList, 'createdAt' | 'updatedAt' | 'todos'> & { 
        createdAt: string; 
        updatedAt: string; 
        todos: (Omit<Todo, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string })[]
      }) => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt),
        todos: list.todos.map((todo: Omit<Todo, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string }) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt)
        }))
      }));
    } catch {
      return [];
    }
  }

  set todoLists(lists: TodoList[]) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lists));
    } catch {
    }
  }

  createList(name: string): TodoList {
    const newList: TodoList = {
      id: this.generateId(),
      name,
      todos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const lists = this.todoLists;
    lists.push(newList);
    this.todoLists = lists;

    return newList;
  }

  updateList(listId: string, updates: Partial<TodoList>): TodoList | null {
    const lists = this.todoLists;
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;

    lists[listIndex] = {
      ...lists[listIndex],
      ...updates,
      updatedAt: new Date()
    };

    this.todoLists = lists;
    return lists[listIndex];
  }

  deleteList(listId: string): boolean {
    const lists = this.todoLists;
    const filteredLists = lists.filter(list => list.id !== listId);
    
    if (filteredLists.length === lists.length) return false;

    this.todoLists = filteredLists;
    return true;
  }

  addTodoToList(listId: string, todoText: string): Todo | null {
    const lists = this.todoLists;
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;

    const newTodo: Todo = {
      id: this.generateId(),
      text: todoText,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    lists[listIndex].todos.push(newTodo);
    lists[listIndex].updatedAt = new Date();
    this.todoLists = lists;

    return newTodo;
  }

  addMultipleTodosToList(listId: string, todos: Todo[]): boolean {
    const lists = this.todoLists;
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return false;

    const todosWithIds = todos.map(todo => ({
      ...todo,
      id: todo.id || this.generateId(),
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt)
    }));

    lists[listIndex].todos.push(...todosWithIds);
    lists[listIndex].updatedAt = new Date();
    this.todoLists = lists;

    return true;
  }

  updateTodo(listId: string, todoId: string, updates: Partial<Todo>): Todo | null {
    const lists = this.todoLists;
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return null;

    const todoIndex = lists[listIndex].todos.findIndex(todo => todo.id === todoId);
    if (todoIndex === -1) return null;

    lists[listIndex].todos[todoIndex] = {
      ...lists[listIndex].todos[todoIndex],
      ...updates,
      updatedAt: new Date()
    };

    lists[listIndex].updatedAt = new Date();
    this.todoLists = lists;

    return lists[listIndex].todos[todoIndex];
  }

  deleteTodo(listId: string, todoId: string): boolean {
    const lists = this.todoLists;
    const listIndex = lists.findIndex(list => list.id === listId);
    
    if (listIndex === -1) return false;

    const originalLength = lists[listIndex].todos.length;
    lists[listIndex].todos = lists[listIndex].todos.filter(todo => todo.id !== todoId);
    
    if (lists[listIndex].todos.length === originalLength) return false;

    lists[listIndex].updatedAt = new Date();
    this.todoLists = lists;
    return true;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 