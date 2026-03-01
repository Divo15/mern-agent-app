/**
 * List Model
 * Stores distributed list items assigned to agents from CSV uploads
 */

const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  notes: {
    type: String,
    default: '',
    trim: true
  }
});

const distributedListSchema = new mongoose.Schema(
  {
    // Reference to the upload batch
    uploadBatch: {
      type: String,
      required: true
    },
    // Agent this list is assigned to
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    // List items assigned to this agent
    items: [listItemSchema],
    // Original filename
    originalFileName: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DistributedList', distributedListSchema);
