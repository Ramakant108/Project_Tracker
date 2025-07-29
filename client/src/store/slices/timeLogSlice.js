import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchTimeLogs = createAsyncThunk(
  'timeLogs/fetchTimeLogs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.task) params.append('task', filters.task);
      if (filters.project) params.append('project', filters.project);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const url = `/api/timelogs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch time logs');
    }
  }
);

export const startTimer = createAsyncThunk(
  'timeLogs/startTimer',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/timelogs/start', { taskId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start timer');
    }
  }
);

export const stopTimer = createAsyncThunk(
  'timeLogs/stopTimer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/timelogs/stop');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to stop timer');
    }
  }
);

export const createTimeLog = createAsyncThunk(
  'timeLogs/createTimeLog',
  async (timeLogData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/timelogs', timeLogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create time log');
    }
  }
);

export const updateTimeLog = createAsyncThunk(
  'timeLogs/updateTimeLog',
  async ({ id, timeLogData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/timelogs/${id}`, timeLogData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update time log');
    }
  }
);

export const deleteTimeLog = createAsyncThunk(
  'timeLogs/deleteTimeLog',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/timelogs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete time log');
    }
  }
);

export const getCurrentTimer = createAsyncThunk(
  'timeLogs/getCurrentTimer',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/timelogs/current');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get current timer');
    }
  }
);

const initialState = {
  timeLogs: [],
  currentTimer: null,
  loading: false,
  error: null,
};

const timeLogSlice = createSlice({
  name: 'timeLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTimer: (state, action) => {
      state.currentTimer = action.payload;
    },
    clearCurrentTimer: (state) => {
      state.currentTimer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Time Logs
      .addCase(fetchTimeLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs = action.payload;
        state.error = null;
      })
      .addCase(fetchTimeLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Start Timer
      .addCase(startTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimer = action.payload;
        state.error = null;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Stop Timer
      .addCase(stopTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(stopTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimer = null;
        state.timeLogs.unshift(action.payload);
        state.error = null;
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Time Log
      .addCase(createTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Time Log
      .addCase(updateTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timeLogs.findIndex(log => log._id === action.payload._id);
        if (index !== -1) {
          state.timeLogs[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Time Log
      .addCase(deleteTimeLog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTimeLog.fulfilled, (state, action) => {
        state.loading = false;
        state.timeLogs = state.timeLogs.filter(log => log._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTimeLog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get Current Timer
      .addCase(getCurrentTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTimer = action.payload;
        state.error = null;
      })
      .addCase(getCurrentTimer.rejected, (state, action) => {
        state.loading = false;
        state.currentTimer = null;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentTimer, clearCurrentTimer } = timeLogSlice.actions;
export default timeLogSlice.reducer; 