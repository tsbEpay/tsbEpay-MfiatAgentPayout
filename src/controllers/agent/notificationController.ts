import { Response, NextFunction } from 'express'
import { AuthRequest, successResponse } from '../../types'
import * as notificationService from '../../services/agent/notificationService'

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 20
    const unread = req.query.unread === 'true'

    const data = await notificationService.getNotifications(
      req.agent!.agentId,
      page,
      limit,
      unread
    )

    res.json(successResponse('Notifications retrieved', data))
  } catch (err) {
    next(err)
  }
}

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await notificationService.getUnreadCount(req.agent!.agentId)
    res.json(successResponse('Unread notification count retrieved', { count }))
  } catch (err) {
    next(err)
  }
}

export const getNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = String(req.params.notificationId)
    const data = await notificationService.getNotificationById(
      req.agent!.agentId,
      notificationId
    )
    res.json(successResponse('Notification retrieved', data))
  } catch (err) {
    next(err)
  }
}

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = String(req.params.notificationId)
    const data = await notificationService.markNotificationAsRead(
      req.agent!.agentId,
      notificationId
    )
    res.json(successResponse('Notification marked as read', data))
  } catch (err) {
    next(err)
  }
}

export const markAllRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await notificationService.markAllNotificationsAsRead(
      req.agent!.agentId
    )
    res.json(successResponse('All notifications marked as read', data))
  } catch (err) {
    next(err)
  }
}

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const notificationId = String(req.params.notificationId)
    const data = await notificationService.deleteNotification(
      req.agent!.agentId,
      notificationId
    )
    res.json(successResponse('Notification deleted', data))
  } catch (err) {
    next(err)
  }
}
