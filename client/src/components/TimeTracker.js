import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTimeLogs, 
  startTimer, 
  stopTimer, 
  createTimeLog, 
  updateTimeLog, 
  deleteTimeLog,
  getCurrentTimer,
  clearError 
} from '../store/slices/timeLogSlice';
import { fetchTasks } from '../store/slices/taskSlice';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Add,
  Edit,
  Delete,
  Timer
} from '@mui/icons-material';
import moment from 'moment';

const TimeTracker = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTimeLog, setEditingTimeLog] = useState(null);
  const [formData, setFormData] = useState({
    taskId: '',
    startTime: '',
    endTime: '',
    duration: '',
    description: ''
  });
  
  const dispatch = useDispatch();
  const { timeLogs, currentTimer, loading, error } = useSelector((state) => state.timeLogs);
  const { tasks } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTimeLogs());
    dispatch(fetchTasks());
    dispatch(getCurrentTimer());
  }, [dispatch]);

  const handleOpenDialog = (timeLog = null) => {
    if (timeLog) {
      setEditingTimeLog(timeLog);
      setFormData({
        taskId: timeLog.task._id || timeLog.task,
        startTime: moment(timeLog.startTime).format('YYYY-MM-DDTHH:mm'),
        endTime: timeLog.endTime ? moment(timeLog.endTime).format('YYYY-MM-DDTHH:mm') : '',
        duration: timeLog.duration || '',
        description: timeLog.description || ''
      });
    } else {
      setEditingTimeLog(null);
      setFormData({
        taskId: '',
        startTime: moment().format('YYYY-MM-DDTHH:mm'),
        endTime: '',
        duration: '',
        description: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTimeLog(null);
    setFormData({
      taskId: '',
      startTime: '',
      endTime: '',
      duration: '',
      description: ''
    });
  };

  const handleSubmit = async () => {
    if (editingTimeLog) {
      dispatch(updateTimeLog({ id: editingTimeLog._id, timeLogData: formData }));
    } else {
      dispatch(createTimeLog(formData));
    }
    handleCloseDialog();
  };

  const handleDelete = async (timeLogId) => {
    if (window.confirm('Are you sure you want to delete this time log?')) {
      dispatch(deleteTimeLog(timeLogId));
    }
  };

  const handleStartTimer = (taskId) => {
    dispatch(startTimer(taskId));
  };

  const handleStopTimer = () => {
    dispatch(stopTimer());
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  if (loading && timeLogs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Time Tracker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Current Timer */}
      {currentTimer && (
        <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h6">
                  Currently Running: {currentTimer.task.name}
                </Typography>
                <Typography variant="body2">
                  Project: {currentTimer.task.project.name}
                </Typography>
                <Typography variant="body2">
                  Started: {moment(currentTimer.startTime).format('MMM DD, YYYY HH:mm')}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleStopTimer}
              >
                Stop Timer
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Start */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Start Timer
          </Typography>
          <Grid container spacing={2}>
            {tasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">
                      {task.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.project?.name || 'Unknown Project'}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartTimer(task._id)}
                      disabled={!!currentTimer}
                      sx={{ mt: 1 }}
                    >
                      Start
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Time Logs */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Time Logs
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Time Log
        </Button>
      </Box>

      <List>
        {timeLogs.map((timeLog) => (
          <ListItem key={timeLog._id} divider>
            <ListItemText
              primary={timeLog.task.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Project: {timeLog.task.project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(timeLog.startTime).format('MMM DD, YYYY HH:mm')}
                    {timeLog.endTime && ` - ${moment(timeLog.endTime).format('HH:mm')}`}
                  </Typography>
                  {timeLog.description && (
                    <Typography variant="body2" color="text.secondary">
                      {timeLog.description}
                    </Typography>
                  )}
                </Box>
              }
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={formatDuration(timeLog.duration)}
                color="primary"
                size="small"
              />
              {timeLog.isRunning && (
                <Chip
                  label="Running"
                  color="success"
                  size="small"
                />
              )}
              <IconButton
                size="small"
                onClick={() => handleOpenDialog(timeLog)}
              >
                <Edit />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(timeLog._id)}
              >
                <Delete />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>

      {timeLogs.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No time logs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start tracking your time to see logs here
          </Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTimeLog ? 'Edit Time Log' : 'Add Time Log'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Task</InputLabel>
            <Select
              value={formData.taskId}
              label="Task"
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            >
              {tasks.map((task) => (
                <MenuItem key={task._id} value={task._id}>
                  {task.name} ({task.project?.name || 'Unknown Project'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Start Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Time"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Duration (minutes)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTimeLog ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeTracker; 