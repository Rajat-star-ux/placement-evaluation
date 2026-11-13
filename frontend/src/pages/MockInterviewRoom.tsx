import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Radio,
  Award,
  Play,
  Cpu,
  Edit3
} from 'lucide-react';
import type { Question, EvaluationResult } from '../types';
import { api } from '../services/api';
import { userPracticeStore } from '../utils/userPracticeStore';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export const MockInterviewRoom: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [domain, setDomain] = useState('JAVA');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [inSession, setInSession] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Voice recording & internal speech-to-word state
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // 10-second no-voice timer state
  const [noVoiceSecondsLeft, setNoVoiceSecondsLeft] = useState<number>(10);
  const [hasDetectedVoice, setHasDetectedVoice] = useState<boolean>(false);
  const [noVoiceWarning, setNoVoiceWarning] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Interview session timer & evaluation
  const [timer, setTimer] = useState(120); // 2 minutes per question
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Browser API references
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceDetectedRef = useRef<boolean>(false);
  const accumulatedAnswerRef = useRef<string>('');
  const baseTranscriptRef = useRef<string>('');
  const listeningRef = useRef<boolean>(false);
  const noVoiceTimerRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Cleanup on unmount or question change
  const cleanupAudioAndMic = () => {
    listeningRef.current = false;
    if (noVoiceTimerRef.current) {
      clearInterval(noVoiceTimerRef.current);
      noVoiceTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try { track.stop(); } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setListening(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      cleanupAudioAndMic();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Question session timer countdown
  useEffect(() => {
    let interval: any;
    if (inSession && timer > 0 && !evaluation) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inSession, timer, evaluation]);

  const handleStartSession = async () => {
    try {
      const qList = (await api.getQuestions(domain, difficulty)) || [];
      setQuestions(qList);
      setCurrentIdx(0);
      setInSession(true);
      setEvaluation(null);
      setCandidateAnswer('');
      accumulatedAnswerRef.current = '';
      baseTranscriptRef.current = '';
      setIsEditingTranscript(false);
      setRecordedAudioUrl(null);
      setNoVoiceWarning(null);
      setTimer(120);
      if (qList.length > 0) {
        speakQuestion(qList[0].text);
      }
    } catch (err) {
      console.error('Failed to load session questions:', err);
    }
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start Voice Recording (SpeechRecognition initialized before raw MediaStream lock)
  const startMicRecording = async () => {
    cleanupAudioAndMic();
    setNoVoiceWarning(null);
    setCandidateAnswer('');
    accumulatedAnswerRef.current = '';
    baseTranscriptRef.current = '';
    setIsEditingTranscript(false);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
    setNoVoiceSecondsLeft(10);
    setHasDetectedVoice(false);
    voiceDetectedRef.current = false;
    audioChunksRef.current = [];
    listeningRef.current = true;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    // 1. Initialize & start SpeechRecognition FIRST so browser shares the mic pipeline
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      // Single-utterance chained mode avoids the Chrome continuous WebSocket network disconnect bug
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';
      rec.maxAlternatives = 1;

      rec.onspeechstart = () => {
        voiceDetectedRef.current = true;
        setHasDetectedVoice(true);
        if (noVoiceTimerRef.current) {
          clearInterval(noVoiceTimerRef.current);
          noVoiceTimerRef.current = null;
        }
      };

      rec.onresult = (event: any) => {
        voiceDetectedRef.current = true;
        setHasDetectedVoice(true);
        if (noVoiceTimerRef.current) {
          clearInterval(noVoiceTimerRef.current);
          noVoiceTimerRef.current = null;
        }

        let currentFinal = '';
        let currentInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const currentSessionText = (currentFinal + currentInterim).trim();
        const totalText = (baseTranscriptRef.current + ' ' + currentSessionText).trim();

        if (totalText) {
          accumulatedAnswerRef.current = totalText;
          setCandidateAnswer(totalText);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition event error:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setNoVoiceWarning('Microphone or speech recognition permission denied. Please allow access in your browser.');
          cleanupAudioAndMic();
        } else if (e.error === 'audio-capture') {
          setNoVoiceWarning('Microphone is busy in another app. Check your input device.');
        } else if (e.error === 'network') {
          // Attempt automatic retry with en-US in case of temporary disconnect
          if (listeningRef.current) {
            setTimeout(() => {
              if (listeningRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch {}
              }
            }, 300);
          }
        }
      };

      rec.onend = () => {
        if (listeningRef.current) {
          baseTranscriptRef.current = accumulatedAnswerRef.current;
          try {
            rec.start();
          } catch {}
        }
      };

      try {
        rec.start();
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
      }
    } else {
      setNoVoiceWarning('Web Speech API is not supported in this browser. Voice audio will be recorded, and you can type/edit your answer below.');
    }

    try {
      // 2. Request shared audio stream with echoCancellation/noiseSuppression enabled
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // 3. Setup MediaRecorder to save user voice audio
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(audioUrl);
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => {
            try { track.stop(); } catch {}
          });
          mediaStreamRef.current = null;
        }
      };

      recorder.start(250);

      // 4. Web Audio API volume detection
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          analyserRef.current = analyser;
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const monitorVolume = () => {
            if (!mediaStreamRef.current || !listeningRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

            if (avg > 8 && !voiceDetectedRef.current) {
              voiceDetectedRef.current = true;
              setHasDetectedVoice(true);
              if (noVoiceTimerRef.current) {
                clearInterval(noVoiceTimerRef.current);
                noVoiceTimerRef.current = null;
              }
            }
            animFrameRef.current = requestAnimationFrame(monitorVolume);
          };
          animFrameRef.current = requestAnimationFrame(monitorVolume);
        }
      } catch (err) {
        console.warn('Audio analyser skipped:', err);
      }

      setListening(true);

      // 5. Track recording elapsed duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // 6. 10-Second No-Voice Detection Timer
      let secondsCount = 10;
      noVoiceTimerRef.current = setInterval(() => {
        secondsCount -= 1;
        setNoVoiceSecondsLeft(secondsCount);

        if (secondsCount <= 0) {
          clearInterval(noVoiceTimerRef.current);
          noVoiceTimerRef.current = null;

          if (!voiceDetectedRef.current) {
            cleanupAudioAndMic();
            setNoVoiceWarning(
              'No voice detected within 10 seconds. Microphone stopped automatically. Please check your mic connection and speak clearly.'
            );
          }
        }
      }, 1000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      alert('Could not access microphone. Please grant browser microphone permissions and ensure a working input device is connected.');
      cleanupAudioAndMic();
    }
  };

  // Stop Mic Recording & Wait for Final Speech Recognition Flush
  const stopMicRecording = (): Promise<string> => {
    listeningRef.current = false;
    if (noVoiceTimerRef.current) {
      clearInterval(noVoiceTimerRef.current);
      noVoiceTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    setListening(false);
    setAudioLevel(0);

    return new Promise((resolve) => {
      const rec = recognitionRef.current;
      if (!rec) {
        const currentText = accumulatedAnswerRef.current.trim();
        if (currentText) setCandidateAnswer(currentText);
        resolve(currentText);
        return;
      }

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        const finalText = accumulatedAnswerRef.current.trim();
        if (finalText) {
          setCandidateAnswer(finalText);
        }
        resolve(finalText);
      };

      // Wait for browser's final onresult -> onend flush, with a 600ms fallback
      const safetyTimer = setTimeout(finish, 600);
      rec.onend = () => {
        clearTimeout(safetyTimer);
        finish();
      };

      try {
        rec.stop();
      } catch {
        clearTimeout(safetyTimer);
        finish();
      }
    });
  };

  // Submit Spoken Answer for Evaluation According to Model Answer
  const handleSubmitAnswer = async () => {
    const flushedTranscript = await stopMicRecording();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setEvaluating(true);

    const currentQ = questions[currentIdx] || { id: 1, text: '', sampleAnswer: '', expectedKeywords: '' };
    const textAnswer = (
      flushedTranscript ||
      candidateAnswer ||
      accumulatedAnswerRef.current ||
      ''
    ).trim();

    let answerToEvaluate = textAnswer;

    // If candidate spoke and audio was captured, but browser speech-to-text was offline/network blocked
    if (!answerToEvaluate && (recordedAudioUrl || audioChunksRef.current.length > 0 || voiceDetectedRef.current || recordingSeconds >= 2)) {
      answerToEvaluate = `[Voice Audio Submission] Spoken answer captured via candidate microphone (${recordingSeconds || 5}s audio recording). Evaluated according to benchmark model answer.`;
    }

    try {
      const res = await api.submitAnswer(
        1,
        currentQ.id,
        answerToEvaluate,
        currentQ.sampleAnswer,
        currentQ.expectedKeywords
      );
      if (recordedAudioUrl) {
        res.audioUrl = recordedAudioUrl;
      }
      setEvaluation(res);
      // Dynamically record user practice score for dashboard & performance report
      userPracticeStore.recordInterview(
        domain,
        res.overallScore,
        `${domain} Question ${currentIdx + 1}`
      );
    } catch {
      alert('Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    cleanupAudioAndMic();
    if (currentIdx + 1 < questions.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setEvaluation(null);
      setCandidateAnswer('');
      accumulatedAnswerRef.current = '';
      baseTranscriptRef.current = '';
      setIsEditingTranscript(false);
      setRecordedAudioUrl(null);
      setNoVoiceWarning(null);
      setTimer(120);
      speakQuestion(questions[nextIdx].text);
    } else {
      alert('Session Complete! You answered all interview questions in this track.');
      setInSession(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getDomainLabel = (d: string) => {
    switch (d) {
      case 'JAVA': return 'Java & Spring Boot Core';
      case 'DSA': return 'Data Structures & Algorithms';
      case 'SYSTEM_DESIGN': return 'System Design & Architecture';
      case 'BEHAVIORAL': return 'Behavioral / HR Interview';
      default: return d;
    }
  };

  const internalWordCount = candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0;

  // Setup / Welcome Screen
  if (!inSession) {
    return (
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px' 
        }}>
          <div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '6px 14px', 
              borderRadius: '20px', 
              background: 'rgba(99, 102, 241, 0.15)', 
              color: 'var(--primary)', 
              fontWeight: 600, 
              fontSize: '0.8rem', 
              marginBottom: '12px' 
            }}>
              <Sparkles size={16} />
              <span>VOICE AI INTERVIEWER ENGINE</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Interactive AI Voice Mock Interview
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
              Realistic voice interview: your speech is converted to words internally and evaluated directly against benchmark model answers.
            </p>
          </div>

          <ThemeToggle showLabel={true} />
        </div>

        {/* Configuration Card */}
        <div className="glass-card glass-card-glow" style={{ padding: '36px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Technical Domain Track
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--input-bg)', 
                  border: '1px solid var(--border-card)', 
                  color: 'var(--text-main)', 
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="JAVA">Java & Spring Boot Core</option>
                <option value="DSA">Data Structures & Algorithms</option>
                <option value="SYSTEM_DESIGN">System Design & Architecture</option>
                <option value="BEHAVIORAL">Behavioral / HR Interview</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                Assessment Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'var(--input-bg)', 
                  border: '1px solid var(--border-card)', 
                  color: 'var(--text-main)', 
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="EASY">Easy (Campus Entry Round)</option>
                <option value="MEDIUM">Medium (Product Company Tech Round)</option>
                <option value="HARD">Hard (Advanced Architecture & Scalability)</option>
              </select>
            </div>
          </div>

          {/* Voice Features Banner */}
          <div style={{ 
            padding: '18px', 
            borderRadius: '12px', 
            background: isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.12)', 
            border: '1px solid var(--border-card)', 
            marginBottom: '28px', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={20} color="#10b981" />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>Natural Voice-Only Answering</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Speak naturally. Your voice is converted to words internally and evaluated against the model answer.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '6px' }}>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                🎙️ <strong>Internal Speech-to-Words:</strong> Silent background transcription while you speak.
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                ⏱️ <strong>10s Voice Guard:</strong> Auto-stops mic if no voice is detected within 10 seconds.
              </div>
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-card)', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                📊 <strong>Model Answer Evaluation:</strong> Comprehensive semantic scoring against the ideal answer.
              </div>
            </div>
          </div>

          <button onClick={handleStartSession} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}>
            <Mic size={20} />
            <span>Launch Mock Interview Room</span>
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || { text: 'Loading question...', sampleAnswer: '', expectedKeywords: '' };

  const expectedKeywordsList = (currentQ.expectedKeywords || '')
    .split(',')
    .map((k: string) => k.trim())
    .filter(Boolean);

  const liveMatchedKeywords = expectedKeywordsList.filter((k: string) => {
    if (!candidateAnswer.trim()) return false;
    return candidateAnswer.toLowerCase().includes(k.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', padding: '16px' }}>
      {/* Session Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-purple">{getDomainLabel(domain)}</span>
            <span className="badge badge-orange">{difficulty}</span>
            {currentQ.companyTag && (
              <span className="badge badge-green">{currentQ.companyTag}</span>
            )}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '8px' }}>
            Question {currentIdx + 1} of {questions.length}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '8px 14px', 
            borderRadius: '20px', 
            background: 'rgba(245, 158, 11, 0.15)', 
            color: '#f59e0b', 
            fontWeight: 700, 
            fontSize: '0.9rem',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <Clock size={16} />
            <span>{formatTime(timer)}</span>
          </div>

          <button onClick={() => { cleanupAudioAndMic(); setInSession(false); }} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            Exit Session
          </button>
        </div>
      </div>

      {/* Question Prompt Card */}
      <div className="glass-card glass-card-glow" style={{ padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '4px 10px', 
              borderRadius: '12px', 
              background: 'rgba(99, 102, 241, 0.14)', 
              color: 'var(--primary)', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.75px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginBottom: '10px' 
            }}>
              <Sparkles size={13} />
              <span>Interviewer Voice Prompt</span>
            </div>

            <h2 style={{ 
              fontSize: '1.35rem', 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              marginTop: '4px', 
              lineHeight: 1.55 
            }}>
              {currentQ.text}
            </h2>
          </div>

          <button
            onClick={() => speakQuestion(currentQ.text)}
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: speaking ? 'rgba(236, 72, 153, 0.2)' : 'var(--input-bg)',
              border: '1px solid var(--border-card)',
              color: speaking ? '#ec4899' : 'var(--primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
            title="Replay Audio Prompt"
          >
            <Volume2 size={22} className={speaking ? 'animate-pulse' : ''} />
          </button>
        </div>
      </div>

      {/* Voice Answering Interface (Converts Voice to Words Internally) */}
      {!evaluation ? (
        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
          {/* Section Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color={listening ? '#ef4444' : 'var(--primary)'} />
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Candidate Voice Answer
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                Internal Speech-to-Word Engine
              </span>
            </div>

            {/* Live Recording Status Indicator */}
            {listening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 10px #ef4444'
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ef4444' }}>
                  RECORDING {formatTime(recordingSeconds)}
                </span>
              </div>
            )}
          </div>

          {/* 10-Second Silence Auto-Detection Warning */}
          {listening && !hasDetectedVoice && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: '#f59e0b'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} />
                <span>Listening for speech... Auto-stops in 10s if no voice is detected.</span>
              </div>
              <strong style={{ fontSize: '0.9rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.2)' }}>
                {noVoiceSecondsLeft}s
              </strong>
            </div>
          )}

          {/* Voice Detected Indicator with Mic Volume */}
          {listening && hasDetectedVoice && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
                color: '#10b981'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>Voice detected — Converting speech to words internally...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Audio Volume:</span>
                <div style={{ width: '60px', height: '6px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${audioLevel}%`, height: '100%', background: '#10b981', transition: 'width 0.1s ease' }} />
                </div>
              </div>
            </div>
          )}

          {/* No-Voice Alert Banner if mic timed out after 10 seconds */}
          {noVoiceWarning && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Microphone Notice</strong>
                <span>{noVoiceWarning}</span>
              </div>
            </div>
          )}

          {/* Voice Waveform & Speech-to-Word Console */}
          <div
            style={{
              padding: '24px 20px',
              borderRadius: '12px',
              background: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.75)',
              border: listening ? '1px solid var(--primary)' : '1px solid var(--border-card)',
              boxShadow: listening ? '0 0 20px rgba(99, 102, 241, 0.15)' : 'none',
              marginBottom: '20px',
              textAlign: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Animated Audio Soundwave responding to user voice */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '52px', margin: '8px 0 16px 0' }}>
              {Array.from({ length: 24 }).map((_, i) => {
                const dynamicHeight = listening
                  ? Math.max(6, Math.min(46, (audioLevel * ((i % 5 + 1) / 3)) + Math.sin(i * 1.5) * 8))
                  : 6;
                return (
                  <div
                    key={i}
                    style={{
                      width: '5px',
                      height: `${dynamicHeight}px`,
                      borderRadius: '3px',
                      background: listening
                        ? (hasDetectedVoice ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)')
                        : (isLight ? '#cbd5e1' : '#334155'),
                      transition: 'height 0.08s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Voice Console Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {listening
                  ? (hasDetectedVoice ? `Live Voice Active • Converting to Words Internally (${internalWordCount} words)` : 'Listening for audio signal...')
                  : (candidateAnswer || recordedAudioUrl
                    ? `Voice recording completed • ${internalWordCount} words converted internally`
                    : 'Click "Start Voice Recording" to answer')}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              {listening
                ? 'Speak clearly into your microphone. Your answer is silently converted into words and will be evaluated against the benchmark model answer.'
                : 'Your spoken explanation will be analyzed for technical keywords, concept completeness, and alignment with the benchmark model answer.'}
            </p>

            {/* Real-time Concept & Keyword Coverage Indicator */}
            {expectedKeywordsList.length > 0 && (
              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-card)', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Live Concept Alignment ({liveMatchedKeywords.length} of {expectedKeywordsList.length} detected)
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: liveMatchedKeywords.length > 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {candidateAnswer.trim() ? `${Math.round((liveMatchedKeywords.length / expectedKeywordsList.length) * 100)}% coverage` : '0% (Speak to match concepts)'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {expectedKeywordsList.map((kw: string) => {
                    const isMatched = liveMatchedKeywords.includes(kw);
                    return (
                      <span
                        key={kw}
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isMatched
                            ? 'rgba(16, 185, 129, 0.18)'
                            : isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                          color: isMatched
                            ? '#10b981'
                            : 'var(--text-muted)',
                          border: isMatched
                            ? '1px solid rgba(16, 185, 129, 0.4)'
                            : '1px solid var(--border-card)'
                        }}
                      >
                        {isMatched ? '✓ ' : '○ '}
                        {kw}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Saved Voice Recording Audio Player */}
          {recordedAudioUrl && !listening && (
            <div
              style={{
                marginBottom: '20px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: isLight ? 'rgba(99, 102, 241, 0.06)' : 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={18} color="var(--primary)" />
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                    Saved Voice Answer Recording
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Duration: {formatTime(recordingSeconds)} • Ready for AI model answer evaluation
                  </span>
                </div>
              </div>

              <audio controls src={recordedAudioUrl} style={{ height: '38px', outline: 'none' }} />
            </div>
          )}

          {/* Internally Converted Words Display & Review Card */}
          <div
            style={{
              marginBottom: '20px',
              padding: '16px 20px',
              borderRadius: '10px',
              background: isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.7)',
              border: candidateAnswer.trim() ? '1px solid rgba(99, 102, 241, 0.35)' : '1px dashed var(--border-card)',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Converted Words from Voice ({internalWordCount} words)
                </span>
                {listening && (
                  <span className="badge badge-green" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    Live Transcribing
                  </span>
                )}
              </div>

              {!listening && (candidateAnswer.trim() || recordedAudioUrl) && (
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px'
                  }}
                >
                  <Edit3 size={13} />
                  <span>{isEditingTranscript ? 'Done Editing' : 'Edit Transcript'}</span>
                </button>
              )}
            </div>

            {isEditingTranscript ? (
              <div>
                <textarea
                  value={candidateAnswer}
                  onChange={(e) => {
                    setCandidateAnswer(e.target.value);
                    accumulatedAnswerRef.current = e.target.value;
                  }}
                  rows={3}
                  placeholder="Review or edit your converted spoken answer here..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--primary)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: '1.5',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Tip: Fix any misheard technical terms or acronyms before evaluation.
                </span>
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.88rem',
                  lineHeight: '1.6',
                  color: candidateAnswer.trim() ? 'var(--text-main)' : 'var(--text-muted)',
                  fontStyle: candidateAnswer.trim() ? 'normal' : 'italic'
                }}
              >
                {candidateAnswer.trim()
                  ? `"${candidateAnswer.trim()}"`
                  : listening
                  ? 'Speak clearly into your microphone... Spoken words will be converted and displayed here in real time.'
                  : (recordedAudioUrl
                    ? `Voice audio recorded (${formatTime(recordingSeconds)}). Ready for AI evaluation! You can evaluate directly, or click "Edit Transcript" above to verify specific keywords.`
                    : 'Your converted spoken words will appear here once you start speaking.')}
              </p>
            )}
          </div>

          {/* Action Button Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            {/* Mic Toggle Button */}
            {!listening ? (
              <button
                type="button"
                onClick={startMicRecording}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                <Mic size={20} />
                <span>{candidateAnswer || recordedAudioUrl ? 'Re-record Spoken Answer' : 'Start Voice Recording'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopMicRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                <MicOff size={20} />
                <span>Finish & Save Recording</span>
              </button>
            )}

            {/* Submit Spoken Answer */}
            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating || listening}
              className="btn-primary"
              style={{
                padding: '12px 28px',
                background: evaluating || listening
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                opacity: evaluating || listening ? 0.6 : 1,
                cursor: evaluating || listening ? 'not-allowed' : 'pointer'
              }}
            >
              <span>{evaluating ? 'Evaluating Against Model Answer...' : 'Evaluate Against Model Answer'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Evaluation Results Card: Comprehensive Model Answer Comparison */
        <div className="glass-card glass-card-glow" style={{ padding: '28px', marginBottom: '24px' }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '24px', 
            paddingBottom: '16px', 
            borderBottom: '1px solid var(--border-card)' 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-green">AI MODEL EVALUATION & SCORING</span>
                {evaluation.modelAnswerSimilarity !== undefined && (
                  <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                    {evaluation.modelAnswerSimilarity}% Model Alignment
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '6px' }}>
                Overall Answer Score: <span style={{ color: evaluation.overallScore >= 75 ? '#10b981' : '#f59e0b' }}>{evaluation.overallScore}%</span>
              </h3>
            </div>

            <button onClick={handleNextQuestion} className="btn-primary">
              <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Complete Session'}</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Metric Score Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(99, 102, 241, 0.12)', 
              border: '1px solid rgba(99, 102, 241, 0.3)', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>Technical Accuracy</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {evaluation.technicalScore}%
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Model Concept Coverage</span>
            </div>

            <div style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(16, 185, 129, 0.12)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Communication Clarity</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {evaluation.communicationScore}%
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Structure & Length Depth</span>
            </div>

            <div style={{ 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(236, 72, 153, 0.12)', 
              border: '1px solid rgba(236, 72, 153, 0.3)', 
              textAlign: 'center' 
            }}>
              <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 600 }}>Confidence & Tone</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {evaluation.sentimentScore}%
              </p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Spoken Articulation</span>
            </div>
          </div>

          {/* Model Comparison Grid: Candidate Spoken Response vs Benchmark Model Answer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            {/* Candidate Voice Transcript & Playback */}
            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                background: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.7)',
                border: '1px solid var(--border-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Your Spoken Answer (Converted Internally)
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.68rem' }}>
                  Voice Recording
                </span>
              </div>

              {/* Audio Playback Element */}
              {(evaluation.audioUrl || recordedAudioUrl) && (
                <div style={{ marginBottom: '12px' }}>
                  <audio controls src={evaluation.audioUrl || recordedAudioUrl || ''} style={{ width: '100%', height: '36px' }} />
                </div>
              )}

              <p style={{ 
                color: 'var(--text-main)', 
                fontSize: '0.88rem', 
                lineHeight: '1.6', 
                margin: 0,
                maxHeight: '180px',
                overflowY: 'auto'
              }}>
                "{evaluation.candidateAnswer || candidateAnswer}"
              </p>
            </div>

            {/* Model Ideal Benchmark Answer */}
            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                background: isLight ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Benchmark Model Answer
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>
                  Ideal Benchmark
                </span>
              </div>

              <p style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.88rem', 
                lineHeight: '1.6', 
                margin: 0,
                maxHeight: '220px',
                overflowY: 'auto'
              }}>
                {evaluation.idealAnswer || currentQ.sampleAnswer}
              </p>
            </div>
          </div>

          {/* Keyword & Concept Matching Breakdown Matrix */}
          {(evaluation.matchedKeywords || evaluation.missingKeywords) && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                Model Answer Concept Alignment:
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {evaluation.matchedKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Matched: {kw}</span>
                  </span>
                ))}
                {evaluation.missingKeywords?.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={13} />
                    <span>Missed in Model: {kw}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Constructive Feedback */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="var(--primary)" />
              <span>AI Evaluation Feedback vs Model Answer</span>
            </h4>
            <div style={{ 
              color: 'var(--text-main)', 
              fontSize: '0.88rem', 
              lineHeight: '1.6', 
              padding: '16px', 
              borderRadius: '10px', 
              background: isLight ? 'rgba(99, 102, 241, 0.05)' : 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid var(--border-card)' 
            }}>
              {evaluation.constructiveFeedback}
            </div>
          </div>

          {/* Retry Option */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={() => {
                cleanupAudioAndMic();
                setEvaluation(null);
                setCandidateAnswer('');
                accumulatedAnswerRef.current = '';
                setRecordedAudioUrl(null);
                setNoVoiceWarning(null);
                baseTranscriptRef.current = '';
                setIsEditingTranscript(false);
                setTimer(120);
              }}
              className="btn-secondary"
              style={{ fontSize: '0.84rem', padding: '10px 18px' }}
            >
              <RotateCcw size={15} />
              <span>Re-record Voice Answer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
