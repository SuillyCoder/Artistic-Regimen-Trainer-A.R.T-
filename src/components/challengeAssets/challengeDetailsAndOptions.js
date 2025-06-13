// src/components/challenges/ChallengeDetailsAndOptions.js
'use client';

import { useState } from 'react';

export default function ChallengeDetailsAndOptions({ challengeItem, onStartChallenge }) {
  const [challengeType, setChallengeType] = useState('free'); // 'free' or 'timed'
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'

  const handleStart = () => {
    onStartChallenge(challengeType, difficulty);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-4 text-center text-gray-800">{challengeItem.title}</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">{challengeItem.description}</p>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">Choose Challenge Type:</h2>
        <div className="flex justify-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="challengeType"
              value="free"
              checked={challengeType === 'free'}
              onChange={() => setChallengeType('free')}
              className="form-radio text-indigo-600 h-5 w-5"
            />
            <span className="ml-2 text-lg">Free Mode</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="challengeType"
              value="timed"
              checked={challengeType === 'timed'}
              onChange={() => setChallengeType('timed')}
              className="form-radio text-indigo-600 h-5 w-5"
            />
            <span className="ml-2 text-lg">Timed Mode</span>
          </label>
        </div>
      </div>

      {challengeType === 'timed' && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">Select Difficulty:</h2>
          <div className="flex justify-center space-x-4">
            {['easy', 'medium', 'hard'].map(level => (
              <label key={level} className="inline-flex items-center">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={difficulty === level}
                  onChange={() => setDifficulty(level)}
                  className="form-radio text-indigo-600 h-5 w-5"
                />
                <span className="ml-2 text-lg capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={handleStart}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-xl transition-colors duration-200"
        >
          Start Challenge
        </button>
      </div>
    </div>
  );
}