// src/app/navigation/challenges/[category]/[challengeId]/page.js
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChallengeDetailsAndOptions from '@/components/challenges/ChallengeDetailsAndOptions'; // Path to your component
import ActiveChallengeSession from '@/components/challenges/ActiveChallengeSession'; // Path to your component

export default function SingleChallengePage() {
  const { category, challengeId } = useParams(); // Get dynamic parameters
  const [challengeItem, setChallengeItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChallengeActive, setIsChallengeActive] = useState(false);
  const [selectedType, setSelectedType] = useState('free'); // 'free' or 'timed'
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (category && challengeId) {
      async function fetchChallengeItem() {
        try {
          setLoading(true);
          const response = await fetch(`/api/challenges/${category}/items/${challengeId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setChallengeItem(data);
        } catch (err) {
          console.error(`Failed to fetch challenge item ${challengeId}:`, err);
          setError(`Failed to load challenge details. Please try again later.`);
        } finally {
          setLoading(false);
        }
      }
      fetchChallengeItem();
    }
  }, [category, challengeId]);

  const handleStartChallenge = async (type, difficulty) => {
    setSelectedType(type);
    setSelectedDifficulty(difficulty);

    // Fetch gallery for the selected difficulty
    try {
      const galleryResponse = await fetch(`/api/challenges/${category}/items/${challengeId}/difficulty/${difficulty}`);
      if (!galleryResponse.ok) {
        throw new Error(`Failed to fetch gallery for difficulty ${difficulty}.`);
      }
      const galleryData = await galleryResponse.json();
      setGalleryImages(galleryData.gallery || []); // Ensure gallery is an array
      setIsChallengeActive(true); // Start the session only after gallery is fetched
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setError("Could not load challenge images. Please try another difficulty or challenge.");
    }
  };

  const handleEndChallenge = () => {
    setIsChallengeActive(false);
    // Optionally, reset selected options or navigate back
  };

  if (loading) {
    return <div className="p-4 text-center">Loading challenge details...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!challengeItem) {
    return <div className="p-4 text-center">Challenge not found.</div>;
  }

  if (isChallengeActive) {
    return (
      <ActiveChallengeSession
        challengeItem={challengeItem}
        challengeType={selectedType}
        difficulty={selectedDifficulty}
        galleryImages={galleryImages} // Pass fetched images to the active session
        onEnd={handleEndChallenge}
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Use ChallengeDetailsAndOptions component to display details and get user choices */}
      <ChallengeDetailsAndOptions
        challengeItem={challengeItem}
        onStartChallenge={handleStartChallenge} // Pass the function to start the session
      />
    </div>
  );
}