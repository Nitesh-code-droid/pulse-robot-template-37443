import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Phone, Calendar, MapPin, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { getRankedCounsellors, RankedCounsellor } from '@/lib/counsellorRanking';

interface SuggestedCounsellorUI {
  id: string;
  name: string;
  specialization: string;
  affiliation?: string | null;
  fees?: number | null;
  experience_years?: number | null;
  ranking_score: number;
  languages: string[];
  bio?: string;
}

const SuggestedCounsellors = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counsellors, setCounsellors] = useState<SuggestedCounsellorUI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return; // wait for profile
    setLoading(true);
    fetchSuggestedCounsellors();
  }, [profile?.id]);

  const fetchSuggestedCounsellors = async () => {
    try {
      const ranked: RankedCounsellor[] = await getRankedCounsellors(profile?.id);
      const ui: SuggestedCounsellorUI[] = ranked.map(r => ({
        id: r.id,
        name: r.name,
        specialization: r.specialization,
        affiliation: r.affiliation,
        fees: r.fees ?? null,
        experience_years: r.experience_years ?? null,
        languages: ['English', 'Hindi'],
        ranking_score: r.ranking_score,
      }));
      setCounsellors(ui);
    } catch (error) {
      console.error('Error fetching ranked counsellors:', error);
      setCounsellors([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading suggested counsellors...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      <main className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Suggested Counsellors</h1>
            <p className="text-muted-foreground">
              Based on your questionnaire responses, here are counsellors who might be a good fit for you.
            </p>
          </div>

          {counsellors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No suggested counsellors found. Please complete the questionnaire first.
                </p>
                <Link to="/dashboard">
                  <Button className="gradient-button">Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {counsellors.map((counsellor) => (
                <Card key={counsellor.id} className="hover-lift">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{counsellor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {counsellor.specialization}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1" title="Ranking score">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{counsellor.ranking_score}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {counsellor.affiliation ?? 'Affiliation unavailable'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {(counsellor.experience_years ?? 0)} years experience
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        ₹{counsellor.fees ?? 500} per session
                      </div>
                    </div>

                    {counsellor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {counsellor.bio}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {counsellor.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/booking?counsellor=${counsellor.id}`} className="flex-1">
                        <Button className="w-full gradient-button">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Session
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SuggestedCounsellors;
