'use client';

import React, { useState } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';

const NlpEntryInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch('/api/nlp-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(`Success: ${JSON.stringify(data.data)}`);
        setMessage('');
        useCalendarStore.getState().fetchInitialData(); // Call fetchInitialData after successful NLP operation
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error: unknown) {
      setResponse(`Network error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
      <h3 className="font-semibold text-lg mb-2">Natural Language Entry</h3>
      <textarea
        className="w-full p-2 border rounded-md mb-2 dark:bg-gray-700 dark:text-white"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g., 'I planned 8 hours and logged 6 hours for today' or 'Target 7 hours for tomorrow'"
      />
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
      >
        {loading ? 'Processing...' : 'Create Entry'}
      </button>
      {response && (
        <div className="mt-2 p-2 text-sm rounded-md bg-gray-100 dark:bg-gray-700 dark:text-white">
          {response}
        </div>
      )}
    </div>
  );
};

export default NlpEntryInput;
