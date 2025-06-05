// src/app/api/badges/route.js

// Import necessary Firestore functions and the 'db' instance
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase'; // Adjust the path based on your actual project structure
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to retrieve all badge documents.
 * URL: /api/badges
 * @returns {NextResponse} A JSON response containing the badges data or an error message.
 */
export async function GET(request) {
  try {
    // Fetch all documents from the 'badges' collection
    const querySnapshot = await getDocs(collection(db, 'badges'));
    const badges = [];
    querySnapshot.forEach((doc) => {
      // For each document, add its ID and data to the badges array
      badges.push({ id: doc.id, ...doc.data() });
    });

    // Return a successful response with the badges data
    return NextResponse.json(badges, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error getting badges:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to retrieve badges.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to add a new badge document.
 * URL: /api/badges
 * Request Body: { condition: string, description: string, image: string, name: string }
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response with the ID of the newly added badge or an error message.
 */
export async function POST(request) {
  try {
    // Parse the request body to get the badge data
    const badgeData = await request.json();

    // Basic validation (recommended)
    if (!badgeData.name || !badgeData.description || !badgeData.image || !badgeData.condition) {
      return NextResponse.json({ error: 'Missing required badge fields (name, description, image, condition).' }, { status: 400 });
    }

    // Add a new document to the 'badges' collection
    const docRef = await addDoc(collection(db, 'badges'), badgeData);

    // Return a successful response with the ID of the new badge
    return NextResponse.json({ id: docRef.id, message: 'Badge added successfully.' }, { status: 201 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error adding badge:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to add badge.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing badge document.
 * URL: /api/badges?id=[badgeId]
 * Request Body: { fieldToUpdate: newValue }
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the update or an error message.
 */
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required for update.' }, { status: 400 });
    }

    const updatedData = await request.json();
    const badgeRef = doc(db, 'badges', badgeId);
    await updateDoc(badgeRef, updatedData);

    return NextResponse.json({ message: 'Badge updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating badge ${badgeId}:`, error);
    return NextResponse.json({ error: 'Failed to update badge.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a badge document.
 * URL: /api/badges?id=[badgeId]
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the deletion or an error message.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');

    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required for deletion.' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'badges', badgeId));

    return NextResponse.json({ message: 'Badge deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting badge ${badgeId}:`, error);
    return NextResponse.json({ error: 'Failed to delete badge.' }, { status: 500 });
  }
}