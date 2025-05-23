import React from 'react';
import { useOffline } from './PWAProvider';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';

const NetworkStatus = ({ showDetails = false, className = '' }) => {
  const { isOnline, syncStatus, syncData, getNetworkStatus } = useOffline();

  const handleSyncClick = async () => {
    if (isOnline && !syncStatus.inProgress) {
      await syncData();
    }
  };

  const networkInfo = getNetworkStatus();

  if (!showDetails) {
    // Simple indicator
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {isOnline ? (
          <div className="flex items-center text-green-600">
            <Wifi className="w-4 h-4 mr-1" />
            <span className="text-sm">Online</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <WifiOff className="w-4 h-4 mr-1" />
            <span className="text-sm">Offline</span>
          </div>
        )}
        
        {syncStatus.queueLength > 0 && (
          <Badge variant="secondary" className="text-xs">
            {syncStatus.queueLength} pending
          </Badge>
        )}
      </div>
    );
  }

  // Detailed status
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center">
          {isOnline ? (
            <Cloud className="w-5 h-5 text-green-600 mr-2" />
          ) : (
            <CloudOff className="w-5 h-5 text-red-600 mr-2" />
          )}
          Network Status
        </h3>
        
        <Badge 
          variant={isOnline ? 'default' : 'destructive'}
          className="text-xs"
        >
          {isOnline ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection:</span>
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              isOnline ? 'text-green-600' : 'text-red-600'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Connection Type */}
        {isOnline && networkInfo.connectionType && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Type:</span>
            <span className="text-sm font-medium capitalize">
              {networkInfo.connectionType}
            </span>
          </div>
        )}

        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sync Status:</span>
          <div className="flex items-center">
            {syncStatus.inProgress ? (
              <>
                <RefreshCw className="w-4 h-4 text-blue-600 mr-1 animate-spin" />
                <span className="text-sm text-blue-600">Syncing...</span>
              </>
            ) : (
              <span className="text-sm text-gray-900">
                {syncStatus.queueLength > 0 ? 'Pending' : 'Up to date'}
              </span>
            )}
          </div>
        </div>

        {/* Pending Items */}
        {syncStatus.queueLength > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Pending Items:</span>
            <Badge variant="secondary" className="text-xs">
              {syncStatus.queueLength}
            </Badge>
          </div>
        )}

        {/* Last Sync */}
        {syncStatus.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Last Sync:</span>
            <span className="text-sm text-gray-900">
              {new Date(syncStatus.lastSync).toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Sync Button */}
        {isOnline && (
          <div className="pt-2 border-t">
            <Button
              onClick={handleSyncClick}
              disabled={syncStatus.inProgress}
              size="sm"
              className="w-full"
              variant={syncStatus.queueLength > 0 ? 'default' : 'outline'}
            >
              {syncStatus.inProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {syncStatus.queueLength > 0 ? 'Sync Now' : 'Check for Updates'}
                </>
              )}
            </Button>
          </div>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <div className="pt-2 border-t">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-sm text-yellow-800">
                You're currently offline. Your data will sync automatically when you're back online.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Compact network indicator for headers/navbars
export const NetworkIndicator = ({ className = '' }) => {
  const { isOnline, syncStatus } = useOffline();

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`w-2 h-2 rounded-full mr-2 ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } ${!isOnline ? 'animate-pulse' : ''}`} />
      
      {syncStatus.inProgress && (
        <RefreshCw className="w-3 h-3 text-blue-500 animate-spin mr-1" />
      )}
      
      {syncStatus.queueLength > 0 && !syncStatus.inProgress && (
        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
      )}
    </div>
  );
};

// Toast notification for network changes
export const NetworkToast = () => {
  const { isOnline } = useOffline();
  const [showToast, setShowToast] = React.useState(false);
  const [wasOffline, setWasOffline] = React.useState(!isOnline);

  React.useEffect(() => {
    if (isOnline && wasOffline) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setWasOffline(!isOnline);
  }, [isOnline, wasOffline]);

  if (!showToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-slide-in">
      <Wifi className="w-4 h-4 mr-2" />
      <span className="text-sm font-medium">Back online! Syncing data...</span>
    </div>
  );
};

export default NetworkStatus;