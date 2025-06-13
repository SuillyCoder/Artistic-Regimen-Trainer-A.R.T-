// src/components/challenges/ActiveChallengeSession.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image'; // For Next.js Image optimization

export default function ActiveChallengeSession({ challengeItem, challengeType, difficulty, galleryImages, onEnd }) {
  const [timeLeft, setTimeLeft] = useState(challengeType === 'timed' ? challengeItem.timeLimit * 60 : null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (challengeType === 'timed' && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            onEnd(); // End challenge when time runs out
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && challengeType === 'timed') {
        onEnd(); // Ensure onEnd is called if time was already 0 on mount
    }

    // Cleanup on unmount or challenge end
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [challengeType, timeLeft, onEnd]);

  const formatTime = (seconds) => {
    if (seconds === null) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEndButtonClick = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onEnd();
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">{challengeItem.title} - {difficulty.toUpperCase()} ({challengeType === 'timed' ? 'Timed' : 'Free'})</h1>

      {challengeType === 'timed' && (
        <div className="text-2xl font-mono mb-4 bg-gray-100 p-3 rounded-md shadow-sm">
          Time Left: {formatTime(timeLeft)}
        </div>
      )}

      {galleryImages.length > 0 ? (
        <div className="relative w-full max-w-3xl h-96 bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden mb-6">
          <Image
            src={galleryImages[currentImageIndex]}
            alt={`Challenge reference ${currentImageIndex + 1}`}
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity"
              >
                &lt;
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100 transition-opacity"
              >
                &gt;
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full max-w-3xl h-96 bg-gray-200 flex items-center justify-center rounded-lg mb-6 text-gray-500">
          No gallery images available for this difficulty.
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={handleEndButtonClick}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
        >
          End Challenge
        </button>
        {/* "Again?" button logic would go here, which would likely call onEnd() and then re-start the process */}
        {/* For "Again?", you might want to pass a prop from onEnd to trigger the start again from parent,
            or the parent decides to re-render this component. */}
      </div>

      <p className="mt-4 text-gray-600">
        Instructions: {/* Add specific instructions here */}
        Draw {challengeItem.title} in {challengeType === 'timed' ? `${formatTime(timeLeft)} minutes` : 'your own time'} using the references.
      </p>
    </div>
  );
}