import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/apiService';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { User, Briefcase, GraduationCap, Code, Link as LinkIcon, ThumbsUp, Mail, Globe, Linkedin } from 'lucide-react';

// Import display cards
import ProjectDisplayCard from '../../components/profile/ProjectDisplayCard';
import ExperienceDisplayCard from '../../components/profile/ExperienceDisplayCard';
import EducationDisplayCard from '../../components/profile/EducationDisplayCard';

const UserProfileOverviewPage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to load user profile.');
        Toast.error(err.message || 'Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleGiveKudos = async () => {
    if (!profile) return;
    try {
      const response = await apiService.giveKudos(profile.id);
      setProfile(prevProfile => ({
        ...prevProfile,
        kudos_count: response.kudos_count,
      }));
      Toast.success(response.message || 'Kudos given!');
    } catch (err) {
      Toast.error(err.message || 'Failed to give kudos.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        <p>Error: {error}. Please try again later.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <Avatar
              src={profile.avatar} // Assuming avatar URL is available
              alt={profile.username}
              fallback={profile.username?.charAt(0).toUpperCase()}
              className="w-24 h-24 md:w-32 md:h-32"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              <p className="text-gray-600">{profile.email}</p>
              <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
                <ThumbsUp className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">{profile.kudos_count || 0} Kudos</span>
              </div>
              <Button onClick={handleGiveKudos} size="sm" className="mt-3">
                <ThumbsUp className="w-4 h-4 mr-2" /> Give Kudos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About Card */}
        {profile.detailed_bio && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/> About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.detailed_bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info Card */}
        {profile.contact_info && (Object.values(profile.contact_info).some(v => v)) && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Mail className="mr-2"/> Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {profile.contact_info.professionalEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${profile.contact_info.professionalEmail}`} className="text-blue-600 hover:underline">
                    {profile.contact_info.professionalEmail}
                  </a>
                </div>
              )}
              {profile.contact_info.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-gray-500" />
                  <a href={profile.contact_info.linkedin.startsWith('http') ? profile.contact_info.linkedin : `https://${profile.contact_info.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
              {profile.contact_info.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href={profile.contact_info.website.startsWith('http') ? profile.contact_info.website : `https://${profile.contact_info.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skills Card */}
        {profile.skills && profile.skills.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Code className="mr-2"/> Skills</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="outline">{skill}</Badge>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {profile.projects && profile.projects.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Briefcase className="mr-2"/> Projects</CardTitle></CardHeader>
            <CardContent>
              {profile.projects.map((project, index) => (
                <ProjectDisplayCard key={project.id || index} project={project} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Experience Section */}
        {profile.experience_entries && profile.experience_entries.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Briefcase className="mr-2"/> Experience</CardTitle></CardHeader>
            <CardContent>
              {profile.experience_entries.map((exp, index) => (
                <ExperienceDisplayCard key={exp.id || index} experience={exp} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        {profile.education_entries && profile.education_entries.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center"><GraduationCap className="mr-2"/> Education</CardTitle></CardHeader>
            <CardContent>
              {profile.education_entries.map((edu, index) => (
                <EducationDisplayCard key={edu.id || index} education={edu} />
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserProfileOverviewPage;
