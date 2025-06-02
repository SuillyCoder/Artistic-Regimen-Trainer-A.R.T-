// src/components/TestModulesApi.js
'use client';
import { useState, useEffect } from 'react';

export default function TestModulesApi() {
  const [modules, setModules] = useState([]);
  const [addStatus, setAddStatus] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/modules');
      if (res.ok) {
        const data = await res.json();
        setModules(data);
      } else {
        console.error('Failed to fetch modules:', res.status);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleAddModule = async () => {
    const newModule = {
      category: 'Test Category',
      description: 'Test Description',
      title: 'Test Title',
    };
    try {
      const res = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });
      const data = await res.json();
      if (res.ok) {
        setAddStatus(`Module added with ID: ${data.id}`);
        fetchModules(); // Refresh the list
      } else {
        setAddStatus(`Failed to add module: ${data.error}`);
      }
    } catch (error) {
      setAddStatus(`Error adding module: ${error.message}`);
    }
  };

  const handleUpdateModule = async (id) => {
    const updatedModule = {
      description: `Updated description for ID: ${id}`,
    };
    try {
      const res = await fetch(`/api/modules?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedModule),
      });
      const data = await res.json();
      if (res.ok) {
        setUpdateStatus(`Module with ID ${id} updated.`);
        fetchModules(); // Refresh the list
      } else {
        setUpdateStatus(`Failed to update module ${id}: ${data.error}`);
      }
    } catch (error) {
      setUpdateStatus(`Error updating module ${id}: ${error.message}`);
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      const res = await fetch(`/api/modules?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteStatus(`Module with ID ${id} deleted.`);
        fetchModules(); // Refresh the list
      } else {
        setDeleteStatus(`Failed to delete module ${id}: ${data.error}`);
      }
    } catch (error) {
      setDeleteStatus(`Error deleting module ${id}: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Test Modules API</h2>
      <button onClick={fetchModules}>Fetch Modules</button>
      <div>
        <h3>Modules:</h3>
        <ul>
          {modules.map((module) => (
            <li key={module.id}>
              {module.title} ({module.id}) - {module.description} - {module.category}
              <button onClick={() => handleUpdateModule(module.id)}>Update</button>
              <button onClick={() => handleDeleteModule(module.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Add Module</h3>
        <button onClick={handleAddModule}>Add Test Module</button>
        {addStatus && <p>{addStatus}</p>}
      </div>
      <div>
        <h3>Update Status</h3>
        {updateStatus && <p>{updateStatus}</p>}
      </div>
      <div>
        <h3>Delete Status</h3>
        {deleteStatus && <p>{deleteStatus}</p>}
      </div>
    </div>
  );
}