import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.admin_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Unauthorized. No token provided.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changethisinproduction') as any;
    
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return; // Added return to satisfy TypeScript returning void
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export const verifyTeam = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.team_token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changethisinproduction') as any;
    
    const team = await prisma.team.findUnique({ where: { id: decoded.teamId } });
    if (!team) {
      res.status(401).json({ error: 'Team not found.' });
      return;
    }

    req.user = { teamId: team.id, status: team.status };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
