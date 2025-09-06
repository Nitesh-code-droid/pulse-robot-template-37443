import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, User, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';

const ProfilePage = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: '',
    // Counsellor specific fields
    specialization: '',
    affiliation: '',
    fees: 0,
    experience_years: 0,
    languages: [] as string[],
    gender: '',
    expertise_areas: [] as string[],
  });

  const [counsellorData, setCounsellorData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
      }));
      
      if (profile.role === 'counsellor') {
        fetchCounsellorData();
      }
    }
  }, [profile]);

  const fetchCounsellorData = async () => {
    try {
      const { data } = await (supabase as any)
        .from('counsellors')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();

      if (data) {
        setCounsellorData(data);
        setFormData(prev => ({
          ...prev,
          specialization: data.specialization || '',
          affiliation: data.affiliation || '',
          fees: data.fees || 0,
          experience_years: data.experience_years || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching counsellor data:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleExpertiseToggle = (area: string) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.includes(area)
        ? prev.expertise_areas.filter(a => a !== area)
        : [...prev.expertise_areas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
      });

      if (profileError) {
        toast.error('Failed to update profile');
        return;
      }

      // Update counsellor data if applicable
      if (profile?.role === 'counsellor' && counsellorData) {
        const { error: counsellorError } = await (supabase as any)
          .from('counsellors')
          .update({
            specialization: formData.specialization,
            affiliation: formData.affiliation,
            fees: formData.fees,
            experience_years: formData.experience_years,
          })
          .eq('id', counsellorData.id);

        if (counsellorError) {
          toast.error('Failed to update counsellor details');
          return;
        }
      }

      toast.success('Profile updated successfully!');
      navigate(-1);
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi'];
  const expertiseAreas = [
    'Anxiety & Stress', 'Depression', 'Relationship Issues', 'Academic Pressure',
    'Career Counseling', 'Family Therapy', 'Addiction', 'Trauma', 'Grief Counseling',
    'Anger Management', 'Self-Esteem', 'Social Anxiety', 'Eating Disorders', 'Sleep Issues'
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-2">
              {profile?.role === 'counsellor' ? (
                <Heart className="h-6 w-6 text-primary" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Counsellor Specific Fields */}
          {profile?.role === 'counsellor' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        placeholder="e.g., Anxiety & Stress Management"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <Select value={formData.affiliation} onValueChange={(value) => handleInputChange('affiliation', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select affiliation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On-Campus">On-Campus</SelectItem>
                          <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                          <SelectItem value="Private Practice">Private Practice</SelectItem>
                          <SelectItem value="Hospital">Hospital</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fees">Consultation Fees (₹)</Label>
                      <Input
                        id="fees"
                        type="number"
                        value={formData.fees}
                        onChange={(e) => handleInputChange('fees', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        type="number"
                        value={formData.experience_years}
                        onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((language) => (
                      <Button
                        key={language}
                        type="button"
                        variant={formData.languages.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLanguageToggle(language)}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expertise Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {expertiseAreas.map((area) => (
                      <Button
                        key={area}
                        type="button"
                        variant={formData.expertise_areas.includes(area) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleExpertiseToggle(area)}
                      >
                        {area}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Non-binary">Non-binary</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="gradient-button">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
