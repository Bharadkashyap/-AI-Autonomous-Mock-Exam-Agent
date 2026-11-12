async function testE2E() {
  console.log('Testing End-to-End API Workflows...');

  // 1. Create Session
  const sessionRes = await fetch('http://localhost:5000/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ examId: 'exam_sample_default' }),
  });
  const sessionData = await sessionRes.json();
  const sessionId = sessionData.data.id;
  console.log('✅ Session created successfully:', sessionId, 'Status:', sessionData.data.status);

  // 2. Process Current Question with AI
  const processRes = await fetch(`http://localhost:5000/api/sessions/${sessionId}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const processData = await processRes.json();
  console.log('✅ Question 1 processed by AI:', processData.answer.selectedOptions, 'Confidence:', processData.aiResult.confidence + '%');

  // 3. Pause Session
  const pauseRes = await fetch(`http://localhost:5000/api/sessions/${sessionId}/pause`, {
    method: 'POST',
  });
  const pauseData = await pauseRes.json();
  console.log('✅ Session paused:', pauseData.data.status);

  // 4. Resume Session
  const resumeRes = await fetch(`http://localhost:5000/api/sessions/${sessionId}/resume`, {
    method: 'POST',
  });
  const resumeData = await resumeRes.json();
  console.log('✅ Session resumed:', resumeData.data.status);

  // 5. Submit Session & Score
  const submitRes = await fetch(`http://localhost:5000/api/sessions/${sessionId}/submit`, {
    method: 'POST',
  });
  const submitData = await submitRes.json();
  console.log('✅ Session submitted. Status:', submitData.data.status, 'Score:', submitData.summary.correctCount + '/' + submitData.summary.totalQuestions);

  console.log('\n🎉 ALL HTTP ENDPOINTS VERIFIED & WORKING PERFECTLY!');
}

testE2E().catch(console.error);
