import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { verifyTeam } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'changethisinproduction';

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const team = await prisma.team.findUnique({ where: { username } });

    if (!team) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (team.status === 'COMPLETED') {
      res.status(403).json({ error: 'Team has already completed the quiz.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, team.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ teamId: team.id, role: 'team' }, JWT_SECRET, { expiresIn: '4h' });

    res.cookie('team_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });

    res.json({ message: 'Logged in successfully', token, team: { username: team.username, status: team.status } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/admin-login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      // For first time setup, let's create admin if it doesn't exist and the password is 'bugfixadmin123'
      if (username === 'admin' && password === 'bugfixadmin123') {
        const hash = await bcrypt.hash(password, 10);
        const newAdmin = await prisma.admin.create({
          data: { username, passwordHash: hash }
        });
        const token = jwt.sign({ adminId: newAdmin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
        res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.json({ message: 'Admin created and logged in', token });
        return;
      }
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }

    const token = jwt.sign({ adminId: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    res.json({ message: 'Admin logged in', token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const team = await prisma.team.findUnique({ where: { id: req.user.teamId } });
    if (!team) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    
    // Also fetch duration settings to know how much time is left relative to start
    const durationSetting = await prisma.settings.findUnique({ where: { key: 'TIMER_DURATION_MINUTES' } });
    const durationMinutes = durationSetting ? parseInt(durationSetting.value) : 60;

    res.json({
        team: {
            username: team.username,
            status: team.status,
            startTime: team.startTime,
            endTime: team.endTime
        },
        durationMinutes
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('team_token');
    res.json({ message: 'Logged out' });
});

router.post('/admin-logout', (req: Request, res: Response) => {
    res.clearCookie('admin_token');
    res.json({ message: 'Logged out' });
});

export default router;
