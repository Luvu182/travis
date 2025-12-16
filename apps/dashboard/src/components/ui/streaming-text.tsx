'use client';

import { useEffect, useState, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

export function StreamingText({
  text,
  speed = 30,
  className = '',
  onComplete,
  cursor = true,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {cursor && !isComplete && (
        <span className="inline-block w-0.5 h-[1.1em] bg-current animate-pulse ml-0.5 align-middle" />
      )}
    </span>
  );
}
