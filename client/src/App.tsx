import React, { useState, useEffect } from 'react';

interface EmotionResponse {
  emotion: string;
  confidence: number;
}

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<EmotionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<EmotionResponse[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const emotionColorMap: { [key: string]: string } = {
    Happy: '#d4edda',
    Sad: '#d1ecf1',
    Anxious: '#fff3cd',
    Angry: '#f8d7da',
    Neutral: '#f5f5f5',
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser doesn't support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setText(spokenText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
      alert('Speech recognition error.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      setError('Please enter your reflection.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('https://emotion-reflection-tool-1.onrender.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setResult(data);
      setHistory((prev) => [data, ...prev]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setText('');
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        maxWidth: '100%',
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Emotion Reflection Tool</h2>

      <form onSubmit={handleSubmit}>
        <textarea
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            fontSize: '1rem',
            resize: 'none',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
          placeholder="How are you feeling?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
              if (submitBtn) submitBtn.click();
            }
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'stretch',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <button
            id="submit-btn"
            type="submit"
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '300px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Submit'}
          </button>

          <button
            type="button"
            onClick={handleMicClick}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '300px',
              border: 'none',
              backgroundColor: isListening ? '#dc3545' : '#6c757d',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            🎙️ {isListening ? 'Listening...' : 'Speak'}
          </button>
        </div>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: emotionColorMap[result.emotion] || '#f8f9fa',
          }}
        >
          <p><strong>Emotion:</strong> {result.emotion}</p>
          <p><strong>Confidence:</strong> {(result.confidence * 100).toFixed(0)}%</p>
        </div>
      )}

      {history.length > 1 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Previous Reflections</h3>
          <ul>
            {history.slice(1).map((item, index) => (
              <li key={index}>
                Emotion: <strong>{item.emotion}</strong> — Confidence: {(item.confidence * 100).toFixed(0)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
