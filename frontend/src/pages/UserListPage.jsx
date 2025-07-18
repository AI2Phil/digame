import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Mock apiService for now
const mockApiService = {
  getUsers: async ({ page, ...filters }) => {
    console.log('Fetching users with params:', { page, ...filters });
    return new Promise(resolve => {
      setTimeout(() => {
        const mockUsers = [
          {
            id: '1',
            username: 'JohnDoe',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            role: 'Developer',
            bio: 'Loves coding and building awesome things.',
          },
          {
            id: '2',
            username: 'JaneSmith',
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            role: 'Designer',
            bio: 'Passionate about creating beautiful and intuitive user experiences.',
          },
          {
            id: '3',
            username: 'AliceBrown',
            avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
            role: 'Product Manager',
            bio: 'Bridging the gap between users and technology.',
          },
          {
            id: '4',
            username: 'BobGreen',
            avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708c',
            role: 'QA Engineer',
            bio: 'Ensuring software quality and reliability.',
          },
        ];
        const totalUsers = 20; // Simulate a larger dataset for pagination
        const usersOnPage = mockUsers.slice(0, 10); // Simulate returning a page of users
        resolve({ users: usersOnPage, totalPages: Math.ceil(totalUsers / 10) });
      }, 1000);
    });
  },
};

const UserListPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', role: '' });
  const [sortBy, setSortBy] = useState('username');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await mockApiService.getUsers({
          page: currentPage,
          ...filters,
          sort: sortBy,
        });
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

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = value => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const getUniqueRoles = userList => {
    if (!Array.isArray(userList)) return [];
    const roles = userList.map(user => user.role);
    return [...new Set(roles)];
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Community</h1>

      {/* Filters and Sorting */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter username..."
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {Array.isArray(users) &&
                getUniqueRoles(users).map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="QA Engineer">QA Engineer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={e => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="username">Name (A-Z)</option>
              <option value="-username">Name (Z-A)</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            {Array.isArray(users) &&
              users.map(user => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4"
                >
                  <div className="text-center">
                    <img
                      src={user.avatar}
                      alt={`${user.username}'s avatar`}
                      className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-blue-200"
                    />
                    <h3 className="text-xl font-semibold mb-1">{user.username}</h3>
                    <p className="text-sm text-gray-600 mb-2">{user.role}</p>
                    <p className="text-xs text-gray-500 mb-3 h-10 overflow-hidden">
                      {user.bio.substring(0, 50)}
                      {user.bio.length > 50 ? '...' : ''}
                    </p>
                    <button
                      onClick={() => router.push(`/users/${user.id}/profile_overview`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserListPage;
