import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        email_confirmed_at: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    return { data: users }
  } catch (error) {
    console.error('Database error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users'
    })
  }
})
