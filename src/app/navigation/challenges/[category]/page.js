// src/app/navigation/challenges/[category]/page.js
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChallengeListings from '@/components/challenges/ChallengeListings'; // Path to your ChallengeListings component

export default function CategoryChallengesPage() {
  const { category } = useParams(); // Get the dynamic category from the URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      async function fetchChallengeItems() {
        try {
          setLoading(true);
          const response = await fetch(`/api/challenges/${category}/items`); // Call the API route
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setItems(data);
        } catch (err) {
          console.error(`Failed to fetch challenge items for ${category}:`, err);
          setError(`Failed to load challenge items for ${category}. Please try again later.`);
        } finally {
          setLoading(false);
        }
      }

      fetchChallengeItems();
    }
  }, [category]); // Re-fetch if category changes

  if (loading) {
    return <div className="p-4 text-center">Loading {category} challenges...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 capitalize">{category.replace(/-/g, ' ')} Challenges</h1>
      <ChallengeListings data={items} type="item" baseHref={`/navigation/challenges/${category}`} />
    </div>
  );
}