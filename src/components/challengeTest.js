'use client';
import { useState, useEffect } from 'react';

export default function TestChallengesApi() {
  const [challenges, setChallenges] = useState([]);
  const [statusMessage, setStatusMessage] = useState(''); // Unified status message

  // State for adding a new challenge
  const [newChallengeCategory, setNewChallengeCategory] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeTitle, setNewChallengeTitle] = useState('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  // Function to fetch all top-level challenges
  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges'); // API endpoint for top-level challenges
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
        setStatusMessage('Challenges fetched successfully.');
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch challenges:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch challenges: ${errorData.error || res.statusText}`);
        setChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setStatusMessage(`Error fetching challenges: ${error.message}`);
      setChallenges([]);
    }
  };

  // Function to handle adding a new top-level challenge
  const handleAddChallenge = async () => {
    const newChallengeData = {
      category: newChallengeCategory || 'Default Category',
      description: newChallengeDescription || 'Default Description',
      title: newChallengeTitle || `New Challenge ${Date.now()}`,
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChallengeData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Challenge added with ID: ${data.id}`);
        // Clear form fields
        setNewChallengeCategory('');
        setNewChallengeDescription('');
        setNewChallengeTitle('');
        fetchChallenges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to add challenge: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error adding challenge: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  // Function to handle updating an existing top-level challenge
  const handleUpdateChallenge = async (id, currentTitle) => {
    // Simulate updating a field, e.g., changing the description
    const updatedData = {
      description: `Updated description for "${currentTitle}" at ${new Date().toLocaleTimeString()}`,
    };
    try {
      const res = await fetch(`/api/challenges?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Challenge with ID ${id} updated.`);
        fetchChallenges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to update challenge ${id}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error updating challenge ${id}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  // Function to handle deleting a top-level challenge
  const handleDeleteChallenge = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete challenge "${title}" (ID: ${id})? This will also delete its subcollections (challengeItems)!`)) {
      return; // User cancelled
    }
    try {
      const res = await fetch(`/api/challenges?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Challenge with ID ${id} deleted.`);
        fetchChallenges(); // Refresh the list
      } else {
        setStatusMessage(`Failed to delete challenge ${id}: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      setStatusMessage(`Error deleting challenge ${id}: ${error.message}`);
      console.error('Fetch Error:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test Challenges API (Top-Level)</h2>

      <button onClick={fetchChallenges} style={{
        padding: '12px 20px',
        backgroundColor: '#3498DB',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        marginBottom: '20px',
        display: 'block',
        width: '100%'
      }}>
        Refresh All Challenges
      </button>

      {statusMessage && (
        <p style={{
          backgroundColor: '#E7F5FF',
          border: '1px solid #BEE3F8',
          padding: '10px',
          borderRadius: '5px',
          color: '#2B6CB0',
          marginBottom: '15px'
        }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Add New Challenge:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <input
            type="text"
            placeholder="Category (e.g., Anatomy)"
            value={newChallengeCategory}
            onChange={(e) => setNewChallengeCategory(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Title (e.g., Anatomy Quick Sketch)"
            value={newChallengeTitle}
            onChange={(e) => setNewChallengeTitle(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%' }}
          />
          <textarea
            placeholder="Description"
            value={newChallengeDescription}
            onChange={(e) => setNewChallengeDescription(e.target.value)}
            rows="3"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', resize: 'vertical' }}
          ></textarea>
          <button onClick={handleAddChallenge} style={{
            padding: '10px 15px',
            backgroundColor: '#27AE60',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold'
          }}>
            Add Challenge
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Existing Challenges:</h3>
        {challenges.length === 0 ? (
          <p>No challenges found. Add some above!</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {challenges.map((challenge) => (
              <li key={challenge.id} style={{
                border: '1px solid #CFCFCF',
                padding: '15px',
                margin: '10px 0',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>Title:</strong> {challenge.title || 'N/A'}</p>
                <p><strong>Category:</strong> {challenge.category || 'N/A'}</p>
                <p><strong>Description:</strong> {challenge.description || 'N/A'}</p>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>ID: {challenge.id}</p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleUpdateChallenge(challenge.id, challenge.title)}
                    style={{ padding: '8px 12px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Update Description
                  </button>
                  <button
                    onClick={() => handleDeleteChallenge(challenge.id, challenge.title)}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Delete Challenge
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
