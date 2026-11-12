import React from 'react';
import OptionItem from './OptionItem';
import Badge from '../common/Badge';
import { Code2, Calculator, Table, Image, Sparkles } from 'lucide-react';

export default function QuestionCard({
  question,
  selectedOptions = [],
  onSelectOption,
  aiResponse,
  disabled = false,
}) {
  if (!question) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
        No active question.
      </div>
    );
  }

  const isMultiple = question.questionType === 'multiple-select';

  // Format code blocks or tables if detected in question text
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Check for markdown code fences ```language ... ```
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isNamedLang = ['javascript', 'python', 'sql', 'html', 'css', 'bash'].includes(firstLine.toLowerCase());
          const codeContent = isNamedLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div
              key={idx}
              style={{
                margin: '1rem 0',
                background: '#0d1117',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #30363d',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  background: '#161b22',
                  borderBottom: '1px solid #30363d',
                  fontSize: '0.6875rem',
                  color: '#8b949e',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                <span>{isNamedLang ? firstLine : 'code'}</span>
                <Code2 size={12} />
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '1rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  color: '#e6edf3',
                  overflowX: 'auto',
                  lineHeight: 1.5,
                }}
              >
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Check for table in text
        if (part.includes('|') && part.includes('---')) {
          const lines = part.trim().split('\n').filter((l) => l.trim().startsWith('|'));
          if (lines.length >= 2) {
            const headers = lines[0].split('|').map((s) => s.trim()).filter(Boolean);
            const rows = lines.slice(2).map((row) =>
              row.split('|').map((s) => s.trim()).filter(Boolean)
            );

            return (
              <div key={idx} style={{ margin: '1rem 0', overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.8125rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <thead>
                    <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
                      {headers.map((h, hIdx) => (
                        <th key={hIdx} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        {r.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        return (
          <p key={idx} style={{ margin: '0.5rem 0', fontSize: '1.0625rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {part}
          </p>
        );
      });
    }

    return (
      <p style={{ margin: '0.5rem 0', fontSize: '1.0625rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
        {text}
      </p>
    );
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Question Header Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--bg-accent)',
            }}
          >
            Question {question.questionNumber}
          </span>
          <Badge variant="accent">
            {question.questionType === 'multiple-select'
              ? 'Multiple-Select'
              : question.questionType === 'true-false'
              ? 'True / False'
              : 'Single Choice (MCQ)'}
          </Badge>
          {question.subject && <Badge variant="default">{question.subject}</Badge>}
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {question.hasCode && (
            <Badge variant="info" icon={Code2}>
              Code
            </Badge>
          )}
          {question.hasMath && (
            <Badge variant="info" icon={Calculator}>
              Math
            </Badge>
          )}
          {question.hasTable && (
            <Badge variant="info" icon={Table}>
              Table
            </Badge>
          )}
        </div>
      </div>

      {/* Question Body Text */}
      <div>{renderFormattedText(question.questionText)}</div>

      {/* Optional Question Image */}
      {question.questionImage && (
        <div style={{ margin: '0.5rem 0', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
          <img
            src={question.questionImage}
            alt="Question reference"
            style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Available Options {isMultiple && '(Select all correct options)'}:
        </span>

        {(question.options || []).map((opt) => {
          const isSelected = selectedOptions.includes(opt.id);
          const optionAnalysis = (aiResponse?.optionAnalysis || []).find((oa) => oa.optionId === opt.id);

          return (
            <OptionItem
              key={opt.id}
              option={opt}
              isSelected={isSelected}
              onSelect={onSelectOption}
              isMultiple={isMultiple}
              disabled={disabled}
              aiAnalysis={optionAnalysis}
            />
          );
        })}
      </div>
    </div>
  );
}
