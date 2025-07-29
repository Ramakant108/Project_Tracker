const express = require('express');
const TimeLog = require('../models/TimeLog');
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary with totals and recent entries
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const today = moment().startOf('day');
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');

    // Today's total
    const todayLogs = await TimeLog.find({
      user: req.user._id,
      startTime: { $gte: today.toDate() },
      isRunning: false
    });
    const todayTotal = todayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Week's total
    const weekLogs = await TimeLog.find({
      user: req.user._id,
      startTime: { $gte: weekStart.toDate(), $lte: weekEnd.toDate() },
      isRunning: false
    });
    const weekTotal = weekLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Recent entries (last 10)
    const recentEntries = await TimeLog.find({ user: req.user._id, isRunning: false })
      .populate({
        path: 'task',
        populate: { path: 'project', select: 'name' }
      })
      .sort({ startTime: -1 })
      .limit(10);

    // Correct total tasks: count unique tasks for this user
    const totalTasks = await Task.countDocuments({ user: req.user._id });

    res.json({
      todayTotal,
      weekTotal,
      totalTasks,
      recentEntries
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/projects
// @desc    Get time totals by project
// @access  Private
router.get('/projects', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        startTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const timeLogs = await TimeLog.find({
      user: req.user._id,
      isRunning: false,
      ...dateFilter
    }).populate({
      path: 'task',
      populate: { path: 'project', select: 'name' }
    });

    const projectTotals = {};
    
    timeLogs.forEach(log => {
      const projectName = log.task.project.name;
      if (!projectTotals[projectName]) {
        projectTotals[projectName] = 0;
      }
      projectTotals[projectName] += log.duration || 0;
    });

    const projectSummary = Object.entries(projectTotals).map(([name, total]) => ({
      name,
      total,
      formattedTotal: formatDuration(total)
    }));

    res.json(projectSummary);
  } catch (error) {
    console.error('Project totals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/tasks
// @desc    Get time totals by task
// @access  Private
router.get('/tasks', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter = {
        startTime: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const timeLogs = await TimeLog.find({
      user: req.user._id,
      isRunning: false,
      ...dateFilter
    }).populate({
      path: 'task',
      populate: { path: 'project', select: 'name' }
    });

    const taskTotals = {};
    
    timeLogs.forEach(log => {
      const taskName = log.task.name;
      const projectName = log.task.project.name;
      const key = `${taskName} (${projectName})`;
      
      if (!taskTotals[key]) {
        taskTotals[key] = {
          taskName,
          projectName,
          total: 0
        };
      }
      taskTotals[key].total += log.duration || 0;
    });

    const taskSummary = Object.values(taskTotals)
      .map(task => ({
        ...task,
        formattedTotal: formatDuration(task.total)
      }))
      .sort((a, b) => b.total - a.total);

    res.json(taskSummary);
  } catch (error) {
    console.error('Task totals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/weekly
// @desc    Get weekly time breakdown
// @access  Private
router.get('/weekly', auth, async (req, res) => {
  try {
    const { weekStart } = req.query;
    const startDate = weekStart ? moment(weekStart).startOf('week') : moment().startOf('week');
    const endDate = startDate.clone().endOf('week');

    const timeLogs = await TimeLog.find({
      user: req.user._id,
      startTime: { $gte: startDate.toDate(), $lte: endDate.toDate() },
      isRunning: false
    }).populate({
      path: 'task',
      populate: { path: 'project', select: 'name' }
    });

    const weeklyData = [];
    
    // Generate data for each day of the week
    for (let i = 0; i < 7; i++) {
      const day = startDate.clone().add(i, 'days');
      const dayStart = day.startOf('day');
      const dayEnd = day.endOf('day');
      
      const dayLogs = timeLogs.filter(log => {
        const logDate = moment(log.startTime);
        return logDate.isBetween(dayStart, dayEnd, 'day', '[]');
      });

      const dayTotal = dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      
      const projectBreakdown = {};
      dayLogs.forEach(log => {
        const projectName = log.task.project.name;
        if (!projectBreakdown[projectName]) {
          projectBreakdown[projectName] = 0;
        }
        projectBreakdown[projectName] += log.duration || 0;
      });

      weeklyData.push({
        date: day.format('YYYY-MM-DD'),
        dayName: day.format('dddd'),
        total: dayTotal,
        formattedTotal: formatDuration(dayTotal),
        projects: Object.entries(projectBreakdown).map(([name, total]) => ({
          name,
          total,
          formattedTotal: formatDuration(total)
        }))
      });
    }

    res.json(weeklyData);
  } catch (error) {
    console.error('Weekly data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to format duration
function formatDuration(minutes) {
  if (!minutes) return '0:00';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

module.exports = router; 