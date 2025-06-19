import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Will be used eventually for dynamic userId
import {
  User, Mail, Briefcase, GraduationCap, Star, Globe, Linkedin, ExternalLink, ThumbsUp, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'; // Assuming Avatar has these subcomponents
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button'; // Import Button
import apiService from '../services/apiService';
import { Toast } from '../components/ui/Toast'; // For error notifications

const UserProfileOverviewPage = () => {
  // const { userId: routeUserId } = useParams(); // For when routing is implemented
  const userId = 'user456'; // Hardcoded for now as per task spec, using mock "other user"

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kudosLoading, setKudosLoading] = useState(false); // For kudos button state

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching profile for userId: ${userId}`);
        const data = await apiService.getUserProfile(userId);
        console.log("Fetched profile data:", data);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load user profile:', err);
        setError(err.message || 'Failed to load profile data.');
        Toast.error(err.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]); // Dependency array includes userId for future dynamic use

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center text-red-500">
          <Info className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Error Loading Profile</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center">
          <p>No profile data available for this user.</p>
        </div>
      </div>
    );
  }

  const {
    username,
    email,
    avatar, // Assuming avatar URL is provided
    detailedBio,
    contactInfo,
    projects,
    experience,
    education,
    kudosCount,
    role, // Assuming these might exist from mock
    is_active,
    verified
  } = profileData;

  const handleGiveKudos = async () => {
    if (!userId || kudosLoading) return;
    setKudosLoading(true);
    try {
      const response = await apiService.giveKudos(userId);
      if (response && response.newKudosCount !== undefined) {
        setProfileData(prevData => ({
          ...prevData,
          kudosCount: response.newKudosCount
        }));
        Toast.success(response.message || 'Kudos given successfully!');
      } else {
        Toast.error('Could not update kudos count, unexpected response.');
      }
    } catch (err) {
      console.error('Failed to give kudos:', err);
      Toast.error(err.message || 'Failed to give kudos.');
    } finally {
      setKudosLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32">
                <AvatarImage src={avatar} alt={username} />
                <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{username}</h1>
                    <p className="text-gray-600 mt-1">{email}</p>
                  </div>
                  <Button
                    onClick={handleGiveKudos}
                    disabled={kudosLoading || userId === 'user123'} // Disable if current user is viewing their own (mock) profile
                    className="mt-4 sm:mt-0"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {kudosLoading ? 'Giving Kudos...' : 'Give Kudos'}
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {role && <Badge variant="outline">{role}</Badge>}
                  {is_active !== undefined && (
                    <Badge variant={is_active ? 'success' : 'destructive'}>
                      {is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                  {verified && <Badge variant="successOutline">Verified</Badge>}
                </div>
                <div className="mt-4 flex items-center gap-2 text-yellow-500">
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-semibold">{kudosCount || 0} Kudos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Bio Card */}
        {detailedBio && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> About {username}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{detailedBio}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact Info Card */}
        {contactInfo && (Object.values(contactInfo).some(val => val)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="w-5 h-5" /> Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contactInfo.professionalEmail && <InfoItem icon={Mail} label="Email" value={contactInfo.professionalEmail} isLink={`mailto:${contactInfo.professionalEmail}`} />}
              {contactInfo.website && <InfoItem icon={Globe} label="Website" value={contactInfo.website} isLink={contactInfo.website} />}
              {contactInfo.linkedin && <InfoItem icon={Linkedin} label="LinkedIn" value={contactInfo.linkedin} isLink={`https://www.${contactInfo.linkedin}`} />}
            </CardContent>
          </Card>
        )}

        {/* Projects Card */}
        {projects && projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map(proj => (
                <div key={proj.id || proj.title} className="p-3 border rounded-md">
                  <h3 className="font-semibold text-lg">{proj.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                  {proj.url && (
                    <a href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" /> View Project
                    </a>
                  )}
                  {proj.technologiesUsed && proj.technologiesUsed.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">Technologies:</span> {proj.technologiesUsed.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Experience Card */}
        {experience && experience.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id || exp.jobTitle} className="p-3 border rounded-md">
                  <h3 className="font-semibold text-lg">{exp.jobTitle}</h3>
                  <p className="text-md text-gray-700">{exp.company}</p>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education Card */}
        {education && education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map(edu => (
                <div key={edu.id || edu.institution} className="p-3 border rounded-md">
                  <h3 className="font-semibold text-lg">{edu.institution}</h3>
                  <p className="text-md text-gray-700">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-sm text-gray-500">Graduation Year: {edu.graduationYear}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Helper InfoItem component (can be moved to a shared file if used elsewhere)
const InfoItem = ({ icon: Icon, label, value, isLink }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      {isLink ? (
        <a
          href={isLink.startsWith('http') || isLink.startsWith('mailto:') ? isLink : `https://${isLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="font-medium text-gray-800 break-all">{value}</p>
      )}
    </div>
  </div>
);

export default UserProfileOverviewPage;
