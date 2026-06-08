import swaggerJsdoc from 'swagger-jsdoc'
import { env } from '../config/env'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mfiat Agent API',
    version: '1.0.0',
    description: 'Authentication and KYC endpoints for the Mfiat agent platform',
  },
  servers: [
    {
      url: `${env.NODE_ENV === 'production' ? env.BASE_URL_RENDER : env.BASE_URL }/api/v1`,
      description: `${env.NODE_ENV === 'production' ? 'Production' : 'Development'} server`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: ['object', 'array', 'string', 'number', 'boolean', 'null'] },
        },
        required: ['success', 'message'],
      },
      AuthRegisterRequest: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'] },
          username: { type: 'string' },
          password: { type: 'string' },
          confirmPassword: { type: 'string' },
          country: { type: 'string', minLength: 2, maxLength: 2 },
          referredBy: { type: 'string' },
          agreedToTerms: { type: 'boolean' },
        },
        required: ['firstName', 'lastName', 'email', 'phone', 'gender', 'username', 'password', 'confirmPassword', 'country', 'agreedToTerms'],
      },
      AuthLoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['password'],
      },
      AuthRefreshRequest: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string' },
        },
        required: ['refreshToken'],
      },
      AuthVerifyOtpRequest: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
        required: ['code'],
      },
      AuthResendOtpRequest: {
        type: 'object',
        properties: {},
      },
      AuthForgotPasswordRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
        required: ['email'],
      },
      AuthResetPasswordRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string' },
          password: { type: 'string' },
          confirmPassword: { type: 'string' },
        },
        required: ['email', 'code', 'password', 'confirmPassword'],
      },
      AuthPayload: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      KycSubmitRequest: {
        type: 'object',
        properties: {
          docType: { type: 'string', enum: ['PASSPORT', 'DRIVERS_LICENSE'] },
          idNumber: { type: 'string' },
          issuedDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          bankAccount: { type: 'string' },
          front: { type: 'string', format: 'binary' },
          back: { type: 'string', format: 'binary' },
          selfie: { type: 'string', format: 'binary' },
          bankStatement: { type: 'string', format: 'binary' },
          bankReceipt: { type: 'string', format: 'binary' },
        },
        required: ['docType', 'idNumber', 'issuedDate', 'bankAccount', 'front', 'back', 'selfie', 'bankStatement', 'bankReceipt'],
      },
      KycReviewRequest: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['APPROVED', 'REJECTED'] },
          reviewNote: { type: 'string' },
        },
        required: ['status'],
      },
      KycStatusResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          reviewNote: { type: 'string' },
          submittedAt: { type: 'string', format: 'date-time' },
          reviewedAt: { type: 'string', format: 'date-time' },
        },
      },
      KycPendingItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          docType: { type: 'string' },
          idNumber: { type: 'string' },
          frontUrl: { type: 'string' },
          backUrl: { type: 'string' },
          selfieUrl: { type: 'string' },
          bankStatement: { type: 'string' },
          bankReceipt: { type: 'string' },
          bankAccount: { type: 'string' },
          issuedDate: { type: 'string', format: 'date' },
          expiryDate: { type: 'string', format: 'date' },
          submittedAt: { type: 'string', format: 'date-time' },
          agent: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              country: { type: 'string' },
            },
          },
        },
      },
      NotificationItem: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['KYC_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED'] },
          title: { type: 'string' },
          body: { type: 'string' },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      NotificationListResponse: {
        type: 'object',
        properties: {
          notifications: {
            type: 'array',
            items: { $ref: '#/components/schemas/NotificationItem' },
          },
          meta: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
      NotificationCountResponse: {
        type: 'object',
        properties: {
          count: { type: 'number' },
        },
      },
      NotificationMessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new agent',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRegisterRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Agent registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Log in with username and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthLoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthRefreshRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'New tokens returned',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/verify-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Verify OTP code for authenticated agent',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthVerifyOtpRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OTP verified successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/resend-otp': {
      post: {
        tags: ['Auth'],
        summary: 'Resend OTP to authenticated agent email',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OTP resent successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthForgotPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset code requested',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using a reset code',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResetPasswordRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password reset successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Log out authenticated agent',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get authenticated agent profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profile retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/kyc/submit': {
      post: {
        tags: ['KYC'],
        summary: 'Submit KYC documents',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/KycSubmitRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'KYC submitted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/kyc/status': {
      get: {
        tags: ['KYC'],
        summary: 'Get current KYC submission status',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'KYC status retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/kyc/id/{kycId}': {
      get: {
        tags: ['KYC'],
        summary: 'Get a KYC submission by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'kycId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'KYC document retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
          '404': {
            description: 'KYC document not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/kyc/pending': {
      get: {
        tags: ['KYC'],
        summary: 'List pending KYC submissions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Pending KYC submissions retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifications for authenticated agent',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'unread', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'Notifications retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationListResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Unread notification count retrieved',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationCountResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/notifications/{notificationId}': {
      get: {
        tags: ['Notifications'],
        summary: 'Get a single notification by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Notification retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationItem' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a notification by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Notification deleted successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationMessageResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/notifications/{notificationId}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a notification as read',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'notificationId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Notification marked as read',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationItem' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/notifications/mark-all-read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'All notifications marked as read',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/NotificationMessageResponse' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/kyc/{kycId}/review': {
      patch: {
        tags: ['KYC'],
        summary: 'Review a KYC submission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'kycId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/KycReviewRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'KYC reviewed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiResponse' },
              },
            },
          },
        },
      },
    },
  },
}

const options = {
  definition: swaggerDefinition,
  apis: [],
}

const swaggerSpec = swaggerJsdoc(options)
export default swaggerSpec
