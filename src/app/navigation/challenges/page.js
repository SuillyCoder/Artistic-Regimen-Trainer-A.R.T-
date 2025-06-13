// src/app/navigation/challenges/page.js
"use client"; // This component runs on the client-side

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation if needed later

export default function ChallengesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading state
  const [error, setError] = useState(null);

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null); // Clear previous errors

      try {
        const response = await fetch('/api/challenges'); // Call your API route
        
        if (!response.ok) {
          // If the response is not OK, check the status
          // Specifically handle the 404 for 'no categories found'
          if (response.status === 404) {
            const errorData = await response.json();
            if (errorData.message === 'No challenge categories found.') {
              setCategories([]); // No categories, so set to empty array
              setError(null); // Clear error, as this is a handled "no data" state
              console.info("Firestore 'challenges' collection is empty.");
              return; // Exit, no need to process as an error
            }
          }
          // For any other non-OK status (e.g., 500, 400), throw a real error
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching challenge categories:', err);
        setError("Failed to load challenge categories. Please try again later.");
        setCategories([]); // Ensure categories is empty on actual error
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <p className="text-xl text-fuchsia-400">Loading challenges...</p>
        </div>
      </div>
    );
  }

  // Display error message if there's an actual error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-5xl font-extrabold text-red-500 mb-4">Error</h1>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-green-400 mb-4">
          Drawing Challenges
        </h1>
        <p className="text-lg text-gray-300">
          Select a challenge category to hone your skills!
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length > 0 ? (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-gray-800 p-6 rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer border border-gray-700"
              // onClick={() => router.push(`/navigation/challenges/${category.id}`)} // Example for navigating to sub-challenges
            >
              <h2 className="text-3xl font-bold text-green-300 mb-2">
                {category.title || category.category}
              </h2>
              <p className="text-gray-400 text-base">
                {category.description || "No description available."}
              </p>
            </div>
          ))
        ) : (
          // This block will render when categories is empty and there's no error
          <div className="col-span-full text-center p-8 bg-gray-800 rounded-lg shadow-xl">
            <p className="text-2xl text-gray-400">
              No challenge categories found. Check back later!
            </p>
            <p className="text-md text-gray-500 mt-2">
              You can add categories via the admin panel or your Firestore directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}