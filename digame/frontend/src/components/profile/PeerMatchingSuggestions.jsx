import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// Assuming apiService.js exists and will have these functions
// For now, these are conceptual and might need to be adapted to actual apiService structure
import { apiService } from '../../services/apiService';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
// Assuming a Toast component or a hook for toast notifications is available
// import { useToast } from '../ui/use-toast'; // Example if using a ShadCN-like toast

const PAGE_SIZE = 5; // Or make this configurable

const PeerMatchingSuggestions = ({ userId }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  // const { toast } = useToast(); // Example for ShadCN-like toast

  const fetchSuggestions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('page_size', PAGE_SIZE);
      if (skillFilter) {
        params.append('skill_filter', skillFilter);
      }
      if (experienceFilter) {
        params.append('experience_filter', experienceFilter);
      }

      // Replace with actual apiService call if it exists, or direct fetch
      // This assumes apiService.get returns the parsed JSON response
      const response = await apiService.get(`/api/social/users/${userId}/peer-matches?${params.toString()}`);

      setSuggestions(response.matches || []);
      setTotalPages(Math.ceil((response.total || 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
      setError(err.message || 'Failed to fetch suggestions.');
      // toast({ title: "Error", description: err.message || "Failed to fetch suggestions.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [userId, currentPage, skillFilter, experienceFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleConnect = async (receiverUserId) => {
    // Placeholder for toast
    const showToast = (title, description, variant = "default") => {
        alert(`${title}: ${description} (${variant})`); // Replace with actual toast soon
    };

    try {
      // Use the specific method from apiService if available and correctly defined
      // The apiService.sendConnectionRequest was updated to handle the correct path and empty body
      const response = await apiService.sendConnectionRequest(receiverUserId);

      // Assuming response from sendConnectionRequest will be the created ConnectionRequest object if successful
      // or throw an error handled by handleResponse in apiService if not ok.
      // So, if we reach here, it's likely a success.
      // The actual response structure might vary (e.g., could be just a success message or the full object)
      // For now, let's assume a successful call to apiService.sendConnectionRequest doesn't throw and returns meaningful data.
      if (response && response.id) { // Example check: if it returns the created request object
        showToast("Success", `Connection request sent to user ${receiverUserId} (ID: ${response.id}).`, "success");
        // Optionally, update UI to reflect pending request
      } else {
        // Assuming error details might be in response.error or similar
        showToast("Error", response.error || `Failed to send connection request.`, "destructive");
      }
    } catch (err) {
      console.error("Connection request failed:", err);
      showToast("Error", err.message || "Failed to send connection request.", "destructive");
    }
  };

  const handleSkillFilterChange = (event) => {
    setSkillFilter(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleExperienceFilterChange = (event) => {
    setExperienceFilter(event.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (!userId) return <p>User ID is required to fetch peer suggestions.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Peer Matching Suggestions</CardTitle>
          <CardDescription>Connect with peers based on skills and experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Input
              type="text"
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={handleSkillFilterChange}
              className="max-w-sm"
            />
            <Input
              type="text"
              placeholder="Filter by experience (e.g., 5+ years)"
              value={experienceFilter}
              onChange={handleExperienceFilterChange}
              className="max-w-sm"
            />
          </div>

          {loading && <p>Loading suggestions...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && suggestions.length === 0 && <p>No suggestions found.</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((peer) => (
              <Card key={peer.id}>
                <CardHeader className="flex flex-row items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={peer.avatarUrl /* if available */} />
                    <AvatarFallback>{peer.initials || 'N/A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{peer.name}</CardTitle>
                    <CardDescription>{peer.title} at {peer.company}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Score: {peer.compatibilityScore}%</Badge>
                    <Badge variant="outline">Shared Skills: {peer.sharedSkills || 0}</Badge>
                  </div>
                  {peer.skills && peer.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm">Matching Skills:</h4>
                      <p className="text-xs text-muted-foreground">{peer.skills.slice(0, 3).join(', ')}{peer.skills.length > 3 ? '...' : ''}</p>
                    </div>
                  )}
                   {peer.projects && peer.projects.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mt-2">Matched on Project Technologies:</h4>
                      <ul className="text-xs text-muted-foreground list-disc pl-4">
                        {peer.projects.slice(0,2).map(proj =>
                          proj.technologiesUsed && proj.technologiesUsed.length > 0 && (
                            <li key={proj.name}>{proj.name}: {proj.technologiesUsed.slice(0,3).join(', ')}{proj.technologiesUsed.length > 3 ? '...' : ''}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Experience: {peer.experience}</p>
                  <p className="text-xs text-muted-foreground">Location: {peer.location}</p>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleConnect(peer.id)} size="sm">
                    Connect
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
        {!loading && !error && totalPages > 0 && (
          <CardFooter className="flex justify-center items-center space-x-2">
            <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline" size="sm">
              Previous
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline" size="sm">
              Next
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

PeerMatchingSuggestions.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default PeerMatchingSuggestions;
