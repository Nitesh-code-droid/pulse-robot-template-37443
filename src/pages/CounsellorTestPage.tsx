import React from 'react';
import CounsellorTest from '@/components/CounsellorTest';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const CounsellorTestPage: React.FC = () => {
  const q = useQuery();
  const email = q.get('email') || '';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <CounsellorTest
        email={email}
        onPassed={() => { /* stay on page, user can go to auth and sign up */ }}
        onClosed={() => navigate('/auth')}
      />
    </div>
  );
};

export default CounsellorTestPage;


