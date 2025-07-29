const express = require('express');
const { body, validationResult } = require('express-validator');
const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/timelogs
// @desc    Get all time logs for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { task, project, startDate, endDate } = req.query;
    let query = { user: req.user._id };
    
    if (task) query.task = task;
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const timeLogs = await TimeLog.find(query)
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      })
      .sort({ startTime: -1 });
    
    res.json(timeLogs);
  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timelogs/start
// @desc    Start a timer for a task
// @access  Private
router.post('/start', [
  auth,
  body('taskId').notEmpty().withMessage('Task ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId } = req.body;

    // Verify task belongs to user
    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if there's already a running timer
    const runningTimer = await TimeLog.findOne({ user: req.user._id, isRunning: true });
    if (runningTimer) {
      return res.status(400).json({ message: 'Another timer is already running' });
    }

    const timeLog = new TimeLog({
      task: taskId,
      user: req.user._id,
      startTime: new Date(),
      isRunning: true
    });

    await timeLog.save();
    
    const populatedTimeLog = await TimeLog.findById(timeLog._id)
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      });
    
    res.json(populatedTimeLog);
  } catch (error) {
    console.error('Start timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timelogs/stop
// @desc    Stop the currently running timer
// @access  Private
router.post('/stop', auth, async (req, res) => {
  try {
    const runningTimer = await TimeLog.findOne({ user: req.user._id, isRunning: true });
    
    if (!runningTimer) {
      return res.status(400).json({ message: 'No running timer found' });
    }

    runningTimer.endTime = new Date();
    runningTimer.isRunning = false;
    runningTimer.duration = Math.round((runningTimer.endTime - runningTimer.startTime) / (1000 * 60));

    await runningTimer.save();
    
    const populatedTimeLog = await TimeLog.findById(runningTimer._id)
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      });
    
    res.json(populatedTimeLog);
  } catch (error) {
    console.error('Stop timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/timelogs
// @desc    Create a manual time log entry
// @access  Private
router.post('/', [
  auth,
  body('taskId').notEmpty().withMessage('Task ID is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').optional(),
  body('duration').optional(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, startTime, endTime, duration, description } = req.body;

    // Verify task belongs to user
    const task = await Task.findOne({ _id: taskId, user: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const timeLog = new TimeLog({
      task: taskId,
      user: req.user._id,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration: duration || 0,
      description: description || '',
      isRunning: false
    });

    await timeLog.save();
    
    const populatedTimeLog = await TimeLog.findById(timeLog._id)
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      });
    
    res.json(populatedTimeLog);
  } catch (error) {
    console.error('Create time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/timelogs/:id
// @desc    Update a time log entry
// @access  Private
router.put('/:id', [
  auth,
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').optional(),
  body('duration').optional(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startTime, endTime, duration, description } = req.body;
    const timeLog = await TimeLog.findOne({ _id: req.params.id, user: req.user._id });

    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    timeLog.startTime = new Date(startTime);
    timeLog.endTime = endTime ? new Date(endTime) : null;
    timeLog.duration = duration || 0;
    timeLog.description = description || timeLog.description;
    timeLog.isRunning = false;

    await timeLog.save();
    
    const populatedTimeLog = await TimeLog.findById(timeLog._id)
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      });
    
    res.json(populatedTimeLog);
  } catch (error) {
    console.error('Update time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/timelogs/:id
// @desc    Delete a time log entry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const timeLog = await TimeLog.findOne({ _id: req.params.id, user: req.user._id });

    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    await timeLog.deleteOne();
    res.json({ message: 'Time log removed' });
  } catch (error) {
    console.error('Delete time log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/timelogs/current
// @desc    Get the currently running timer
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    const runningTimer = await TimeLog.findOne({ user: req.user._id, isRunning: true })
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      });
    
    res.json(runningTimer);
  } catch (error) {
    console.error('Get current timer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 