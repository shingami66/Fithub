export const dashboardConfig = {
  mainNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard' as const,
    },
    {
      title: 'Workouts',
      href: '/dashboard/workouts',
      icon: 'Dumbbell' as const,
    },
    {
      title: 'Nutrition',
      href: '/dashboard/nutrition',
      icon: 'Apple' as const,
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: 'BarChart3' as const,
    },
  ],
  sidebarNav: [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' as const },
        { title: 'Analytics', href: '/dashboard/analytics', icon: 'BarChart3' as const },
      ],
    },
    {
      title: 'Tracking',
      items: [
        { title: 'Workouts', href: '/dashboard/workouts', icon: 'Dumbbell' as const },
        { title: 'Nutrition', href: '/dashboard/nutrition', icon: 'Apple' as const },
        { title: 'Progress', href: '/dashboard/progress', icon: 'TrendingUp' as const },
      ],
    },
    {
      title: 'Account',
      items: [
        { title: 'Settings', href: '/dashboard/settings', icon: 'Settings' as const },
        { title: 'Profile', href: '/dashboard/profile', icon: 'User' as const },
      ],
    },
  ],
} as const;

export type DashboardConfig = typeof dashboardConfig;
