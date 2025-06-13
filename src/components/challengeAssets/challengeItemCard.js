// src/components/challenges/ChallengeItemCard.js
'use client';

import React from 'react';

export default function ChallengeItemCard({ item }) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
      <p className="text-gray-500 text-xs">Time Limit: {item.timeLimit} minutes (base)</p>
      {/* You can add more item-specific details or an image here */}
    </div>
  );
}