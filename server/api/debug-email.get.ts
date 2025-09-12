export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  
  return {
    success: true,
    emailConfig: {
      hasUsername: !!config.mailtrapUser,
      hasPassword: !!config.mailtrapPass,
      username: config.mailtrapUser ? config.mailtrapUser.substring(0, 3) + '***' : 'Not set',
      isGmail: config.mailtrapUser?.includes('@gmail.com') || false,
      expectedHost: config.mailtrapUser?.includes('@gmail.com') ? 'smtp.gmail.com' : 'live.smtp.mailtrap.io'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: config.public.baseUrl
    }
  }
})
