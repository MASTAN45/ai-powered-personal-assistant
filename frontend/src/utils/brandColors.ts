/**
 * Brand Color Mapping Utility
 * Maps UI elements to the Red-Yellow-Green premium design system
 */

export const brandColors = {
  // Primary Actions & Important Items
  primary: {
    bg: 'bg-brand-red-500',
    bgHover: 'hover:bg-brand-red-600',
    text: 'text-brand-red-500',
    textHover: 'hover:text-brand-red-600',
    border: 'border-brand-red-500',
    ring: 'ring-brand-red-500',
    from: 'from-brand-red-500',
    to: 'to-brand-red-600',
  },

  // Warning & Pending States
  warning: {
    bg: 'bg-brand-yellow-500',
    bgHover: 'hover:bg-brand-yellow-600',
    bgLight: 'bg-brand-yellow-50',
    text: 'text-brand-yellow-500',
    textHover: 'hover:text-brand-yellow-600',
    border: 'border-brand-yellow-500',
    ring: 'ring-brand-yellow-500',
  },

  // Success & Completion States
  success: {
    bg: 'bg-brand-green-500',
    bgHover: 'hover:bg-brand-green-600',
    bgLight: 'bg-brand-green-50',
    text: 'text-brand-green-500',
    textHover: 'hover:text-brand-green-600',
    border: 'border-brand-green-500',
    ring: 'ring-brand-green-500',
  },

  // Classification-specific colors
  classification: {
    urgent: {
      bg: 'bg-brand-red-500',
      bgLight: 'bg-brand-red-50 dark:bg-brand-red-900/20',
      text: 'text-brand-red-700 dark:text-brand-red-400',
      border: 'border-brand-red-200 dark:border-brand-red-800',
    },
    important: {
      bg: 'bg-brand-yellow-500',
      bgLight: 'bg-brand-yellow-50 dark:bg-brand-yellow-900/20',
      text: 'text-brand-yellow-700 dark:text-brand-yellow-400',
      border: 'border-brand-yellow-200 dark:border-brand-yellow-800',
    },
    fyi: {
      bg: 'bg-brand-green-500',
      bgLight: 'bg-brand-green-50 dark:bg-brand-green-900/20',
      text: 'text-brand-green-700 dark:text-brand-green-400',
      border: 'border-brand-green-200 dark:border-brand-green-800',
    },
    clientToReply: {
      bg: 'bg-brand-red-500',
      bgLight: 'bg-brand-red-50 dark:bg-brand-red-900/20',
      text: 'text-brand-red-700 dark:text-brand-red-400',
      border: 'border-brand-red-200 dark:border-brand-red-800',
    },
    assistantToReply: {
      bg: 'bg-brand-yellow-500',
      bgLight: 'bg-brand-yellow-50 dark:bg-brand-yellow-900/20',
      text: 'text-brand-yellow-700 dark:text-brand-yellow-400',
      border: 'border-brand-yellow-200 dark:border-brand-yellow-800',
    },
    noReplyNeeded: {
      bg: 'bg-brand-green-500',
      bgLight: 'bg-brand-green-50 dark:bg-brand-green-900/20',
      text: 'text-brand-green-700 dark:text-brand-green-400',
      border: 'border-brand-green-200 dark:border-brand-green-800',
    },
  },

  // Buttons
  button: {
    primary: 'bg-brand-red-500 hover:bg-brand-red-600 text-white',
    secondary: 'bg-brand-yellow-500 hover:bg-brand-yellow-600 text-white',
    success: 'bg-brand-green-500 hover:bg-brand-green-600 text-white',
    outline: 'border-2 border-brand-red-500 text-brand-red-500 hover:bg-brand-red-50',
  },

  // Badges
  badge: {
    red: 'bg-brand-red-100 text-brand-red-700 dark:bg-brand-red-900/30 dark:text-brand-red-400',
    yellow: 'bg-brand-yellow-100 text-brand-yellow-700 dark:bg-brand-yellow-900/30 dark:text-brand-yellow-400',
    green: 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-900/30 dark:text-brand-green-400',
  },

  // Status indicators
  status: {
    active: 'bg-brand-green-500',
    pending: 'bg-brand-yellow-500',
    inactive: 'bg-gray-400',
    error: 'bg-brand-red-500',
  },

  // Gradient backgrounds
  gradient: {
    primary: 'bg-gradient-to-r from-brand-red-500 to-brand-yellow-500',
    success: 'bg-gradient-to-r from-brand-green-500 to-brand-yellow-500',
    hero: 'bg-gradient-to-br from-brand-red-500 via-brand-yellow-500 to-brand-green-500',
  },
};

/**
 * Get classification color classes
 */
export function getClassificationColors(classification: string) {
  const key = classification.toLowerCase().replace(/_/g, '');
  
  switch (key) {
    case 'urgent':
    case 'clienttoreply':
      return brandColors.classification.urgent;
    case 'important':
    case 'assistanttoreply':
      return brandColors.classification.important;
    case 'fyi':
    case 'noreplyneeded':
      return brandColors.classification.fyi;
    default:
      return brandColors.classification.fyi;
  }
}

/**
 * Get status color
 */
export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'complete':
    case 'completed':
    case 'done':
      return 'text-brand-green-500';
    case 'pending':
    case 'in_progress':
      return 'text-brand-yellow-500';
    case 'urgent':
    case 'overdue':
      return 'text-brand-red-500';
    default:
      return 'text-gray-500';
  }
}
