// src/app/api/users/[userId]/prompts/route.js

import { collection, getDoc, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebase'; // Adjust path
import { NextResponse } from 'next/server';

const DEFAULT_DOC_ID = 'default';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    const userPromptsDocRef = doc(db, 'users', userId, 'prompts', DEFAULT_DOC_ID);
    const docSnap = await getDoc(userPromptsDocRef); // Changed from getDocs to getDoc
    if (docSnap.exists()) {
      const data = docSnap.data();
      return NextResponse.json([{ id: DEFAULT_DOC_ID, ...data }], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Default prompt document not found for this user.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting user prompts for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve user prompts.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for update.' }, { status: 400 });
    }
    const updatedData = await request.json();
    const userPromptsDocRef = doc(db, 'users', userId, 'prompts', DEFAULT_DOC_ID);
    const updatePayload = {};

    if (updatedData.promptThreadToAdd && Array.isArray(updatedData.promptThreadToAdd)) {
        updatePayload.promptThread = arrayUnion(...updatedData.promptThreadToAdd);
    } else if (updatedData.promptThread && !updatedData.promptThreadToAdd) {
        updatePayload.promptThread = updatedData.promptThread; // Full array replacement
    }
    
    // Add any other scalar fields that might be updated on the prompt document itself
    Object.assign(updatePayload, updatedData); // This will add any other fields in updatedData to the payload

    await updateDoc(userPromptsDocRef, updatePayload);
    return NextResponse.json({ message: 'Default user prompt document updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user prompt data for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user prompt data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }
    const userPromptsDocRef = doc(db, 'users', userId, 'prompts', DEFAULT_DOC_ID);
    await updateDoc(userPromptsDocRef, {
      aiModel: 'default_model', // Reset to initial default
      isActive: true,         // Reset to initial default
      promptThread: [],       // Clear prompt thread
      timeCreated: new Date(), // Update timestamp
      lastCleared: new Date()
    });
    return NextResponse.json({ message: `User prompt document cleared successfully.` }, { status: 200 });
  } catch (error) {
    console.error(`Error clearing user prompt document for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to clear user prompt document.' }, { status: 500 });
  }
}