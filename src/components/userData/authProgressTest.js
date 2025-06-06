// src/components/TestUserProgressApi.js
'use client';
import { useState, useEffect } from 'react';

const DEFAULT_DOC_ID = 'default';

export default function TestUserProgressApi() {
  const [userId, setUserId] = useState('');
  const [userProgressEntries, setUserProgressEntries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [newProgressValue, setNewProgressValue] = useState(0);
  const [newBadgeIdToAdd, setNewBadgeIdToAdd] = useState('');
  const [newTodoItemToAdd, setNewTodoItemToAdd] = useState('');


  useEffect(() => {
    if (userId) {
      fetchUserProgress();
    } else {
      setUserProgressEntries([]);
      setStatusMessage('Enter a User ID to fetch progress entries.');
    }
  }, [userId]);

  const fetchUserProgress = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/progress`);
      if (res.ok) {
        const data = await res.json();
        setUserProgressEntries(data);
        setStatusMessage(`Progress entries fetched for user: ${userId}`);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch user progress:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch user progress: ${errorData.error || res.statusText}`);
        setUserProgressEntries([]);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
      setStatusMessage(`Error fetching user progress: ${error.message}`);
      setUserProgressEntries([]);
    }
  };

  const handleUpdateProgressValue = async () => {
    if (isNaN(parseInt(newProgressValue))) {
      setStatusMessage('Please enter a valid number for Progress.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress: parseInt(newProgressValue),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Progress value updated to ${newProgressValue}.`);
        fetchUserProgress();
      } else {
        setStatusMessage(`Failed to update progress value: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error updating progress value: ${error.message}`);
    }
  };

  const handleAddBadgeIdToProgressList = async () => {
    if (!newBadgeIdToAdd) {
      setStatusMessage('Please enter a Badge ID to add to the list.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeListToAdd: [newBadgeIdToAdd],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Badge ID '${newBadgeIdToAdd}' added to progress badge list.`);
        setNewBadgeIdToAdd('');
        fetchUserProgress();
      } else {
        setStatusMessage(`Failed to add badge ID to progress list: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error adding badge ID to progress list: ${error.message}`);
    }
  };

  const handleAddTodoItemToProgressList = async () => {
    if (!newTodoItemToAdd) {
      setStatusMessage('Please enter a To Do item to add.');
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toDoListToAdd: [newTodoItemToAdd],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`To Do item '${newTodoItemToAdd}' added to progress list.`);
        setNewTodoItemToAdd('');
        fetchUserProgress();
      } else {
        setStatusMessage(`Failed to add To Do item: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error adding To Do item: ${error.message}`);
    }
  };

  const handleTamperProgress = async () => {
    const defaultDoc = userProgressEntries[0];
    if (!defaultDoc) {
      setStatusMessage('No default progress document to tamper.');
      return;
    }

    const tamperedData = {
      progress: Math.floor(Math.random() * 100),
      badgeList: ['tampered_badge1', 'tampered_badge2'],
      toDoList: [`Tampered task ${Date.now().toString().slice(-4)}`],
      lastTampered: new Date(),
    };

    try {
      const res = await fetch(`/api/users/${userId}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tamperedData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Default progress document updated (tampered).`);
        fetchUserProgress();
      } else {
        setStatusMessage(`Failed to tamper progress: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error tampering progress: ${error.message}`);
    }
  };

  const handleClearProgress = async () => {
    if (!window.confirm(`Are you sure you want to clear ALL progress data for this user (resets progress, badgeList, toDoList)?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/progress`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`User progress document cleared.`);
        fetchUserProgress();
      } else {
        setStatusMessage(`Failed to clear progress document: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error clearing progress document: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test User Progress API</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter User ID (UID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button onClick={fetchUserProgress} disabled={!userId} style={{
          padding: '10px 15px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Fetch User Progress
        </button>
      </div>

      {statusMessage && (
        <p style={{ backgroundColor: '#E7F5FF', border: '1px solid #BEE3F8', padding: '10px', borderRadius: '5px', color: '#2B6CB0', marginBottom: '15px' }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Modify Default Progress Document:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <h4>Update Progress Value:</h4>
          <input
            type="number"
            placeholder="Set Progress (e.g., 75)"
            value={newProgressValue}
            onChange={(e) => setNewProgressValue(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleUpdateProgressValue} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Update Progress
          </button>

          <h4 style={{ marginTop: '15px' }}>Add Badge ID to List:</h4>
          <input
            type="text"
            placeholder="New Badge ID to add (e.g., 'master_gesture')"
            value={newBadgeIdToAdd}
            onChange={(e) => setNewBadgeIdToAdd(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleAddBadgeIdToProgressList} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add Badge ID
          </button>

          <h4 style={{ marginTop: '15px' }}>Add To Do Item:</h4>
          <input
            type="text"
            placeholder="New To Do Item (e.g., 'Practice cross-hatching')"
            value={newTodoItemToAdd}
            onChange={(e) => setNewTodoItemToAdd(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleAddTodoItemToProgressList} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Add To Do Item
          </button>

          <h4 style={{ marginTop: '15px' }}>Tamper All Progress Data:</h4>
          <button onClick={handleTamperProgress} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Tamper Progress Data
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Current User Progress Data (from 'default' document):</h3>
        {userProgressEntries.length === 0 ? (
          <p>No progress data found for this user. Ensure 'default' document exists.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {userProgressEntries.map((entryDoc) => (
              <li key={entryDoc.id} style={{
                border: '1px solid #CFCFCF', padding: '15px', margin: '10px 0', borderRadius: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>Progress:</strong> {entryDoc.progress !== undefined ? entryDoc.progress : 'N/A'}</p>
                <p><strong>Badge List:</strong> {entryDoc.badgeList && entryDoc.badgeList.length > 0 ? entryDoc.badgeList.join(', ') : 'None'}</p>
                <p><strong>To Do List:</strong> {entryDoc.toDoList && entryDoc.toDoList.length > 0 ? entryDoc.toDoList.join(' | ') : 'None'}</p>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>Document ID: {entryDoc.id}</p>
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={handleClearProgress}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Clear All Progress Data
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