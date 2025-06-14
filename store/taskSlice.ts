import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api'; // Adjust path as per your project structure

// Define the Task interface based on your API response for a single task
export interface Task {
  id: string;
  title: string; // Example: "Package from Amazon"
  description?: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled' | 'failed'; // Example statuses
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation?: { latitude: number; longitude: number }; // Optional, based on API
  deliveryLocation?: { latitude: number; longitude: number }; // Optional, based on API
  packageSize?: 'small' | 'medium' | 'large';
  packageWeight?: number; // in kg
  pickupDate?: string; // ISO string
  deliveryDate?: string; // ISO string
  estimatedDeliveryTime?: string; // e.g., "2 hours"
  assignedPickerId?: string | null;
  userId: string;
  price?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Add any other fields your task object might have
  // Example: recipientName, recipientPhone, notes, etc.
}

// Define the state structure for tasks
export interface TaskState {
  tasks: Task[];
  task: Task | null; // For viewing a single task
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number; // Tasks per page
  // States for task creation
  isCreatingTask: boolean;
  createTaskError: string | null;
  // States for task update
  isUpdatingTask: boolean;
  updateTaskError: string | null;
  // States for task deletion
  isDeletingTask: boolean;
  deleteTaskError: string | null;
}

const initialState: TaskState = {
  tasks: [],
  task: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalTasks: 0,
  limit: 10, // Default limit
  isCreatingTask: false,
  createTaskError: null,
  isUpdatingTask: false,
  updateTaskError: null,
  isDeletingTask: false,
  deleteTaskError: null,
};

// Async Thunks
// Interface for the data expected by createTask API / updateTask API
export interface CreateTaskData { // Can be reused for update, or create a specific UpdateTaskData
  title: string;
  description?: string;
  pickupAddress: string; // Or a more structured Location object if your API expects that
  deliveryAddress: string; // Or a more structured Location object
  // Optional: pickupLocation, deliveryLocation (coordinates)
  packageSize?: 'small' | 'medium' | 'large';
  packageWeight?: number;
  price?: number; // Or minPrice/maxPrice if you have a range
  // images?: any[]; // Array of image objects for FormData { uri, name, type }
  // Add other fields like pickupDate, deliveryDate, paymentMethod, userId (if not from auth token)
  [key: string]: any; // Allow other properties, useful for FormData
}

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData, { rejectWithValue }) => {
    try {
      // The api.createTask function will need to handle FormData if images are present.
      const response = await api.createTask(taskData);
      return response.data; // Assuming API returns the created task
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.deleteTask(taskId);
      return taskId; // Return the taskId on success for reducer to identify which task to remove
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }: { taskId: string, taskData: Partial<CreateTaskData> }, { rejectWithValue }) => {
    try {
      // api.updateTask will need to handle FormData if images are present in taskData
      const response = await api.updateTask(taskId, taskData);
      return response.data; // Assuming API returns the updated task
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

interface FetchTasksParams {
  page?: number;
  limit?: number;
  status?: string; // e.g., 'pending', 'delivered'
  sortBy?: string; // e.g., 'createdAt:desc'
  // Add other potential query params for GET /api/tasks
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: FetchTasksParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.getTasks(params); // Ensure api.getTasks accepts these params
      // Assuming API response is { data: Task[], meta: { currentPage, totalPages, totalItems, limit } }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.getTaskById(taskId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    resetTaskDetail: (state) => {
      state.task = null;
    },
    // You can add other reducers here, e.g., for optimistic updates or local changes
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<{ data: Task[], meta: any }>) => {
        state.isLoading = false;
        state.tasks = action.payload.data; // Replace or append based on pagination strategy
        state.currentPage = action.payload.meta.currentPage;
        state.totalPages = action.payload.meta.totalPages;
        state.totalTasks = action.payload.meta.totalItems;
        state.limit = action.payload.meta.limit;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true; // Or a specific loading flag like isSingleTaskLoading
        state.error = null;
        state.task = null; // Clear previous task detail
      })
      .addCase(fetchTaskById.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.task = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string; // Or a specific error flag
      })
      // createTask
      .addCase(createTask.pending, (state) => {
        state.isCreatingTask = true;
        state.createTaskError = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isCreatingTask = false;
        // Add the new task to the beginning of the tasks array
        // Or, you might want to refetch the list or navigate,
        // depending on your UX preference.
        state.tasks.unshift(action.payload);
        // Optionally, update totalTasks if not refetching immediately
        state.totalTasks += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isCreatingTask = false;
        state.createTaskError = action.payload as string;
      })
      // updateTask
      .addCase(updateTask.pending, (state) => {
        state.isUpdatingTask = true;
        state.updateTaskError = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isUpdatingTask = false;
        // Update the task in the tasks array
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        // Update the task in detail view if it's the same one
        if (state.task && state.task.id === action.payload.id) {
          state.task = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isUpdatingTask = false;
        state.updateTaskError = action.payload as string;
      })
      // deleteTask
      .addCase(deleteTask.pending, (state) => {
        state.isDeletingTask = true;
        state.deleteTaskError = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeletingTask = false;
        // Remove the task from the tasks array
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
        // If the deleted task was being viewed in detail, clear it
        if (state.task && state.task.id === action.payload) {
          state.task = null;
        }
        // Optionally, decrement totalTasks if not refetching list immediately
        state.totalTasks = Math.max(0, state.totalTasks - 1);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isDeletingTask = false;
        state.deleteTaskError = action.payload as string;
      });
  },
});

export const { resetTaskDetail } = taskSlice.actions;
export default taskSlice.reducer;
