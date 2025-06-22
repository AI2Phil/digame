import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../../services/apiService';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Users, Zap, Eye, UserPlus } from 'lucide-react'; // Zap for suggestions, Eye for view, UserPlus for connect

const PeerSuggestionItem = ({ peer }) => {
  // Assuming 'peer' is a UserSchema object
  // The UserSchema should have 'skills' as an array and 'contact_info' as an object
  // due to the validators added in previous steps.

  const handleConnect = (peerId) => {
    // Placeholder for connect functionality
    // apiService.sendConnectionRequest(peerId) or similar could be called here
    console.log(`Attempting to connect with user: ${peerId}`);
    // Toast.info(`Connection request to ${peer.username} sent (mocked).`);
    // Would need Toast import and setup if used.
  };

  return (
    <div className="p-4 border rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4 hover:shadow-md transition-shadow">
      <Avatar
        src={peer.avatar} // Assuming UserSchema has an avatar field
        alt={peer.username}
        fallback={peer.username?.charAt(0).toUpperCase() || '?'}
        size="lg"
        className="w-16 h-16"
      />
      <div className="flex-1">
        <h4 className="font-semibold text-lg text-gray-900">{peer.first_name && peer.last_name ? `${peer.first_name} ${peer.last_name}` : peer.username}</h4>
        {peer.job_title && <p className="text-sm text-gray-600">{peer.job_title} {peer.company && `at ${peer.company}`}</p>}

        {peer.skills && peer.skills.length > 0 && (
          <div className="mt-2 mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Key Skills:</p>
            <div className="flex flex-wrap gap-1">
              {peer.skills.slice(0, 5).map((skill, index) => ( // Show up to 5 skills
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col sm:flex-row md:flex-col gap-2 self-start md:self-center mt-2 md:mt-0">
        <Button size="sm" variant="outline" asChild>
          <Link to={`/profile/${peer.id}`}>
            <Eye className="w-4 h-4 mr-1" />
            View Profile
          </Link>
        </Button>
        {/* <Button size="sm" onClick={() => handleConnect(peer.id)}>
          <UserPlus className="w-4 h-4 mr-1" />
          Connect
        </Button> */}
      </div>
    </div>
  );
};

const PeerMatchingSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getPeerMatches();
        setSuggestions(data || []); // Ensure data is an array
      } catch (err) {
        console.error("Failed to fetch peer suggestions:", err);
        setError(err.message || 'Could not load suggestions.');
        // Consider setting suggestions to [] on error if preferred
        // setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Finding Peer Matches...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Searching for skilled peers to connect with...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Zap className="w-5 h-5" />
            Error Loading Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Peer Matching Suggestions
        </CardTitle>
        <CardDescription>
          Connect with peers who share similar skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No peer suggestions available at the moment, or we couldn't find matches based on your current skills.
            <br />
            Ensure your profile skills are up-to-date!
          </p>
        ) : (
          <div className="space-y-4">
            {suggestions.map(peer => (
              <PeerSuggestionItem key={peer.id} peer={peer} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeerMatchingSuggestions;
