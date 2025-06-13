// src/components/challenges/ChallengeCategoryCard.js
'use client';

import React from 'react';

export default function ChallengeCategoryCard({ category }) {
  return (
    <div className="border border-gray-300 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
      <p className="text-gray-600">{category.description}</p>
      {/* You can add an image or icon here based on the category */}
    </div>
  );
}