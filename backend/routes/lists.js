/**
 * Lists Routes
 * Handles CSV/XLSX upload, validation, and distribution among agents
 */

const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('crypto');
const Agent = require('../models/Agent');
const DistributedList = require('../models/DistributedList');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `upload_${Date.now()}${ext}`);
  }
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/csv',
    'text/x-csv'
  ];
  const allowedExts = ['.csv', '.xlsx', '.xls'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only CSV, XLSX, and XLS files are accepted.'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ─── Helper: Parse uploaded file ──────────────────────────────────────────────
const parseFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  return data;
};

// ─── Helper: Normalize CSV row keys ──────────────────────────────────────────
const normalizeRow = (row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    normalized[key.toLowerCase().replace(/\s+/g, '')] = row[key];
  });
  return normalized;
};

// ─── Helper: Distribute items among agents ────────────────────────────────────
const distributeItems = (items, agents) => {
  const numAgents = agents.length;
  const distribution = agents.map((agent) => ({ agent, items: [] }));

  // Round-robin distribution
  items.forEach((item, index) => {
    distribution[index % numAgents].items.push(item);
  });

  return distribution;
};

// ─── POST /api/lists/upload ───────────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a CSV, XLSX, or XLS file.'
      });
    }

    filePath = req.file.path;

    // Parse file
    let rawData;
    try {
      rawData = parseFile(filePath);
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message: 'Failed to parse file. Ensure it is a valid CSV or Excel file.'
      });
    }

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'The uploaded file is empty.'
      });
    }

    // Normalize and validate rows
    const validatedItems = [];
    const invalidRows = [];

    rawData.forEach((row, index) => {
      const normalized = normalizeRow(row);

      // Look for firstName/firstname/first_name and phone/Phone
      const firstName =
        normalized['firstname'] ||
        normalized['first_name'] ||
        normalized['firstname'] ||
        '';
      const phone =
        normalized['phone'] ||
        normalized['phonenumber'] ||
        normalized['phone_number'] ||
        '';
      const notes =
        normalized['notes'] || normalized['note'] || normalized['notes'] || '';

      if (!firstName || !phone) {
        invalidRows.push(index + 2); // +2 for header row and 1-based index
      } else {
        validatedItems.push({
          firstName: String(firstName).trim(),
          phone: String(phone).trim(),
          notes: String(notes).trim()
        });
      }
    });

    if (validatedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'No valid rows found. Ensure the file has FirstName and Phone columns.'
      });
    }

    // Get active agents
    const agents = await Agent.find({ isActive: true });
    if (agents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active agents found. Please add agents before uploading.'
      });
    }

    // Generate unique batch ID
    const uploadBatch = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const originalFileName = req.file.originalname;

    // Distribute items
    const distribution = distributeItems(validatedItems, agents);

    // Save distributions to DB
    const savedLists = await Promise.all(
      distribution.map(({ agent, items }) =>
        DistributedList.create({
          uploadBatch,
          agent: agent._id,
          items,
          originalFileName
        })
      )
    );

    // Populate agent info for response
    const populatedLists = await DistributedList.find({ uploadBatch }).populate(
      'agent',
      'name email mobile'
    );

    res.json({
      success: true,
      message: `Successfully distributed ${validatedItems.length} items among ${agents.length} agents`,
      uploadBatch,
      totalItems: validatedItems.length,
      agentCount: agents.length,
      invalidRows: invalidRows.length > 0 ? invalidRows : undefined,
      distribution: populatedLists
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to process file upload' });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

// ─── GET /api/lists ───────────────────────────────────────────────────────────
// Get all distributed lists grouped by batch
router.get('/', async (req, res) => {
  try {
    const lists = await DistributedList.find()
      .populate('agent', 'name email mobile')
      .sort({ createdAt: -1 });

    // Group by uploadBatch
    const batches = {};
    lists.forEach((list) => {
      if (!batches[list.uploadBatch]) {
        batches[list.uploadBatch] = {
          uploadBatch: list.uploadBatch,
          originalFileName: list.originalFileName,
          createdAt: list.createdAt,
          totalItems: 0,
          distributions: []
        };
      }
      batches[list.uploadBatch].totalItems += list.items.length;
      batches[list.uploadBatch].distributions.push(list);
    });

    res.json({
      success: true,
      batches: Object.values(batches),
      count: Object.keys(batches).length
    });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lists' });
  }
});

// ─── GET /api/lists/agent/:agentId ────────────────────────────────────────────
router.get('/agent/:agentId', async (req, res) => {
  try {
    const lists = await DistributedList.find({ agent: req.params.agentId })
      .populate('agent', 'name email mobile')
      .sort({ createdAt: -1 });

    res.json({ success: true, lists });
  } catch (error) {
    console.error('Get agent lists error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch agent lists' });
  }
});

// ─── DELETE /api/lists/batch/:batchId ────────────────────────────────────────
router.delete('/batch/:batchId', async (req, res) => {
  try {
    await DistributedList.deleteMany({ uploadBatch: req.params.batchId });
    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete batch' });
  }
});

module.exports = router;
