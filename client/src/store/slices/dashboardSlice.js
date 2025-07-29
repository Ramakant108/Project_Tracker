import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/summary');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
  }
);

export const fetchProjectTotals = createAsyncThunk(
  'dashboard/fetchProjectTotals',
  async (filters = {}, { rejectWithValue }) =>{
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const url = `/api/dashboard/projects${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project totals');
    }
  }
);

export const fetchTaskTotals = createAsyncThunk(
  'dashboard/fetchTaskTotals',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const url = `/api/dashboard/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task totals');
    }
  }
);

export const fetchWeeklyData = createAsyncThunk(
  'dashboard/fetchWeeklyData',
  async (weekStart = null, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (weekStart) params.append('weekStart', weekStart);
      
      const url = `/api/dashboard/weekly${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch weekly data');
    }
  }
);

const initialState = {
  summary: null,
  projectTotals: [],
  taskTotals: [],
  weeklyData: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.summary = null;
      state.projectTotals = [];
      state.taskTotals = [];
      state.weeklyData = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Summary
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Project Totals
      .addCase(fetchProjectTotals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectTotals.fulfilled, (state, action) => {
        state.loading = false;
        state.projectTotals = action.payload;
        state.error = null;
      })
      .addCase(fetchProjectTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Task Totals
      .addCase(fetchTaskTotals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskTotals.fulfilled, (state, action) => {
        state.loading = false;
        state.taskTotals = action.payload;
        state.error = null;
      })
      .addCase(fetchTaskTotals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Weekly Data
      .addCase(fetchWeeklyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyData.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklyData = action.payload;
        state.error = null;
      })
      .addCase(fetchWeeklyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboardData } = dashboardSlice.actions;
export default dashboardSlice.reducer; 