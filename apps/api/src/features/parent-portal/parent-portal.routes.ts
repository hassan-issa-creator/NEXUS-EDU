import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Dashboard
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      children: [],
    },
    message: 'Parent dashboard - Coming soon',
  });
});

router.get('/dashboard/:studentId', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Student details - Coming soon',
  });
});

// Notifications
router.get('/notifications', authenticateToken, (req, res) => {
  res.json({ success: true, data: [], message: 'Notifications - Coming soon' });
});

router.put('/notifications/:id/read', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});

// Messages
router.get('/messages', authenticateToken, (req, res) => {
  res.json({ success: true, data: [], message: 'Messages - Coming soon' });
});

router.post('/messages', authenticateToken, (req, res) => {
  res
    .status(201)
    .json({ success: true, message: 'Message sent - Coming soon' });
});

// Student Details
router.get('/students/:id/grades', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Student grades - Coming soon',
  });
});

router.get('/students/:id/attendance', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Student attendance - Coming soon',
  });
});

router.get('/students/:id/assignments', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Student assignments - Coming soon',
  });
});

router.get('/students/:id/behavior', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Behavior records - Coming soon',
  });
});

export default router;
