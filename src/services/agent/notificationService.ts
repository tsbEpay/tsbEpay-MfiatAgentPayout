import prisma from "../../lib/prisma"
import { NotFoundError } from "../../types"

export const getNotifications = async (
  agentId: string,
  page = 1,
  limit = 20,
  unread?: boolean
) => {
  const where: any = { agentId }
  if (unread) {
    where.isRead = false
  }

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    notifications,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export const getUnreadCount = async (agentId: string) => {
  return prisma.notification.count({
    where: {
      agentId,
      isRead: false,
    },
  })
}

export const getNotificationById = async (
  agentId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      agentId,
    },
  })

  if (!notification) {
    throw new NotFoundError("Notification not found")
  }

  return notification
}

export const markNotificationAsRead = async (
  agentId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      agentId,
    },
  })

  if (!notification) {
    throw new NotFoundError("Notification not found")
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })
}

export const markAllNotificationsAsRead = async (agentId: string) => {
  await prisma.notification.updateMany({
    where: {
      agentId,
      isRead: false,
    },
    data: { isRead: true },
  })

  return { message: "All notifications marked as read" }
}

export const deleteNotification = async (
  agentId: string,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      agentId,
    },
  })

  if (!notification) {
    throw new NotFoundError("Notification not found")
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  })

  return { message: "Notification deleted successfully" }
}
