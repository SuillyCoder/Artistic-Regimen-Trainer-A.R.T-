// src/components/TestUserPromptsApi.js
'use client';
import { useState, useEffect } from 'react';

const DEFAULT_DOC_ID = 'default';

export default function TestUserPromptsApi() {
  const [userId, setUserId] = useState('');
  const [userPrompts, setUserPrompts] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const [newAiModelValue, setNewAiModelValue] = useState('');
  const [newIsActiveValue, setNewIsActiveValue] = useState(true);
  const [newPromptThreadItem, setNewPromptThreadItem] = useState('');


  useEffect(() => {
    if (userId) {
      fetchUserPrompts();
    } else {
      setUserPrompts([]);
      setStatusMessage('Enter a User ID to fetch prompts.');
    }
  }, [userId]);

  const fetchUserPrompts = async () => {
    try {
      const res = await fetch(`/api/users/${userId}/prompts`);
      if (res.ok) {
        const data = await res.json();
        setUserPrompts(data);
        setStatusMessage(`Prompts fetched for user: ${userId}`);
      } else {
        const errorData = await res.json();
        console.error('Failed to fetch user prompts:', errorData.error || res.statusText);
        setStatusMessage(`Failed to fetch user prompts: ${errorData.error || res.statusText}`);
        setUserPrompts([]);
      }
    } catch (error) {
      console.error('Error fetching user prompts:', error);
      setStatusMessage(`Error fetching user prompts: ${error.message}`);
      setUserPrompts([]);
    }
  };

  const handleUpdatePromptFields = async () => {
    const defaultDoc = userPrompts[0];
    if (!defaultDoc) {
      setStatusMessage('No default prompt document found to update.');
      return;
    }

    const updatePayload = {};
    if (newAiModelValue) {
      updatePayload.aiModel = newAiModelValue;
    }
    updatePayload.isActive = newIsActiveValue;
    if (newPromptThreadItem) {
      updatePayload.promptThreadToAdd = [newPromptThreadItem];
    }
    updatePayload.timeCreated = new Date();

    try {
      const res = await fetch(`/api/users/${userId}/prompts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Default prompt document updated.`);
        setNewAiModelValue('');
        setNewPromptThreadItem('');
        fetchUserPrompts();
      } else {
        setStatusMessage(`Failed to update prompt fields: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error updating prompt fields: ${error.message}`);
    }
  };

  const handleTamperPrompts = async () => {
    const defaultDoc = userPrompts[0];
    if (!defaultDoc) {
      setStatusMessage('No default prompt document to tamper.');
      return;
    }

    const tamperedData = {
      aiModel: `tampered_model_${Date.now().toString().slice(-4)}`,
      isActive: !defaultDoc.isActive,
      promptThread: [`Tampered thread entry ${Date.now().toString().slice(-4)}`, 'Another tampered entry'],
      timeCreated: new Date(),
      lastTampered: new Date(),
    };

    try {
      const res = await fetch(`/api/users/${userId}/prompts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tamperedData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`Default prompt document updated (tampered).`);
        fetchUserPrompts();
      } else {
        setStatusMessage(`Failed to tamper prompts: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error tampering prompts: ${error.message}`);
    }
  };

  const handleClearPrompts = async () => {
    if (!window.confirm(`Are you sure you want to clear ALL prompt data for this user (resets aiModel, isActive, promptThread)?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${userId}/prompts`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`User prompt document cleared.`);
        fetchUserPrompts();
      } else {
        setStatusMessage(`Failed to clear prompt document: ${data.error}`);
      }
    } catch (error) {
      setStatusMessage(`Error clearing prompt document: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: '#2C3E50', textAlign: 'center', marginBottom: '25px' }}>Test User Prompts API</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Enter User ID (UID)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ flexGrow: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button onClick={fetchUserPrompts} disabled={!userId} style={{
          padding: '10px 15px', backgroundColor: '#3498DB', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
        }}>
          Fetch User Prompts
        </button>
      </div>

      {statusMessage && (
        <p style={{ backgroundColor: '#E7F5FF', border: '1px solid #BEE3F8', padding: '10px', borderRadius: '5px', color: '#2B6CB0', marginBottom: '15px' }}>
          {statusMessage}
        </p>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Modify Default Prompt Document:</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#FDFDFD' }}>
          <h4>Update Fields / Add to Prompt Thread:</h4>
          <input
            type="text"
            placeholder="AI Model (e.g., gemini-2.0-pro)"
            value={newAiModelValue}
            onChange={(e) => setNewAiModelValue(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={newIsActiveValue}
              onChange={(e) => setNewIsActiveValue(e.target.checked)}
            />
            Set Is Active
          </label>
          <input
            type="text"
            placeholder="Add new prompt thread item"
            value={newPromptThreadItem}
            onChange={(e) => setNewPromptThreadItem(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button onClick={handleUpdatePromptFields} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#27AE60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Update Prompt Fields
          </button>

          <h4 style={{ marginTop: '15px' }}>Tamper All Prompt Data:</h4>
          <button onClick={handleTamperPrompts} disabled={!userId} style={{
            padding: '10px 15px', backgroundColor: '#F39C12', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
          }}>
            Tamper Prompt Data
          </button>
        </div>
      </div>

      <div>
        <h3 style={{ color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>Current User Prompts Data (from 'default' document):</h3>
        {userPrompts.length === 0 ? (
          <p>No prompt data found for this user. Ensure 'default' document exists.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {userPrompts.map((promptDoc) => (
              <li key={promptDoc.id} style={{
                border: '1px solid #CFCFCF', padding: '15px', margin: '10px 0', borderRadius: '10px', backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <p><strong>AI Model:</strong> {promptDoc.aiModel || 'N/A'}</p>
                <p><strong>Is Active:</strong> {promptDoc.isActive ? 'Yes' : 'No'}</p>
                <p><strong>Prompt Thread:</strong> {promptDoc.promptThread && promptDoc.promptThread.length > 0 ? promptDoc.promptThread.join(' | ') : 'None'}</p>
               <p>
  <strong>Time Created:</strong>{" "}
  {promptDoc.timeCreated && typeof promptDoc.timeCreated === "object" && typeof promptDoc.timeCreated.seconds === "number"
    ? new Date(promptDoc.timeCreated.seconds * 1000).toLocaleString()
    : promptDoc.timeCreated
      ? promptDoc.timeCreated.toString()
      : "N/A"}
</p>
                <p style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>Document ID: {promptDoc.id}</p>
                <div style={{ marginTop: '15px' }}>
                  <button
                    onClick={handleClearPrompts}
                    style={{ padding: '8px 12px', backgroundColor: '#E74C3C', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    Clear All Prompt Data
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