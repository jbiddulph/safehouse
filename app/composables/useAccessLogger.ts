export const useAccessLogger = () => {
  const logAccess = async (data: {
    propertyId?: string
    userEmail?: string
    accessType: 'property_view' | 'emergency_request' | 'access_granted' | 'access_denied'
    url: string
    phoneNumber?: string
  }) => {
    try {
      // Generate a session ID if not already set
      let sessionId = sessionStorage.getItem('safehouse_session_id')
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem('safehouse_session_id', sessionId)
      }

      const logData = {
        ...data,
        userAgent: navigator.userAgent,
        sessionId
      }

      const response = await $fetch('/api/access-logs/log', {
        method: 'POST',
        body: logData
      })

      console.log('Access logged:', response)
      return response
    } catch (error) {
      console.error('Failed to log access:', error)
      // Don't throw error - logging should not break the user experience
      return null
    }
  }

  const logPropertyView = async (propertyId: string, propertyName?: string) => {
    return await logAccess({
      propertyId,
      accessType: 'property_view',
      url: window.location.href
    })
  }

  const logEmergencyRequest = async (propertyId: string, userEmail: string, phoneNumber?: string) => {
    return await logAccess({
      propertyId,
      userEmail,
      accessType: 'emergency_request',
      url: window.location.href,
      phoneNumber
    })
  }

  const logAccessGranted = async (propertyId: string, userEmail?: string) => {
    return await logAccess({
      propertyId,
      userEmail,
      accessType: 'access_granted',
      url: window.location.href
    })
  }

  const logAccessDenied = async (propertyId: string, userEmail?: string) => {
    return await logAccess({
      propertyId,
      userEmail,
      accessType: 'access_denied',
      url: window.location.href
    })
  }

  return {
    logAccess,
    logPropertyView,
    logEmergencyRequest,
    logAccessGranted,
    logAccessDenied
  }
}
