// src/components/challenges/ChallengeListings.js
'use client';

import Link from 'next/link';
import ChallengeCategoryCard from './challengeCategoryCard';
import ChallengeItemCard from './challengeItemCard';

/**
 * A versatile component to list either challenge categories or challenge items.
 * @param {Object[]} data - Array of category or item objects.
 * @param {'category' | 'item'} type - Determines which card component to render.
 * @param {string} baseHref - The base URL for the links (e.g., "/navigation/challenges" or "/navigation/challenges/anatomy").
 */
export default function ChallengeListings({ data, type, baseHref }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">No {type === 'category' ? 'categories' : 'items'} found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map(item => (
        <Link key={item.id} href={`${baseHref}/${item.id}`} className="block">
          {type === 'category' ? (
            <ChallengeCategoryCard category={item} />
          ) : (
            <ChallengeItemCard item={item} />
          )}
        </Link>
      ))}
    </div>
  );
}