/**
 * Agent Routes
 * CRUD operations for managing agents
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All agent routes are protected
router.use(protect);

// ─── GET /api/agents ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json({ success: true, agents, count: agents.length });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch agents' });
  }
});

// ─── POST /api/agents ─────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('mobile.countryCode').notEmpty().withMessage('Country code is required'),
    body('mobile.number')
      .notEmpty()
      .withMessage('Mobile number is required')
      .matches(/^\d{7,15}$/)
      .withMessage('Mobile number must be 7-15 digits'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const { name, email, mobile, password } = req.body;

      // Check if agent with same email exists
      const existingAgent = await Agent.findOne({ email });
      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: 'Agent with this email already exists'
        });
      }

      const agent = await Agent.create({ name, email, mobile, password });

      res.status(201).json({
        success: true,
        message: 'Agent created successfully',
        agent
      });
    } catch (error) {
      console.error('Create agent error:', error);
      res.status(500).json({ success: false, message: 'Failed to create agent' });
    }
  }
);

// ─── PUT /api/agents/:id ──────────────────────────────────────────────────────
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('mobile.number')
      .optional()
      .matches(/^\d{7,15}$/)
      .withMessage('Mobile number must be 7-15 digits')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg
        });
      }

      const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!agent) {
        return res.status(404).json({ success: false, message: 'Agent not found' });
      }

      res.json({ success: true, message: 'Agent updated successfully', agent });
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(500).json({ success: false, message: 'Failed to update agent' });
    }
  }
);

// ─── DELETE /api/agents/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }
    res.json({ success: true, message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete agent' });
  }
});

module.exports = router;
