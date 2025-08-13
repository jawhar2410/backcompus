const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);

