// src/components/TestUserBadgesApi.js
'use client';
import { useState, useEffect } from 'react';

const DEFAULT_DOC_ID = 'default'; // The fixed ID for the single document in this subcollection

export default function TestUserBadgesApi() {
  const [userId, setUserId] = useState('');
  const [userBadges, setUserBadges] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [newBadgeIDToAdd, setNewBadgeIDToAdd] = useState('');
  const [updateFulfilledStatus, setUpdateFulfilledStatus] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserBadges();
    } else {
      setUserBadges([]);
      setStatusMessage('Enter a User ID to fetch badges.');
    }
  }, [userId]);

  const fetchUserBadges = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/badges`);
      if (res.ok) {
        const data = await res.json();
        setUserBadges(data);
        setStatusMessage(`Badges fetched for user: ${userId}`);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch user badges:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch user badges: ${errorData.error || res.statusText}`);
        setUserBadges([]);
      }
    } catch (error) {
      console.error('Error fetching user badges:', error);
      setStatusMessage(`Error fetching user badges: ${error.message}`);
      setUserBadges([]);
    }
  };

  const handleAddBadgeIDToList = async () => {
    if (!newBadgeIDToAdd) {
      setStatusMessage('Please enter a Badge ID to add.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/badges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newBadgeID: newBadgeIDToAdd,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Badge ID '${newBadgeIDToAdd}' added to list.`);
        setNewBadgeIDToAdd('');
        fetchUserBadges();
      } else {
        setStatusMessage(`Failed to add badge ID: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error adding badge ID: ${error.message}`);
    }
  };

  const handleUpdateFulfilledStatus = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/badges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fulfilled: updateFulfilledStatus,
          lastModifiedBy: 'TestUser',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Default badge fulfilled status updated to ${updateFulfilledStatus}.`);
        fetchUserBadges();
      } else {
        setStatusMessage(`Failed to update fulfilled status: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error updating fulfilled status: ${error.message}`);
    }
  };

  const handleClearBadges = async () => {
    if (!window.confirm(`Are you sure you want to clear ALL badge data for this user (resets badgeList and fulfilled status)?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/badges`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`User badge document cleared.`);
        fetchUserBadges();
      } else {
        setStatusMessage(`Failed to clear badge document: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error clearing badge document: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test User Badges API</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter User ID (UID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button onClick={fetchUserBadges} disabled={!userId} style={{
          padding: '10px 15px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Fetch User Badges
        </button>
      </div>

      {statusMessage && (
        <p style={{ backgroundColor: '#E7F5FF', border: '1px solid #BEE3F8', padding: '10px', borderRadius: '5px', color: '#2B6CB0', marginBottom: '15px' }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Modify Default Badge Document:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <h4>Add Badge ID to List:</h4>
          <input
            type="text"
            placeholder="New Badge ID to add (e.g., 'master_anatomist')"
            value={newBadgeIDToAdd}
            onChange={(e) => setNewBadgeIDToAdd(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleAddBadgeIDToList} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add Badge ID to List
          </button>

          <h4 style={{ marginTop: '15px' }}>Update Fulfilled Status:</h4>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={updateFulfilledStatus}
              onChange={(e) => setNewFulfilledStatus(e.target.checked)}
            />
            Set Fulfilled
          </label>
          <button onClick={handleUpdateFulfilledStatus} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Update Fulfilled Status
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Current User Badge Data (from 'default' document):</h3>
        {userBadges.length === 0 ? (
          <p>No badge data found for this user. Ensure 'default' document exists.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {userBadges.map((badgeDoc) => ( // Should only be one item: the default doc
              <li key={badgeDoc.id} style={{
                border: '1px solid #CFCFCF', padding: '15px', margin: '10px 0', borderRadius: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>Achieved Badges (IDs):</strong> {badgeDoc.badgeList && badgeDoc.badgeList.length > 0 ? badgeDoc.badgeList.join(', ') : 'None'}</p>
                <p><strong>Overall Fulfilled Status:</strong> {badgeDoc.fulfilled ? 'Yes' : 'No'}</p>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>Document ID: {badgeDoc.id}</p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleClearBadges}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Clear All Badge Data
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