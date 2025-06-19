import { NextRequest, NextResponse } from 'next/server';
import { CreateTodoRequest, CreateTodoResponse } from '../../../types/todo';

export async function POST(request: NextRequest) {
  try {
    const { listId, prompt }: CreateTodoRequest = await request.json();

    if (!listId || !prompt) {
      return NextResponse.json(
        { success: false, error: 'ListId та prompt обов\'язкові' },
        { status: 400 }
      );
    }

    const todos = await generateTodosWithAI(prompt);

    const response: CreateTodoResponse = {
      success: true,
      todos: todos.map(todoText => ({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        text: todoText,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Помилка при генерації завдань' },
      { status: 500 }
    );
  }
}

async function generateTodosWithAI(prompt: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return generateFallbackTodos(prompt);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          {
            role: 'system',
            content: `Ти експертний помічник для створення списків завдань. 
            На основі запиту користувача створи список з 3-8 конкретних, корисних завдань.
            Кожне завдання має бути:
            - Конкретним і виконуваним
            - Коротким (до 80 символів)
            - Українською мовою
            - Логічно пов'язаним з темою запиту
            
            Верни ЛИШЕ список завдань, кожне з нового рядка, без нумерації та додаткового тексту.
            
            Приклад для запиту "підготовка до співбесіди":
            Переглянути резюме та оновити його
            Дослідити компанію та її цінності
            Підготувати відповіді на типові питання
            Вибрати професійний одяг
            Попрактикуватися у презентації себе`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return generateFallbackTodos(prompt);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      return generateFallbackTodos(prompt);
    }

    const todos = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => line.replace(/^[-•\d+\.)]\s*/, ''))
      .slice(0, 8);

    return todos.length > 0 ? todos : generateFallbackTodos(prompt);
  } catch {
    return generateFallbackTodos(prompt);
  }
}

function generateFallbackTodos(prompt: string): string[] {
  const templates = [
    `Почати роботу над: ${prompt}`,
    `Дослідити тему: ${prompt}`,
    `Створити план для: ${prompt}`,
    `Зібрати інформацію про: ${prompt}`,
    `Проаналізувати: ${prompt}`,
    `Завершити: ${prompt}`
  ];
  
  return templates.slice(0, Math.min(4, templates.length));
} 