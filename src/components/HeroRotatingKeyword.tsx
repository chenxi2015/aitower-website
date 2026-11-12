import React, { useEffect, useState } from 'react';

interface HeroRotatingKeywordProps {
  words: string[];
  intervalMs?: number;
}

export default function HeroRotatingKeyword({
  words,
  intervalMs = 2600,
}: HeroRotatingKeywordProps) {
  if (!words || words.length === 0) return null;

  // Duplicate the first word at the end for a seamless infinite loop upward
  const extendedWords = [...words, words[0]];
  const [index, setIndex] = useState(0);
  const [hasTransition, setHasTransition] = useState(true);

  useEffect(() => {
    if (words.length <= 1) return;

    const interval = setInterval(() => {
      setHasTransition(true);
      setIndex((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [words.length, intervalMs]);

  useEffect(() => {
    // When reached the duplicated last item, jump back to 0 without animation
    if (index === words.length) {
      const resetTimeout = setTimeout(() => {
        setHasTransition(false);
        setIndex(0);
      }, 500); // Matches transition duration

      return () => clearTimeout(resetTimeout);
    }
  }, [index, words.length]);

  const displayWord = words[index % words.length] || words[0];

  return (
    <span
      className="marker-underline is-visible inline-block relative overflow-hidden align-baseline transition-[width] duration-300 ease-out"
      style={{
        verticalAlign: '-0.2em',
        height: '1.18em',
      }}
    >
      {/* Invisible sizer to naturally fit the current word width */}
      <span className="invisible whitespace-nowrap select-none px-0.5" aria-hidden="true">
        {displayWord}
      </span>

      {/* Pure text rotating ticker without any pill/box styling */}
      <span
        className={`absolute inset-0 flex flex-col ${
          hasTransition
            ? 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]'
            : ''
        }`}
        style={{
          transform: `translateY(-${(index * 100) / extendedWords.length}%)`,
          height: `${extendedWords.length * 100}%`,
        }}
      >
        {extendedWords.map((word, i) => (
          <span
            key={i}
            className="w-full flex items-center justify-center whitespace-nowrap text-inherit font-bold"
            style={{ height: `${100 / extendedWords.length}%` }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
