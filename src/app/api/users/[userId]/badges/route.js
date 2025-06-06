// src/app/api/users/[userId]/badges/route.js

import { collection, getDocs, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase'; // Adjust path
import { NextResponse } from 'next/server';

const DEFAULT_DOC_ID = 'default';

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }
    const userBadgeDocRef = doc(db, 'users', userId, 'badges', DEFAULT_DOC_ID);
    const docSnap = await getDoc(userBadgeDocRef); // Changed from getDocs to getDoc
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Return the default document's data as an array for consistency with other lists
      return NextResponse.json([{ id: DEFAULT_DOC_ID, ...data }], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Default badge document not found for this user.' }, { status: 404 });
    }
  } catch (error) {
    console.error(`Error getting user badges for user ${params.userId}:`, error);
    return NextResponse.json({ error: 'Failed to retrieve user badges.' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for update.' }, { status: 400 });
    }
    const updatedData = await request.json();
    const userBadgeDocRef = doc(db, 'users', userId, 'badges', DEFAULT_DOC_ID);
    const updatePayload = {};
    if (updatedData.newBadgeID) { // Client wants to add a new badge ID to the list
      updatePayload.badgeList = arrayUnion(updatedData.newBadgeID);
      updatePayload.lastUpdated = new Date(); // Add timestamp
    } else { // General update to scalar fields or full array replacement
      Object.assign(updatePayload, updatedData);
    }
    await updateDoc(userBadgeDocRef, updatePayload);
    return NextResponse.json({ message: 'User badge document updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating user badge data for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update user badge data.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required for deletion.' }, { status: 400 });
    }
    const userBadgeDocRef = doc(db, 'users', userId, 'badges', DEFAULT_DOC_ID);
    await updateDoc(userBadgeDocRef, {
      badgeList: [],       // Reset the list of badges
      fulfilled: false,    // Reset fulfilled status
      lastCleared: new Date() // Add a timestamp for clarity
    });
    return NextResponse.json({ message: `User badge document cleared successfully.` }, { status: 200 });
  } catch (error) {
    console.error(`Error clearing user badge document for user ${userId}:`, error);
    return NextResponse.json({ error: 'Failed to clear user badge document.' }, { status: 500 });
  }
}