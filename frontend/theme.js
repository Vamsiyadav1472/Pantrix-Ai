export const Theme = {
  colors: {
    // Primary Brand (Emerald 500)
    primary: '#10b981',
    primaryDark: '#059669',
    primaryDarker: '#047857',
    primaryLight: '#34d399',
    primaryMid: '#10b981',

    // Secondary / Accent
    secondary: '#22c55e',
    secondaryDark: '#16a34a',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fef3c7',

    // Status Colors
    danger: '#ef4444',
    dangerLight: '#fecaca',
    dangerDark: '#dc2626',
    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    info: '#3b82f6',
    infoLight: '#dbeafe',

    // Purple accent
    purple: '#a855f7',
    purpleLight: '#f3e8ff',
    purpleDark: '#7e22ce',

    // Backgrounds (Slate 900 base)
    background: '#0f172a',
    backgroundMid: '#1e293b',
    backgroundBottom: '#022c22',
    card: 'rgba(30, 41, 59, 0.7)',
    cardGlass: 'rgba(30, 41, 59, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',

    // Text (All White)
    text: '#ffffff',
    textDark: '#ffffff',
    textMuted: '#ffffff',
    textLight: '#ffffff',
    textPlaceholder: '#ffffff',
    textOnPrimary: '#ffffff',

    // Borders
    border: 'rgba(255, 255, 255, 0.15)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderFocus: '#10b981',

    // Dark Mode (Same since we are permanently dark)
    darkBg: '#0f172a',
    darkBgMid: '#1e293b',
    darkBgBottom: '#022c22',
    darkCard: 'rgba(30, 41, 59, 0.8)',
    darkBorder: 'rgba(255, 255, 255, 0.08)',
    darkText: '#ffffff',
    darkTextMuted: '#ffffff',

    // Utility
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
  },

  gradients: {
    // Primary brand gradients
    primary: ['#10b981', '#059669'],
    primarySoft: ['#34d399', '#10b981'],
    primaryMild: ['#047857', '#064e3b'],

    // Background gradients (Slate to Emerald Dark)
    background: ['#0f172a', '#064e3b', '#022c22'],
    backgroundTop: ['#0f172a', '#1e293b'],

    // Card gradients (Glassmorphic Dark)
    cardGreen: ['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.1)'],
    cardAmber: ['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.1)'],
    cardBlue: ['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.1)'],
    cardRed: ['rgba(239, 68, 68, 0.15)', 'rgba(220, 38, 38, 0.1)'],
    cardPurple: ['rgba(168, 85, 247, 0.15)', 'rgba(126, 34, 206, 0.1)'],

    // Hero gradients
    heroDark: ['#0f172a', '#1e293b', '#0f172a'],
    heroGreen: ['#022c22', '#064e3b', '#10b981'],

    // Accent
    amber: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
    info: ['#3b82f6', '#2563eb'],
    purple: ['#a855f7', '#7e22ce'],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
    pill: 50,
    full: 9999,
  },

  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 10,
    },
    xl: {
      shadowColor: '#22C55E',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 28,
      elevation: 16,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  typography: {
    fontFamily: {
      heading: 'Outfit_700Bold',
      body: 'Inter_400Regular',
      bodySemiBold: 'Inter_600SemiBold',
    },
    h1: {
      fontSize: 32,
      fontFamily: 'Outfit_700Bold',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 26,
      fontFamily: 'Outfit_700Bold',
      lineHeight: 34,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 22,
      fontFamily: 'Outfit_700Bold',
      lineHeight: 30,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Outfit_700Bold',
      lineHeight: 28,
    },
    subtitle: {
      fontSize: 17,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      lineHeight: 24,
    },
    bodySm: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      lineHeight: 20,
    },
    caption: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      lineHeight: 18,
    },
    label: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 16,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    micro: {
      fontSize: 10,
      fontFamily: 'Inter_600SemiBold',
      lineHeight: 14,
      letterSpacing: 0.5,
    },
  },

  // Glass morphism preset
  glass: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Dark glass preset
  glassGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
};
