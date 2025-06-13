// src/app/challenges/[category]/[challengeItemId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from '@/lib/firebase'; // Assuming your client-side Firebase app is exported from here

const storage = getStorage(app); // Get Firebase Storage instance

export default function AdminChallengeItemDifficultyPage() {
  const { category, challengeItemId } = useParams();
  const [challengeItem, setChallengeItem] = useState(null);
  const [difficulties, setDifficulties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const [selectedDifficultyLevel, setSelectedDifficultyLevel] = useState('easy');
  const [files, setFiles] = useState([]);

  const fetchChallengeItemAndDifficulties = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch item details
      const itemRes = await fetch(`/api/challenges/${category}/items/${challengeItemId}`);
      if (!itemRes.ok) {
        throw new Error(`Failed to fetch item details: ${itemRes.status}`);
      }
      const itemData = await itemRes.json();
      setChallengeItem(itemData);

      // Fetch difficulty levels
      const difficultyRes = await fetch(`/api/challenges/${category}/items/${challengeItemId}/difficulty`);
      if (!difficultyRes.ok) {
        if (difficultyRes.status === 404) {
            setDifficulties([]); // No difficulties yet is fine
        } else {
            throw new Error(`Failed to fetch difficulties: ${difficultyRes.status}`);
        }
      } else {
        const difficultyData = await difficultyRes.json();
        setDifficulties(difficultyData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category && challengeItemId) {
      fetchChallengeItemAndDifficulties();
    }
  }, [category, challengeItemId]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadAndSaveGallery = async (e) => {
    e.preventDefault();
    setUploadStatus('Uploading images...');
    setError(null);

    if (files.length === 0) {
      setUploadStatus('Please select images to upload.');
      return;
    }

    try {
      const imageUrls = [];
      for (const file of files) {
        const storageRef = ref(storage, `challenge_galleries/${category}/${challengeItemId}/${selectedDifficultyLevel}/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push(downloadURL);
      }

      // Now, update the Firestore document with the new gallery URLs
      const response = await fetch(`/api/challenges/${category}/items/${challengeItemId}/difficulty`, {
        method: 'POST', // Use POST to add/set the difficulty level
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficultyLevel: selectedDifficultyLevel,
          gallery: imageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setUploadStatus(`Gallery for ${selectedDifficultyLevel} updated successfully!`);
      setFiles([]); // Clear selected files
      e.target.reset(); // Reset file input
      fetchChallengeItemAndDifficulties(); // Refresh data
    } catch (err) {
      console.error("Error uploading or saving gallery:", err);
      setUploadStatus(`Error: ${err.message}`);
      setError(`Failed to save gallery: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!challengeItem) {
    return <div className="p-4 text-center">Challenge Item not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin: Manage Difficulty for "{challengeItem.title}"</h1>
      <p className="text-lg mb-6">Category: {category.replace(/-/g, ' ')}</p>

      {/* Upload Gallery Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add/Update Gallery Images for Difficulty</h2>
        <form onSubmit={handleUploadAndSaveGallery} className="space-y-4">
          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">Select Difficulty Level</label>
            <select
              id="difficultyLevel"
              value={selectedDifficultyLevel}
              onChange={(e) => setSelectedDifficultyLevel(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="galleryFiles" className="block text-sm font-medium text-gray-700">Upload Images</label>
            <input
              type="file"
              id="galleryFiles"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Upload & Save Gallery
          </button>
          {uploadStatus && <p className="mt-2 text-sm text-center">{uploadStatus}</p>}
        </form>
      </div>

      {/* Existing Difficulties and Galleries */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Galleries</h2>
        {difficulties.length === 0 ? (
          <p className="text-gray-500">No difficulty galleries added yet for this item.</p>
        ) : (
          <div className="space-y-6">
            {difficulties.map((diff) => (
              <div key={diff.level} className="border border-gray-200 rounded-md p-4">
                <h3 className="text-xl font-medium mb-3 capitalize">{diff.level} Difficulty</h3>
                {diff.gallery && diff.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {diff.gallery.map((url, index) => (
                      <div key={index} className="relative w-full h-32 overflow-hidden rounded-md bg-gray-100">
                        <img src={url} alt={`${diff.level} gallery image ${index + 1}`} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images for {diff.level} difficulty yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}