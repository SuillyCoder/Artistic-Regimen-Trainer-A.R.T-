// src/app/challenges/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For navigation after adding

export default function AdminChallengesPage() {
  const [newCategory, setNewCategory] = useState({
    title: '',
    category: '', // This will be the slug (e.g., 'anatomy')
    description: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addStatus, setAddStatus] = useState(''); // For showing success/error of add operation
  const router = useRouter();

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/challenges');
      if (!response.ok) {
        // If 404, it means no categories yet, which is fine
        if (response.status === 404) {
            setCategories([]);
            return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setError("Failed to load existing categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddStatus('');
    try {
      const categorySlug = newCategory.category.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        title: newCategory.title,
        category: categorySlug, // Use the slug for the 'category' field
        description: newCategory.description,
      };

      const response = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setAddStatus('Category added successfully!');
      setNewCategory({ title: '', category: '', description: '' }); // Clear form
      fetchCategories(); // Refresh the list of categories
    } catch (err) {
      console.error("Error adding category:", err);
      setAddStatus(`Error adding category: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Challenge Categories</h1>

      {/* Add New Category Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Challenge Category</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Display Title (e.g., "Anatomy")</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newCategory.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category Slug (e.g., "anatomy" - used in URL & DB ID)</label>
            <input
              type="text"
              id="category"
              name="category"
              value={newCategory.category}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="e.g., anatomy, gesture, perspective"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              rows="3"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Add Category
          </button>
          {addStatus && <p className="mt-2 text-sm text-center">{addStatus}</p>}
        </form>
      </div>

      {/* Existing Categories List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Existing Challenge Categories</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {categories.length === 0 ? (
          <p className="text-gray-500">No categories added yet.</p>
        ) : (
          <ul className="space-y-3">
            {categories.map((cat) => (
              <li key={cat.id} className="border border-gray-200 rounded-md p-3 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{cat.title} ({cat.id})</h3>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                </div>
                <Link href={`/challenges/${cat.id}`} className="text-blue-600 hover:underline">
                  Manage Items &rarr;
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}