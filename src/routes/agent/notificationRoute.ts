import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth.middleware'
import * as notificationController from '../../controllers/agent/notificationController'

const notificationRoutes = Router()

notificationRoutes.use(authMiddleware);

notificationRoutes.get('/', notificationController.getNotifications)
notificationRoutes.get('/unread-count', notificationController.getUnreadCount)
notificationRoutes.get('/:notificationId', notificationController.getNotification)
notificationRoutes.patch('/mark-all-read', notificationController.markAllRead)
notificationRoutes.patch('/:notificationId/read', notificationController.markAsRead)
notificationRoutes.delete('/:notificationId', notificationController.deleteNotification)

export default notificationRoutes
