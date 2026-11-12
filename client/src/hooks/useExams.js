import { useState, useEffect, useCallback } from 'react';
import { getExams, createExam, deleteExam, seedExam } from '../services/api';
import toast from 'react-hot-toast';

export function useExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getExams();
      setExams(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleCreateExam = async (examData) => {
    try {
      const res = await createExam(examData);
      toast.success('Exam created successfully!');
      await fetchExams();
      return res.data;
    } catch (err) {
      toast.error('Failed to create exam');
      throw err;
    }
  };

  const handleDeleteExam = async (id) => {
    try {
      await deleteExam(id);
      toast.success('Exam deleted');
      setExams((prev) => prev.filter((e) => e._id !== id && e.id !== id));
    } catch (err) {
      toast.error('Failed to delete exam');
      throw err;
    }
  };

  const handleSeedExam = async (id = 'seed') => {
    try {
      setLoading(true);
      const res = await seedExam(id);
      toast.success('Sample practice exam loaded!');
      await fetchExams();
      return res.data;
    } catch (err) {
      toast.error('Failed to load sample exam');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    exams,
    loading,
    error,
    fetchExams,
    createExam: handleCreateExam,
    deleteExam: handleDeleteExam,
    seedExam: handleSeedExam,
  };
}

export default useExams;
