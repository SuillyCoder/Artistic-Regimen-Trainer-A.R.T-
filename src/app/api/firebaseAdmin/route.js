import admin from '../../../../lib/firebaseAdmin';

export async function GET(req) {
  try {
    // Example: verify token from Authorization header
    const authHeader = req.headers.get('authorization') || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!idToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Fetch user data or perform admin tasks
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ user: userDoc.data() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 401 });
  }
}
