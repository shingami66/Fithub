import { z } from 'zod/v4';

export const onboardingSchema = z.object({
  gender: z.enum(['male', 'female'], { message: 'Gender is required' }),
  age: z
    .number({ message: 'Age is required' })
    .min(13, 'Must be at least 13')
    .max(120, 'Invalid age'),
  heightCm: z
    .number({ message: 'Height is required' })
    .min(100, 'Invalid height')
    .max(250, 'Invalid height'),
  weightKg: z
    .number({ message: 'Weight is required' })
    .min(30, 'Invalid weight')
    .max(300, 'Invalid weight'),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active'], {
    message: 'Activity level is required',
  }),
  fitnessGoal: z.enum(['lose_fat', 'maintain', 'build_muscle'], {
    message: 'Fitness goal is required',
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export type UserProfile = OnboardingInput & {
  userId: string;
  bmr: number;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
