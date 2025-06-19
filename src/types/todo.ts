export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoList {
  id: string;
  name: string;
  todos: Todo[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTodoRequest {
  listId: string;
  prompt: string;
}

export interface CreateTodoResponse {
  success: boolean;
  todo?: Todo;
  todos?: Todo[];
  error?: string;
} 