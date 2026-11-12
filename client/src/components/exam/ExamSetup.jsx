import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  Play,
  Trash2,
  Sparkles,
  BookOpen,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useExams } from '../../hooks/useExams';
import { startSession } from '../../services/api';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import toast from 'react-hot-toast';

export default function ExamSetup() {
  const navigate = useNavigate();
  const { exams, loading, createExam, deleteExam, seedExam } = useExams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startingId, setStartingId] = useState(null);

  // Form State for creating custom exam
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);

  const handleStart = async (examId) => {
    try {
      setStartingId(examId);
      const res = await startSession(examId);
      toast.success('Exam session created!');
      navigate(`/session/${res.data._id || res.data.id}`);
    } catch (err) {
      toast.error('Failed to start session');
    } finally {
      setStartingId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      return toast.error('Exam title is required');
    }

    try {
      await createExam({
        title,
        subject,
        description,
        timeLimit: Number(timeLimit),
        questions: [
          {
            questionNumber: 1,
            questionText: 'Which data structure follows the First-In, First-Out (FIFO) principle?',
            questionType: 'mcq',
            options: [
              { id: 'A', text: 'Stack', isSelected: false },
              { id: 'B', text: 'Queue', isSelected: false },
              { id: 'C', text: 'Tree', isSelected: false },
              { id: 'D', text: 'Graph', isSelected: false },
            ],
            correctAnswer: ['B'],
            subject: 'Computer Science',
            difficulty: 'easy',
          },
          {
            questionNumber: 2,
            questionText: 'Which HTTP methods are typically considered idempotent? (Select all that apply)',
            questionType: 'multiple-select',
            options: [
              { id: 'A', text: 'GET', isSelected: false },
              { id: 'B', text: 'POST', isSelected: false },
              { id: 'C', text: 'PUT', isSelected: false },
              { id: 'D', text: 'DELETE', isSelected: false },
            ],
            correctAnswer: ['A', 'C', 'D'],
            subject: 'Web Development',
            difficulty: 'medium',
          },
        ],
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      // error handled in hook
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading Practice Exams..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Mock Examination Catalog
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Select an authorized practice exam to launch the autonomous AI agent.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => seedExam()}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={16} color="var(--bg-accent)" />
            <span>Load 15-Question Sample</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'var(--gradient-primary)',
              color: '#fff',
              border: 'none',
              padding: '0.625rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <PlusCircle size={16} />
            <span>Create Custom Exam</span>
          </button>
        </div>
      </div>

      {/* Exam Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {exams.map((exam) => (
          <div
            key={exam._id || exam.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <Badge variant="accent">{exam.subject || 'General'}</Badge>
                {exam._id !== 'exam_sample_default' && (
                  <button
                    onClick={() => deleteExam(exam._id || exam.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-tertiary)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    title="Delete Exam"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {exam.title}
              </h3>
              <p
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  minHeight: '2.5rem',
                }}
              >
                {exam.description || 'Comprehensive evaluation covering multiple subject domains.'}
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-primary)',
                  marginBottom: '1.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Layers size={14} />
                  <span>{exam.totalQuestions || 0} Questions</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} />
                  <span>{exam.timeLimit || 45} Minutes</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStart(exam._id || exam.id)}
              disabled={startingId === (exam._id || exam.id)}
              style={{
                width: '100%',
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              }}
            >
              <Play size={15} fill="#fff" />
              <span>{startingId === (exam._id || exam.id) ? 'Initializing Agent...' : 'Launch AI Agent'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Modal for Creating Custom Exam */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Practice Examination">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Exam Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Algorithms"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Subject Domain
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Time Limit (mins)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the exam scope..."
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-primary)',
                color: 'var(--text-secondary)',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create Exam
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
