'use client';

import { useEffect, useRef } from 'react';
import Typed from 'typed.js';

interface TypedTextProps {
  strings: string[];
  className?: string;
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  startDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
}

export function TypedText({
  strings,
  className = '',
  typeSpeed = 50,
  backSpeed = 30,
  backDelay = 1500,
  startDelay = 500,
  loop = true,
  showCursor = true,
  cursorChar = '|'
}: TypedTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<Typed | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      const options = {
        strings,
        typeSpeed,
        backSpeed,
        backDelay,
        startDelay,
        loop,
        showCursor,
        cursorChar,
        cursorBlinking: true,
        cursorClass: 'typed-cursor',
        onComplete: () => {
          const cursor = elementRef.current?.nextSibling as HTMLElement;
          if (cursor && cursor.classList.contains('typed-cursor')) {
            cursor.style.visibility = 'visible';
            cursor.style.opacity = '1';
          }
        }
      };

      typedRef.current = new Typed(elementRef.current, options);
    }

    return () => {
      if (typedRef.current) {
        typedRef.current.destroy();
      }
    };
  }, [strings, typeSpeed, backSpeed, backDelay, startDelay, loop, showCursor, cursorChar]);

  return <span ref={elementRef} className={className} />;
} 