// navigation/prompts/page.js
"use client";

import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { doc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { model , listAvailableModels } from '../../../../lib/gemini'; // <--- THIS IS THE KEY CHANGE: Import 'model' from your gemini.js file

export default function PromptsPage() {
  const [user, setUser] = useState(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatThreads, setChatThreads] = useState([]); // List of chat thread summaries (e.g., first prompt)
  const [activeThreadId, setActiveThreadId] = useState(null); // ID of the currently active thread
  const [activeThreadMessages, setActiveThreadMessages] = useState([]); // Messages of the active thread
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null); // Ref for auto-scrolling chat

  // Scroll to bottom of chat whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThreadMessages]);

  // Auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch existing prompt threads for the user
        fetchChatThreads(currentUser.uid);
      } else {
        setChatThreads([]);
        setActiveThreadId(null);
        setActiveThreadMessages([]);
      }
    });
    return () => unsubscribeAuth();
    listAvailableModels(); 
  }, []);

  // Listen for changes in the active chat thread's messages
  useEffect(() => {
    if (!user || !activeThreadId) return;

    const docRef = doc(db, 'users', user.uid, 'prompts', activeThreadId);
    const unsubscribeMessages = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Assuming promptThread is an array of { role: 'user'/'model', parts: [{ text: '...' }] }
        setActiveThreadMessages(data.promptThread || []);
      } else {
        setActiveThreadMessages([]);
      }
    }, (err) => {
      console.error("Error listening to active thread:", err);
      setError("Failed to load chat history for this thread.");
    });

    return () => unsubscribeMessages();
  }, [user, activeThreadId]);

  // Function to fetch chat threads (list of documents in the 'prompts' subcollection)
  const fetchChatThreads = (uid) => {
    const promptsCollectionRef = collection(db, 'users', uid, 'prompts');
    // Order by timeCreated to show latest threads first
    const q = query(promptsCollectionRef, orderBy('timeCreated', 'desc'));

    const unsubscribeThreads = onSnapshot(q, (snapshot) => {
      const threads = snapshot.docs.map(doc => {
        const data = doc.data();
        // Get the first user message as the thread title for display
        const firstMessage = data.promptThread?.[0]?.parts?.[0]?.text || "New Chat";
        return {
          id: doc.id,
          title: firstMessage.length > 50 ? firstMessage.substring(0, 47) + '...' : firstMessage,
          timeCreated: data.timeCreated?.toDate?.() || new Date(), // Convert timestamp to Date object
        };
      });
      setChatThreads(threads);
      // If no active thread is set and threads exist, activate the first one
      if (!activeThreadId && threads.length > 0) {
        setActiveThreadId(threads[0].id);
      }
    }, (err) => {
      console.error("Error fetching chat threads:", err);
      setError("Failed to load chat threads.");
    });

    return () => unsubscribeThreads(); // Cleanup listener on unmount
  };

  // Function to handle sending a message/prompt
  const sendMessage = async () => {
    if (!user || !currentPrompt.trim()) return;
    if (!model) { // Check if model is initialized (from lib/gemini.js)
      setError("Gemini API not initialized. Check your API key or lib/gemini.js setup.");
      return;
    }

    setLoading(true);
    setError(null);

    const userMessage = { role: 'user', parts: [{ text: currentPrompt }] };
    let newThreadId = activeThreadId;
    let newThreadMessages = [...activeThreadMessages, userMessage];

    try {
      if (!activeThreadId) {
        // Create a new chat thread if no active thread
        const newThreadRef = await addDoc(collection(db, 'users', user.uid, 'prompts'), {
          aiModel: 'gemini-pro',
          isActive: true, // You might use this for UI indication
          promptThread: [userMessage], // Start with the user's first message
          timeCreated: serverTimestamp(),
        });
        newThreadId = newThreadRef.id;
        setActiveThreadId(newThreadId);
      } else {
        // Update existing thread with user's message
        await updateDoc(doc(db, 'users', user.uid, 'prompts', activeThreadId), {
          promptThread: arrayUnion(userMessage),
        });
      }

      // Initialize Gemini Chat Session (critical for continuous conversation)
      // Use newThreadMessages here to ensure the chat history sent to Gemini includes the latest user message
      const chat = model.startChat({
        history: newThreadMessages.slice(0, newThreadMessages.length - 1), // Exclude the very last user message as it's sent separately
        generationConfig: {
          maxOutputTokens: 200, // Limit response length
        },
      });

      const result = await chat.sendMessage(currentPrompt); // Send the current user prompt
      const response = await result.response;
      const modelResponse = { role: 'model', parts: [{ text: response.text() }] };

      // Update local state and Firestore with model's response
      newThreadMessages.push(modelResponse); // Add model response to local state immediately (Firestore will update via listener)

      await updateDoc(doc(db, 'users', user.uid, 'prompts', newThreadId), {
        promptThread: arrayUnion(modelResponse),
      });

      setCurrentPrompt(""); // Clear input
    } catch (err) {
      console.error('Error sending message or generating prompt:', err);
      setError("Failed to generate prompt. Please try again. (API Key, network, or Gemini API issue?)");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    setActiveThreadMessages([]);
    setCurrentPrompt("");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
          <h1 className="text-5xl font-extrabold text-fuchsia-400 mb-4">Prompts</h1>
          <p className="text-lg text-gray-300">Please sign in to use the Prompt Generator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex font-inter">
      {/* Sidebar for Chat Threads */}
      <div className="w-1/4 bg-gray-800 p-6 border-r border-gray-700 flex flex-col">
        <h2 className="text-3xl font-bold text-fuchsia-400 mb-6">Your Chats</h2>
        <button
          onClick={startNewChat}
          className="bg-fuchsia-600 text-white py-3 px-4 rounded-lg mb-4 hover:bg-fuchsia-700 transition duration-200 shadow-md"
        >
          + Start New Chat
        </button>
        <div className="flex-grow overflow-y-auto">
          {chatThreads.length > 0 ? (
            <ul>
              {chatThreads.map((thread) => (
                <li key={thread.id} className="mb-2">
                  <button
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`block w-full text-left p-3 rounded-lg hover:bg-gray-700 transition duration-200 ${
                      activeThreadId === thread.id ? 'bg-fuchsia-800' : 'bg-gray-700'
                    }`}
                  >
                    <p className="text-gray-100 font-medium text-sm">
                      {thread.title}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {thread.timeCreated.toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No chat threads yet.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-8">
        <h1 className="text-5xl font-extrabold text-fuchsia-400 mb-6 text-center">
          Prompt Generator
        </h1>
        <p className="text-lg text-gray-300 mb-6 text-center">
          Converse with the AI to get creative drawing prompts!
        </p>

        {error && (
          <div className="bg-red-900 text-red-300 p-4 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 rounded-lg bg-gray-800 mb-6 shadow-inner custom-scrollbar">
          {activeThreadMessages.length > 0 ? (
            activeThreadMessages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-fuchsia-900 text-gray-100 ml-auto rounded-br-none'
                    : 'bg-gray-700 text-gray-200 mr-auto rounded-bl-none'
                }`}
              >
                <p className="font-semibold text-sm mb-1">{msg.role === 'user' ? 'You' : 'AI'}</p>
                <p>{msg.parts[0].text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center text-lg mt-10">
              Start a new conversation or select an existing one from the left.
            </p>
          )}
          <div ref={messagesEndRef} /> {/* Scroll to bottom helper */}
        </div>

        {/* Input area */}
        <div className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg shadow-lg">
          <input
            type="text"
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                sendMessage();
              }
            }}
            placeholder="Enter your prompt or question..."
            className="flex-1 p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-fuchsia-700 transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}