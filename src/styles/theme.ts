export const theme = {
  colors: {
    background: {
      primary: '#0D1117',
      secondary: '#161B22',
      tertiary: '#21262D',
    },
    accent: {
      primary: '#0A84FF',
      success: '#2DA44E',
      warning: '#D29922',
      error: '#F85149',
    },
    category: {
      work: '#0A84FF',
      personal: '#2DA44E',
      team: '#DB61A2',
      selfImprovement: '#D29922',
    },
    text: {
      primary: '#F0F6FC',
      secondary: '#8B949E',
      muted: '#484F58',
    },
  },
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024,
  },
  spacing: {
    touchTarget: 44,
    touchTargetLarge: 48,
    touchGap: 8,
  },
} as const;

export type Theme = typeof theme;
