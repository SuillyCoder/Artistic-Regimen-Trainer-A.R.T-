// src/app/api/challenges/route.js

// Import necessary Firestore functions and the 'db' instance
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { NextResponse } from 'next/server';

/**
 * Handles GET requests to retrieve all top-level challenge documents.
 * URL: /api/challenges
 * @returns {NextResponse} A JSON response containing the challenges data or an error message.
 */
export async function GET(request) {
  try {
    // Fetch all documents from the 'challenges' collection
    const querySnapshot = await getDocs(collection(db, 'challenges'));
    const challenges = [];
    querySnapshot.forEach((doc) => {
      // For each document, add its ID and data to the challenges array
      challenges.push({ id: doc.id, ...doc.data() });
    });

    // Return a successful response with the challenges data
    return NextResponse.json(challenges, { status: 200 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error getting challenges:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to retrieve challenges.' }, { status: 500 });
  }
}

/**
 * Handles POST requests to add a new top-level challenge document.
 * URL: /api/challenges
 * Request Body: { category: string, description: string, title: string }
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response with the ID of the newly added challenge or an error message.
 */
export async function POST(request) {
  try {
    // Parse the request body to get the challenge data
    const challengeData = await request.json();

    // Add a new document to the 'challenges' collection
    const docRef = await addDoc(collection(db, 'challenges'), challengeData);

    // Return a successful response with the ID of the new challenge
    return NextResponse.json({ id: docRef.id, message: 'Challenge added successfully.' }, { status: 201 });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error adding challenge:', error);
    // Return an error response
    return NextResponse.json({ error: 'Failed to add challenge.' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update an existing top-level challenge document.
 * URL: /api/challenges?id=[challengeId]
 * Request Body: { fieldToUpdate: newValue }
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the update or an error message.
 */
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required for update.' }, { status: 400 });
    }

    const updatedData = await request.json();
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, updatedData);

    return NextResponse.json({ message: 'Challenge updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating challenge ${challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to update challenge.' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a top-level challenge document.
 * URL: /api/challenges?id=[challengeId]
 * @param {Request} request The incoming request object.
 * @returns {NextResponse} A JSON response confirming the deletion or an error message.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('id');

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required for deletion.' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'challenges', challengeId));

    return NextResponse.json({ message: 'Challenge deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting challenge ${challengeId}:`, error);
    return NextResponse.json({ error: 'Failed to delete challenge.' }, { status: 500 });
  }
}