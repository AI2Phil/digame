import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Button, Card, Pagination, Select, Input, Spinner } from '@nextui-org/react'; // Assuming NextUI components
// import apiService from '../services/apiService'; // Uncomment when apiService is ready

// Mock apiService for now
const mockApiService = {
  getUsers: async ({ page, ...filters }) => {
    console.log('Fetching users with params:', { page, ...filters });
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers = [
          { id: '1', username: 'JohnDoe', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', role: 'Developer', bio: 'Loves coding and building awesome things.' },
          { id: '2', username: 'JaneSmith', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', role: 'Designer', bio: 'Passionate about creating beautiful and intuitive user experiences.' },
          { id: '3', username: 'AliceBrown', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', role: 'Product Manager', bio: 'Bridging the gap between users and technology.' },
          { id: '4', username: 'BobGreen', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c', role: 'QA Engineer', bio: 'Ensuring software quality and reliability.' },
        ];
        const totalUsers = 20; // Simulate a larger dataset for pagination
        const usersOnPage = mockUsers.slice(0, 10); // Simulate returning a page of users
        resolve({ users: usersOnPage, totalPages: Math.ceil(totalUsers / 10) });
      }, 1000);
    });
  },
};

const UserListPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', role: '' });
  const [sortBy, setSortBy] = useState('username'); // Default sort by username
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace mockApiService with apiService when ready
        const response = await mockApiService.getUsers({ page: currentPage, ...filters, sort: sortBy });
        setUsers(response.users);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, filters, sortBy]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Helper to get unique roles for filter dropdown
  const getUniqueRoles = (userList) => {
    if (!userList) return [];
    const roles = userList.map(user => user.role);
    return [...new Set(roles)];
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Community</h1>

      {/* Filters and Sorting */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label="Search by Name"
            name="name"
            placeholder="Enter username..."
            value={filters.name}
            onChange={handleFilterChange}
            clearable
            bordered
          />
          <Select
            label="Filter by Role"
            name="role"
            placeholder="Select role"
            value={filters.role}
            onChange={(e) => handleFilterChange({ target: { name: 'role', value: e.target.value }})} // Select gives value directly
            className="w-full"
          >
            {/* Dynamically generate options based on available roles or use predefined ones */}
            {/* For now, using a static list, ideally this would come from an API or be derived */}
            <Select.Option value="">All Roles</Select.Option>
            {getUniqueRoles(users).map(role => (
                <Select.Option key={role} value={role}>{role}</Select.Option>
            ))}
            <Select.Option value="Developer">Developer</Select.Option>
            <Select.Option value="Designer">Designer</Select.Option>
            <Select.Option value="Product Manager">Product Manager</Select.Option>
            <Select.Option value="QA Engineer">QA Engineer</Select.Option>
          </Select>
          <Select
            label="Sort by"
            placeholder="Select sort criteria"
            value={sortBy}
            onChange={(value) => handleSortChange(value)} // Select gives value directly
            className="w-full"
          >
            <Select.Option value="username">Name (A-Z)</Select.Option>
            <Select.Option value="-username">Name (Z-A)</Select.Option> {/* Assuming API supports '-' for descending */}
            <Select.Option value="role">Role</Select.Option>
          </Select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
          <p className="ml-2">Loading users...</p>
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && users.length === 0 && (
        <p className="text-center text-gray-500">No users found matching your criteria.</p>
      )}

      {!loading && !error && users.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {users.map(user => (
              <Card key={user.id} shadow="sm" className="hover:shadow-lg transition-shadow">
                <Card.Body className="p-4 text-center">
                  <Avatar
                    src={user.avatar}
                    alt={`${user.username}'s avatar`}
                    size="xl"
                    bordered
                    color="gradient"
                    className="mx-auto mb-3"
                  />
                  <h3 className="text-xl font-semibold mb-1">{user.username}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-300 mb-3 h-10 overflow-hidden text-ellipsis">
                    {user.bio.substring(0, 50)}{user.bio.length > 50 ? '...' : ''}
                  </p>
                  <Button
                    size="sm"
                    auto
                    ghost
                    onClick={() => navigate(`/users/${user.id}/profile_overview`)}
                  >
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                total={totalPages}
                initialPage={currentPage}
                onChange={(page) => setCurrentPage(page)}
                color="primary"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserListPage;
