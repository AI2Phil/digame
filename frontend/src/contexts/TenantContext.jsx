import React, { createContext, useContext, useState, useEffect } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  
  // Return safe defaults if context is null (during SSR or missing provider)
  if (!context) {
    return {
      currentTenant: null,
      availableTenants: [],
      loading: true,
      error: null,
      switchTenant: async () => {},
      refreshTenantData: () => {},
      hasMultipleTenants: false,
      isSSR: true
    };
  }
  
  return { ...context, isSSR: false };
};

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTenantData();
  }, []);

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/user/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tenant data');
      }

      const data = await response.json();
      setCurrentTenant(data.current_tenant);
      setAvailableTenants(data.available_tenants || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchTenant = async (tenantId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/v1/user/switch-tenant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenant_id: tenantId })
      });

      if (!response.ok) {
        throw new Error('Failed to switch tenant');
      }

      const data = await response.json();
      
      // Update the token if a new one is provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Update current tenant
      const newTenant = availableTenants.find(t => t.id === tenantId);
      if (newTenant) {
        setCurrentTenant(newTenant);
      }

      // Refresh the page to update all contexts
      window.location.reload();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refreshTenantData = () => {
    fetchTenantData();
  };

  const value = {
    currentTenant,
    availableTenants,
    loading,
    error,
    switchTenant,
    refreshTenantData,
    hasMultipleTenants: availableTenants.length > 1
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;