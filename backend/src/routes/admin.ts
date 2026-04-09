import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { verifyAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Apply middleware to all admin routes
router.use(verifyAdmin);

// ------------ TEAMS ------------
router.get('/teams', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teams = await prisma.team.findMany({
            select: { id: true, username: true, status: true, startTime: true, endTime: true, score: true }
        });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/teams', async (req: AuthRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const newTeam = await prisma.team.create({
            data: { username, passwordHash: hash }
        });
        res.json({ message: 'Team created', id: newTeam.id });
    } catch (err: any) {
        if (err.code === 'P2002') return void res.status(400).json({ error: 'Username already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/teams/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Must delete sequences first due to relations
        await prisma.teamQuestionSequence.deleteMany({ where: { teamId: req.params.id } });
        await prisma.session.deleteMany({ where: { teamId: req.params.id } });
        await prisma.team.delete({ where: { id: req.params.id } });
        res.json({ message: 'Team deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


// ------------ QUESTIONS ------------
router.get('/questions', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const questions = await prisma.question.findMany();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/questions', async (req: AuthRequest, res: Response): Promise<void> => {
    const { text, optionA, optionB, optionC, optionD, correctOption } = req.body;
    try {
        const q = await prisma.question.create({
            data: { text, optionA, optionB, optionC, optionD, correctOption }
        });
        res.json({ message: 'Question created', id: q.id });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/questions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    const { text, optionA, optionB, optionC, optionD, correctOption } = req.body;
    try {
        await prisma.question.update({
            where: { id: req.params.id },
            data: { text, optionA, optionB, optionC, optionD, correctOption }
        });
        res.json({ message: 'Question updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/questions/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await prisma.teamQuestionSequence.deleteMany({ where: { questionId: req.params.id } });
        await prisma.question.delete({ where: { id: req.params.id } });
        res.json({ message: 'Question deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ------------ SETTINGS ------------
router.get('/settings', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const settings = await prisma.settings.findMany();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/settings', async (req: AuthRequest, res: Response): Promise<void> => {
    const { key, value } = req.body;
    try {
        await prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json({ message: 'Setting updated' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ------------ LEADERBOARD ------------
router.get('/leaderboard', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const leaderboard = await prisma.team.findMany({
            where: { status: 'COMPLETED' },
            orderBy: [{ score: 'desc' }, { startTime: 'desc' }],
            select: { id: true, username: true, score: true, correctAnswers: true, wrongAnswers: true, startTime: true, endTime: true }
        });
        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
