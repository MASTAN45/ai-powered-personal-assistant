import { Request, Response } from 'express';
import deadlineService from '../services/deadline.service';

export const extractDeadlines = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.body;
    const userId = (req as any).user.id;

    const deadlines = await deadlineService.extractDeadlinesFromConversation(conversationId, userId);

    res.status(200).json({
      data: { deadlines },
      message: `Extracted ${deadlines.length} deadline(s)`,
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to extract deadlines',
      details: error.message,
    });
  }
};

export const getUpcomingDeadlines = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const deadlines = await deadlineService.getUpcomingDeadlines(userId);

    res.status(200).json({
      data: { deadlines },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve upcoming deadlines',
      details: error.message,
    });
  }
};

export const getOverdueDeadlines = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const deadlines = await deadlineService.getOverdueDeadlines(userId);

    res.status(200).json({
      data: { deadlines },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve overdue deadlines',
      details: error.message,
    });
  }
};

export const getAllDeadlines = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const deadlines = await deadlineService.getAllDeadlines(userId);

    res.status(200).json({
      data: { deadlines },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve deadlines',
      details: error.message,
    });
  }
};

export const updateDeadlineStatus = async (req: Request, res: Response) => {
  try {
    const { deadlineId } = req.params;
    const { status } = req.body;

    const deadline = await deadlineService.updateDeadlineStatus(deadlineId, status);

    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json({
      data: { deadline },
      message: 'Deadline status updated',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update deadline status',
      details: error.message,
    });
  }
};

export const confirmDeadline = async (req: Request, res: Response) => {
  try {
    const { deadlineId } = req.params;
    const updates = req.body;

    const deadline = await deadlineService.confirmDeadline(deadlineId, updates);

    if (!deadline) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json({
      data: { deadline },
      message: 'Deadline confirmed',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to confirm deadline',
      details: error.message,
    });
  }
};

export const deleteDeadline = async (req: Request, res: Response) => {
  try {
    const { deadlineId } = req.params;

    const success = await deadlineService.deleteDeadline(deadlineId);

    if (!success) {
      return res.status(404).json({ error: 'Deadline not found' });
    }

    res.status(200).json({
      message: 'Deadline deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete deadline',
      details: error.message,
    });
  }
};