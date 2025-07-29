const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { project } = req.query;
    let query = { user: req.user._id };
    
    if (project) {
      query.project = project;
    }
    
    const tasks = await Task.find(query)
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Task name is required'),
  body('description').optional(),
  body('project').notEmpty().withMessage('Project is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, project } = req.body;

    // Verify project belongs to user
    const projectExists = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      name,
      description: description || '',
      project,
      user: req.user._id
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('project', 'name');
    res.json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('name').notEmpty().withMessage('Task name is required'),
  body('description').optional(),
  body('project').notEmpty().withMessage('Project is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, project } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project belongs to user
    const projectExists = await Project.findOne({ _id: project, user: req.user._id });
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    task.name = name;
    task.description = description || task.description;
    task.project = project;
    task.updatedAt = Date.now();

    await task.save();
    
    const populatedTask = await Task.findById(task._id).populate('project', 'name');
    res.json(populatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.remove();
    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 