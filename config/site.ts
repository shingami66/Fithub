export const siteConfig = {
  name: 'Project Pulse',
  description:
    'A highly optimized fitness tracking PWA for ultra-fast workout logging, macro/calorie tracking, and modern dashboard analytics.',
  url: 'https://projectpulse.app',
  ogImage: 'https://projectpulse.app/og.png',
  links: {
    github: 'https://github.com/project-pulse',
  },
} as const;

export type SiteConfig = typeof siteConfig;
