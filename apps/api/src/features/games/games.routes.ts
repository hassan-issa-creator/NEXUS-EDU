import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();

// Game Management
router.post('/', authenticateToken, (req, res) => {
  res
    .status(201)
    .json({ success: true, message: 'Game created - Coming soon' });
});

router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Games list - Coming soon' });
});

router.get('/:id', (req, res) => {
  res.json({ success: true, message: 'Game details - Coming soon' });
});

// Game Sessions
router.post('/:id/start', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Game started - Coming soon' });
});

router.post('/:id/submit', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Answer submitted - Coming soon' });
});

router.post('/:id/finish', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Game finished - Coming soon' });
});

// Leaderboard
router.get('/:id/leaderboard', (req, res) => {
  res.json({ success: true, data: [], message: 'Leaderboard - Coming soon' });
});

// Achievements
router.get('/achievements', authenticateToken, (req, res) => {
  res.json({ success: true, data: [], message: 'Achievements - Coming soon' });
});

export default router;
