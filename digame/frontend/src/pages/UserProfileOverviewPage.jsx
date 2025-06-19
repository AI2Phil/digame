import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Card, Badge, Spinner } from '@nextui-org/react'; // Assuming NextUI components
// import apiService from '../services/apiService'; // Uncomment when apiService is ready

// Mock apiService for now
const mockApiService = {
  getUserPublicProfileSummary: async (userId) => {
    console.log('Fetching user profile summary for userId:', userId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUserProfiles = {
          '1': {
            id: '1',
            username: 'JohnDoe',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            role: 'Developer',
            bio: 'Loves coding and building awesome things. Passionate about open source and new technologies. Enjoys collaborating with others to create impactful solutions.',
            skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Next.js', 'Tailwind CSS'],
            achievements: [
              {id: 'a1', name: 'Top Contributor Q1 2023'},
              {id: 'a2', name: 'Project Alpha Lead'},
              {id: 'a3', name: 'Community Mentor Award'}
            ],
            goals: [
              {id: 'g1', name: 'Learn Python for Data Science', completed: true},
              {id: 'g2', name: 'Contribute to a major OS project', completed: false},
              {id: 'g3', name: 'Speak at a tech conference', completed: false}
            ]
          },
          '2': {
            id: '2',
            username: 'JaneSmith',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            role: 'Designer',
            bio: 'Passionate about creating beautiful and intuitive user experiences. Loves to work at the intersection of design and technology.',
            skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Prototyping'],
            achievements: [
              {id: 'a1', name: 'Best UI Design Award 2022'},
              {id: 'a2', name: 'Redesigned Company Website'}
            ],
            goals: [
              {id: 'g1', name: 'Master Webflow', completed: true},
              {id: 'g2', name: 'Lead a design workshop', completed: false}
            ]
          },
        };
        if (mockUserProfiles[userId]) {
          resolve(mockUserProfiles[userId]);
        } else {
          reject(new Error('User not found'));
        }
      }, 1000);
    });
  },
};

const UserProfileOverviewPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        // Replace mockApiService with apiService when ready
        const profileData = await mockApiService.getUserPublicProfileSummary(userId);
        setUser(profileData);
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>User profile not available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{user.username}'s Profile</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main User Info Card ( занимает 1 или 2 колонки в зависимости от ширины) */}
        <Card className="md:col-span-1 p-6 shadow-lg">
          <div className="flex flex-col items-center text-center">
            <Avatar
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              size="xl"
              bordered
              color="gradient"
              className="w-32 h-32 text-large mb-4"
            />
            <h2 className="text-2xl font-semibold">{user.username}</h2>
            <p className="text-md text-gray-600 dark:text-gray-400">{user.role}</p>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{user.bio}</p>
          </div>
        </Card>

        {/* Details Section (занимает 2 или 1 колонку) */}
        <div className="md:col-span-2 space-y-6">
          {/* Skills Card */}
          {user.skills && user.skills.length > 0 && (
            <Card className="p-6 shadow-lg">
              <Card.Header>
                <h3 className="text-xl font-semibold">Skills</h3>
              </Card.Header>
              <Card.Body>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map(skill => (
                    <Badge key={skill} color="primary" variant="flat" size="lg">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Achievements Card */}
          {user.achievements && user.achievements.length > 0 && (
            <Card className="p-6 shadow-lg">
              <Card.Header>
                <h3 className="text-xl font-semibold">Achievements</h3>
              </Card.Header>
              <Card.Body>
                <ul className="list-disc list-inside space-y-2">
                  {user.achievements.map(achievement => (
                    <li key={achievement.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {achievement.name}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}

          {/* Goals Card */}
          {user.goals && user.goals.length > 0 && (
            <Card className="p-6 shadow-lg">
              <Card.Header>
                <h3 className="text-xl font-semibold">Goals</h3>
              </Card.Header>
              <Card.Body>
                <ul className="space-y-2">
                  {user.goals.map(goal => (
                    <li key={goal.id} className={`text-sm ${goal.completed ? 'line-through text-green-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {goal.name} {goal.completed && <Badge color="success" variant="flat" size="sm" className="ml-2">Completed</Badge>}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileOverviewPage;
