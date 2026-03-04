<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
const route = useRoute()

const seoByPath: Record<string, { title: string; description: string; keywords: string }> = {
  '/': {
    title: 'Home',
    description: 'MySafeHouse helps emergency services gain secure, time-critical access to your property when emergency or standard access is requested.',
    keywords: 'MySafeHouse, emergency access, property access, secure home access, NFC access, QR access, UK property security'
  },
  '/about': {
    title: 'About Us',
    description: 'Learn about MySafeHouse and how we provide secure, verified property access for emergencies and authorised requests.',
    keywords: 'about MySafeHouse, property access platform, emergency home access, secure access management'
  },
  '/how-it-works': {
    title: 'How It Works',
    description: 'See how MySafeHouse works for property owners, emergency responders and authorised visitors.',
    keywords: 'how MySafeHouse works, property access workflow, emergency access process, home access platform'
  },
  '/privacy-policy': {
    title: 'Privacy Policy',
    description: 'Read the MySafeHouse privacy policy and learn how we collect, use and protect personal data.',
    keywords: 'MySafeHouse privacy policy, data protection, GDPR, personal data, privacy'
  },
  '/terms': {
    title: 'Terms & Conditions',
    description: 'Review the MySafeHouse terms and conditions for using our property access platform.',
    keywords: 'MySafeHouse terms, terms and conditions, platform usage policy, legal terms'
  },
  '/payments': {
    title: 'Payments',
    description: 'Choose your MySafeHouse subscription plan or purchase additional property credits.',
    keywords: 'MySafeHouse pricing, subscription, buy credits, property access plan, payments'
  },
  '/payment-success': {
    title: 'Payment Success',
    description: 'Your MySafeHouse payment was successful. Continue to your dashboard to manage properties and access.',
    keywords: 'payment success, subscription activated, MySafeHouse dashboard'
  },
  '/coming-soon': {
    title: 'Coming Soon',
    description: 'MySafeHouse is preparing to launch. Stay informed and be notified when the service goes live.',
    keywords: 'MySafeHouse coming soon, launch updates, property access platform'
  },
  '/dashboard': {
    title: 'Dashboard',
    description: 'Manage your MySafeHouse properties, emergency contacts, access requests and account settings.',
    keywords: 'MySafeHouse dashboard, manage properties, emergency contacts, access requests'
  },
  '/profile': {
    title: 'Profile',
    description: 'Manage your MySafeHouse account profile, contact details and preferences.',
    keywords: 'MySafeHouse profile, account settings, user profile'
  },
  '/access-request': {
    title: 'Access Request',
    description: 'Submit an emergency or standard access request to a registered MySafeHouse property.',
    keywords: 'request property access, emergency request, MySafeHouse access request'
  },
  '/access-requests': {
    title: 'Access Requests',
    description: 'Review and manage incoming MySafeHouse access requests for your properties.',
    keywords: 'manage access requests, property access approvals, MySafeHouse requests'
  },
  '/access-code-verification': {
    title: 'Access Code Verification',
    description: 'Verify property access codes issued through MySafeHouse.',
    keywords: 'access code verification, verify property code, MySafeHouse access code'
  },
  '/qr-scan': {
    title: 'QR Scan',
    description: 'Scan MySafeHouse QR codes to continue to secure property access actions.',
    keywords: 'QR scan, MySafeHouse QR, property access QR code'
  },
  '/domains': {
    title: 'Domain Management',
    description: 'Manage allowed and blocked domains for MySafeHouse access control.',
    keywords: 'domain management, allowed domains, blocked domains, MySafeHouse admin'
  },
  '/admin': {
    title: 'Admin Panel',
    description: 'Manage users, NFC codes, settings and access logs in the MySafeHouse admin panel.',
    keywords: 'MySafeHouse admin, admin panel, NFC codes, access logs, settings'
  },
  '/admin/nfc-codes': {
    title: 'Admin NFC Codes',
    description: 'Manage, assign and review NFC codes and linked property access routes.',
    keywords: 'NFC codes admin, assign NFC codes, MySafeHouse NFC management'
  },
  '/admin/access-logs': {
    title: 'Admin Access Logs',
    description: 'Review property access activity and audit access logs in MySafeHouse.',
    keywords: 'access logs, audit trail, property access history, MySafeHouse admin'
  },
  '/admin-access-logs': {
    title: 'Admin Access Logs',
    description: 'Review property access activity and audit access logs in MySafeHouse.',
    keywords: 'access logs, audit trail, property access history, MySafeHouse admin'
  },
  '/auth/login': {
    title: 'Sign In',
    description: 'Sign in to your MySafeHouse account.',
    keywords: 'MySafeHouse sign in, login, account access'
  },
  '/auth/register': {
    title: 'Sign Up',
    description: 'Create a MySafeHouse account to manage property access and emergency requests.',
    keywords: 'MySafeHouse sign up, register, create account, property access account'
  },
  '/auth/forgot-password': {
    title: 'Forgotten Password',
    description: 'Request a password reset link for your MySafeHouse account.',
    keywords: 'forgot password, reset password link, MySafeHouse account recovery'
  },
  '/auth/reset-password': {
    title: 'Reset Password',
    description: 'Set a new password for your MySafeHouse account.',
    keywords: 'reset password, account recovery, MySafeHouse password'
  },
  '/auth/confirm': {
    title: 'Confirm Account',
    description: 'Confirm your MySafeHouse account details and complete sign-up.',
    keywords: 'confirm account, email verification, MySafeHouse sign-up'
  }
}

const defaultSeo = {
  title: 'MySafeHouse',
  description: 'Secure emergency and authorised property access management for homes and properties in the UK.',
  keywords: 'MySafeHouse, property access, emergency access, home security, NFC, QR code access'
}

const currentSeo = computed(() => {
  const path = route.path

  if (seoByPath[path]) {
    return seoByPath[path]
  }

  if (path.startsWith('/property/')) {
    return {
      title: 'Property Details',
      description: 'View property details and access information managed with MySafeHouse.',
      keywords: 'property details, property access, MySafeHouse property'
    }
  }

  if (path.startsWith('/nfc/')) {
    return {
      title: 'NFC Access',
      description: 'NFC property access route provided by MySafeHouse.',
      keywords: 'NFC access, property NFC, MySafeHouse NFC'
    }
  }

  return defaultSeo
})

useSeoMeta({
  title: () => currentSeo.value.title,
  description: () => currentSeo.value.description,
  keywords: () => currentSeo.value.keywords
})
</script>
