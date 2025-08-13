const CalendarEvent = require('../models/CalendarEvent');

const calendarController = {
  getAllEvents: async (req, res) => {
    try {
      const events = await CalendarEvent.find();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      const { title, description, date, createdBy } = req.body;
      const newEvent = new CalendarEvent({
        title,
        description,
        date,
        createdBy,
      });
      const savedEvent = await newEvent.save();
      res.json(savedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const { eventId, title, description, date } = req.body;
      const updatedEvent = await CalendarEvent.findByIdAndUpdate(
        eventId,
        { title, description, date },
        { new: true }
      );
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      const { eventId } = req.params;
      await CalendarEvent.findByIdAndRemove(eventId);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = calendarController;
