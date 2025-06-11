"use client";

import { useState, useEffect } from 'react';
import { db } from '../../../../../lib/firebase'; // Adjust path based on actual location
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import Link from 'next/link'; // For client-side navigation

export default function PerspectiveModulePage() {
  const [moduleItems, setModuleItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerspectiveModuleItems = async () => {
      try {
        setLoading(true);
        setError(null);
        // Reference to the 'moduleItems' subcollection under 'modules/perspective'
        const perspectiveModuleItemsCollectionRef = collection(db, 'modules', 'perspective', 'moduleItems');
        
        // Create a query to get all documents, ordering by 'order' field if it exists
        // Assuming 'order' field exists for sorting, as implied by your previous UI for adding module items.
        // If not, you can remove orderBy( 'order', 'asc' )
        const q = query(perspectiveModuleItemsCollectionRef, orderBy('order', 'asc')); 
        
        const querySnapshot = await getDocs(q);
        
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setModuleItems(items);
      } catch (err) {
        console.error("Error fetching perspective module items:", err);
        setError("Failed to load module items. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerspectiveModuleItems();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-8 font-inter">
      <h1 className="text-5xl font-extrabold text-teal-400 mb-6 text-center">
        Perspective Module
      </h1>
      <p className="text-lg text-gray-300 mb-10 text-center max-w-2xl">
        Dive deep into the study of human and animal perspective through these curated exercises and resources.
      </p>

      {loading && <p className="text-gray-400 text-xl">Loading perspective exercises...</p>}
      {error && <p className="text-red-500 text-xl">{error}</p>}

      {!loading && !error && moduleItems.length === 0 && (
        <p className="text-gray-400 text-xl">No perspective exercises found yet. Check back later!</p>
      )}

      {!loading && !error && moduleItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {moduleItems.map((item) => (
            <div 
              key={item.id} 
              className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col"
            >
              {item.image && ( // Conditionally render image if available
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title || "Module Item Image"} 
                    className="object-cover w-full h-full" 
                  />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-3xl font-bold text-teal-300 mb-3">{item.title || "Untitled Module"}</h2>
                {item.description && ( // Optional description
                  <p className="text-gray-300 mb-4 text-base flex-grow">{item.description}</p>
                )}
                <div className="mt-auto"> {/* Pushes button to the bottom */}
                  {item.link ? (
                    <Link className="inline-block bg-purple-600 text-white font-semibold py-3 px-6 rounded-full shadow-md hover:bg-purple-700 transition duration-200 text-lg"
                        target="_blank" // Open links in new tab
                        rel="noopener noreferrer" // Security best practice for target="_blank"
                      href={item.link}>
                        Access Module
                    </Link>
                  ) : (
                    <p className="text-gray-500 text-sm">No direct link available for this module item.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
