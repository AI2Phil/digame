// LocalTaskService.js
import OfflineService from './offlineService'; // Assuming singleton instance
// import { v4 as uuidv4 } from 'uuid'; // For generating local IDs if needed before server sync

// This is a simplified local task store. In a real app, this would use SQLite via OfflineService
// or directly for more robust storage and querying.
let localTasks = [];
// Example: { id: 'local-1', title: 'Buy milk', status: 'pending', synced: false, serverId: null }
// serverId would be populated after successful sync.

class LocalTaskService {
  constructor() {
    this.offlineService = OfflineService; // Use the singleton instance
    this._loadInitialTasksFromLocalStorage(); // Simulate loading from persistent storage
  }

  async _loadInitialTasksFromLocalStorage() {
    // In a real app, load from AsyncStorage or SQLite here.
    // For simulation, we can pre-populate or keep it simple.
    // const storedTasks = await AsyncStorage.getItem('localTasks');
    // if (storedTasks) { localTasks = JSON.parse(storedTasks); }
    console.log("LocalTaskService: Initialized (simulated load). Current local tasks:", localTasks.length);
  }

  async _saveTasksToLocalStorage() {
    // In a real app, save to AsyncStorage or SQLite.
    // await AsyncStorage.setItem('localTasks', JSON.stringify(localTasks));
    // console.log("LocalTaskService: Tasks saved to local storage (simulated).");
  }

  /**
   * Gets tasks. For now, it returns all local tasks.
   * TODO: Implement filtering and potentially fetching from server if online and local cache is stale.
   * @param {object} filters - Optional filters (e.g., { status: 'pending' })
   * @returns {Promise<Array>}
   */
  async getTasks(filters = {}) {
    console.log("LocalTaskService: Getting tasks with filters:", filters);
    // Basic filtering for simulation
    let tasksToReturn = [...localTasks];
    if (filters.status) {
      tasksToReturn = tasksToReturn.filter(task => task.status === filters.status);
    }
    // In a real app:
    // 1. Check local DB.
    // 2. If online & local data might be stale, consider fetching from server.
    //    - This could involve a getCachedData check first.
    //    - If fetched, update local DB.
    return Promise.resolve(tasksToReturn);
  }

  /**
   * Creates a new task.
   * Adds to local store immediately and queues for server sync.
   * @param {object} taskData - e.g., { title, description, due_date, project_id }
   * @param {number} userId - The ID of the user creating the task.
   * @returns {Promise<object>} The locally created task.
   */
  async createTask(taskData, userId) {
    console.log("LocalTaskService: Creating task locally:", taskData);
    if (!userId) {
        console.error("LocalTaskService: User ID is required to create a task.");
        throw new Error("User ID required.");
    }

    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Simple local ID
    const newTask = {
      localId: localId, // Temporary ID for local use
      serverId: null,   // Will be filled after sync
      ...taskData,
      status: taskData.status || 'pending', // Default status
      user_id: userId, // Ensure user_id is part of the task data for the backend
      synced: false,
      created_at: new Date().toISOString(),
      // Other fields like project_id, priority_score should be in taskData if applicable
    };

    localTasks.push(newTask);
    await this._saveTasksToLocalStorage(); // Persist (simulated)
    console.log("LocalTaskService: Task added locally:", newTask);

    // Queue for server synchronization
    // The endpoint should match your backend's task creation endpoint.
    // Assumes backend expects a structure similar to `task_schemas.TaskCreate`
    const syncPayload = {
        user_id: userId,
        description: newTask.title, // Assuming title maps to description for backend
        // Map other fields from newTask (like due_date, project_id, notes, priority_score)
        // to the backend schema as needed.
        // Example:
        // due_date: newTask.due_date || null,
        // notes: newTask.notes || null,
        // priority_score: newTask.priority_score || 0,
        // project_id: newTask.project_id || null,
        // status: newTask.status // Backend might set its own default if not provided
    };
    if (newTask.description && !syncPayload.description) syncPayload.description = newTask.description;


    // Important: The actual task data sent to the backend should align with TaskCreate schema
    // e.g. description, source_type, source_identifier, process_note_id, status, priority_score, notes, due_date, project_id

    await this.offlineService.addToSyncQueue(
      'CREATE_TASK',
      // This endpoint needs to be verified against your actual backend task router
      // It might be /api/v1/tasks/ or /tasks/users/{user_id}/ etc.
      // For now, using a placeholder based on typical structures.
      // Let's assume it's a general task creation endpoint that infers user from auth.
      // Or if it requires user_id in path: `/api/v1/tasks/users/${userId}/`
      'http://localhost:8000/api/v1/tasks/', // Placeholder: Verify actual task creation endpoint
      'POST',
      syncPayload // Send only data expected by backend TaskCreate schema
    );
    console.log("LocalTaskService: Create task action queued for sync.");

    // TODO: Handle sync completion: When this item is synced, the server might return the created task
    // with its `serverId`. The app should then update the local task's `serverId` and `synced` status.
    // This often involves a mechanism to correlate sync queue items with local items (e.g., using localId).

    return Promise.resolve(newTask);
  }

  /**
   * Updates an existing task.
   * @param {string} localOrServerId - The ID of the task to update.
   * @param {object} updates - e.g., { title, status }
   * @returns {Promise<object|null>} The updated task or null if not found.
   */
  async updateTask(localOrServerId, updates) {
    console.log(`LocalTaskService: Updating task ${localOrServerId} with`, updates);
    const taskIndex = localTasks.findIndex(t => t.localId === localOrServerId || t.serverId === localOrServerId);

    if (taskIndex === -1) {
      console.warn("LocalTaskService: Task not found for update:", localOrServerId);
      return null;
    }

    const originalTask = localTasks[taskIndex];
    const updatedTask = { ...originalTask, ...updates, synced: false }; // Mark as unsynced
    localTasks[taskIndex] = updatedTask;
    await this._saveTasksToLocalStorage(); // Persist (simulated)

    // Queue for server synchronization
    // The backend might expect only the changed fields or the full updated object.
    // The endpoint needs to be the specific task update endpoint (e.g., /api/v1/tasks/{task_id})
    const serverId = originalTask.serverId || null; // Need serverId for the PUT request if available

    if (serverId) { // Only queue if we have a serverId, otherwise it's a new task not yet synced
        await this.offlineService.addToSyncQueue(
            'UPDATE_TASK',
            `http://localhost:8000/api/v1/tasks/${serverId}`, // Placeholder: Verify actual update endpoint
            'PUT', // Or PATCH, depending on backend API design
            updates // Send only the delta, or the full task object as per backend requirements
        );
        console.log(`LocalTaskService: Update task action for server ID ${serverId} queued for sync.`);
    } else {
        console.warn(`LocalTaskService: Task ${localOrServerId} does not have a server ID. Update will only be local until task is created on server.`);
        // If it's a local-only task that hasn't been created on the server yet,
        // the CREATE_TASK queue item should eventually handle its creation with these updated details.
        // This might require more complex logic in how CREATE_TASK sync items are processed or updated before sending.
        // For simplicity now, we assume updates are on tasks that exist or will exist on the server.
    }


    return Promise.resolve(updatedTask);
  }

  // Placeholder for handling task sync confirmation
  // This would be called by a part of OfflineService after a task sync is successful
  async confirmTaskSync(localId, serverTaskData) {
    const taskIndex = localTasks.findIndex(t => t.localId === localId);
    if (taskIndex !== -1) {
      localTasks[taskIndex] = {
        ...localTasks[taskIndex],
        ...serverTaskData, // Update with any data from server (like serverId, updated timestamps)
        serverId: serverTaskData.id, // Assuming server returns 'id' as serverId
        synced: true,
        localId: null, // Optionally clear localId or keep for reference
      };
      await this._saveTasksToLocalStorage();
      console.log(`LocalTaskService: Task ${localId} confirmed sync with server ID ${serverTaskData.id}`);
    }
  }
}

export default new LocalTaskService();
