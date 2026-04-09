import { Router, Response } from 'express';
import prisma from '../utils/prisma';
import { verifyTeam, AuthRequest } from '../middleware/auth';

const router = Router();

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

router.post('/start', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
    const teamId = req.user.teamId;

    try {
        const team = await prisma.team.findUnique({ where: { id: teamId } });
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }

        if (team.status === 'COMPLETED') {
            res.status(403).json({ error: 'Quiz already completed.' });
            return;
        }

        if (team.status === 'IN_PROGRESS') {
            res.json({ message: 'Quiz already in progress', startTime: team.startTime });
            return;
        }

        // Get all questions from pool
        const allQuestions = await prisma.question.findMany();
        if (allQuestions.length === 0) {
            res.status(400).json({ error: 'No questions available' });
            return;
        }

        // Read how many questions per team from settings (default: 30)
        const qPerTeamSetting = await prisma.settings.findUnique({ where: { key: 'QUESTIONS_PER_TEAM' } });
        const questionsPerTeam = qPerTeamSetting ? parseInt(qPerTeamSetting.value) : 30;

        // Shuffle the full pool and pick a unique random subset for this team
        const shuffled = shuffleArray(allQuestions).slice(0, Math.min(questionsPerTeam, allQuestions.length));

        // Assign to team
        await prisma.teamQuestionSequence.createMany({
            data: shuffled.map((q, index) => ({
                teamId: team.id,
                questionId: q.id,
                orderIndex: index + 1
            }))
        });

        const updatedTeam = await prisma.team.update({
            where: { id: team.id },
            data: {
                status: 'IN_PROGRESS',
                startTime: new Date()
            }
        });

        res.json({ message: 'Quiz started', startTime: updatedTeam.startTime });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/questions', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const sequence = await prisma.teamQuestionSequence.findMany({
            where: { teamId: req.user.teamId },
            orderBy: { orderIndex: 'asc' },
            include: {
                question: {
                    select: {
                        id: true,
                        text: true,
                        optionA: true,
                        optionB: true,
                        optionC: true,
                        optionD: true
                        // Exclude correctOption for security
                    }
                }
            }
        });

        res.json(sequence);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/save-answer', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
    const { sequenceId, selectedOption } = req.body; // A, B, C, D

    try {
        const team = await prisma.team.findUnique({ where: { id: req.user.teamId } });
        if (!team || team.status === 'COMPLETED') {
            res.status(403).json({ error: 'Not allowed to answer.' });
            return;
        }

        // Check timeout
        const durSetting = await prisma.settings.findUnique({ where: { key: 'TIMER_DURATION_MINUTES' } });
        const minutes = durSetting ? parseInt(durSetting.value) : 60;
        
        if (team.startTime) {
            const timeElapsed = (new Date().getTime() - team.startTime.getTime()) / 60000;
            if (timeElapsed > minutes + 1) { // 1 min grace period
                res.status(403).json({ error: 'Time is up. Quiz should be submitted automatically.' });
                return;
            }
        }

        const seq = await prisma.teamQuestionSequence.findFirst({
            where: { id: sequenceId, teamId: req.user.teamId },
            include: { question: true }
        });

        if (!seq) {
            res.status(404).json({ error: 'Question sequence not found' });
            return;
        }

        const isCorrect = seq.question.correctOption === selectedOption;

        await prisma.teamQuestionSequence.update({
            where: { id: sequenceId },
            data: { selectedOption, isCorrect }
        });

        res.json({ message: 'Answer saved' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/submit', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teamId = req.user.teamId;
        const team = await prisma.team.findUnique({ where: { id: teamId } });

        if (!team || team.status === 'COMPLETED') {
            res.status(400).json({ error: 'Already completed or not found' });
            return;
        }

        const answers = await prisma.teamQuestionSequence.findMany({
            where: { teamId }
        });

        let correctCount = 0;
        let wrongCount = 0;

        answers.forEach(a => {
            if (a.selectedOption) {
                if (a.isCorrect) correctCount++;
                else wrongCount++;
            }
        });

        const score = correctCount * 4 - wrongCount * 1; // Example: +4 for correct, -1 for wrong

        await prisma.team.update({
            where: { id: teamId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
                score,
                correctAnswers: correctCount,
                wrongAnswers: wrongCount
            }
        });

        res.json({ message: 'Quiz submitted successfully', score, correctCount, wrongCount });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/result', verifyTeam, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const teamId = req.user.teamId;
        const team = await prisma.team.findUnique({ where: { id: teamId } });

        if (!team || team.status !== 'COMPLETED') {
            res.status(403).json({ error: 'Result not available yet' });
            return;
        }

        // Leaderboard position calculation
        const allCompleted = await prisma.team.findMany({
            where: { status: 'COMPLETED' },
            orderBy: [{ score: 'desc' }, { startTime: 'desc' }]
        });
        
        let rank = allCompleted.findIndex(t => t.id === team.id) + 1;

        res.json({
            teamName: team.username,
            score: team.score,
            correctAnswers: team.correctAnswers,
            wrongAnswers: team.wrongAnswers,
            startTime: team.startTime,
            endTime: team.endTime,
            rank
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});



export default router;
