import { StarterTemplate } from './types';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'cocktail-party',
    title: 'To Spark New Connections',
    subtitle: 'Classic Mixer & Cocktails — high-energy introductions & dynamic conversation',
    category: 'Mixer & Cocktails',
    defaultPurpose: 'To bring together friends and new acquaintances for light bites, high-energy conversation, and introducing people who should know each other.',
    defaultDurationHours: 2,
    suggestedCapacity: 15,
    suggestedBudget: 150,
    coverImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-amber-500 to-rose-600',
    defaultSuccessCriteria: [
      'Guests meet at least 3 people they did not know before',
      'Hard end time enforced so guests leave energized wanting more',
      'Signature welcome drink & quick doorstep anchor in the first 20 minutes'
    ]
  },
  {
    id: 'birthday-dinner',
    title: 'To Deepen Friendships',
    subtitle: 'Intimate Birthday Dinner — seated sociopetal dinner & heartfelt toasts',
    category: 'Intimate Dinner',
    defaultPurpose: 'To gather close friends for an unforgettable evening of delicious food, heartfelt stories, and celebrating another year of life together.',
    defaultDurationHours: 3.5,
    suggestedCapacity: 10,
    suggestedBudget: 300,
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-violet-600 to-indigo-600',
    defaultSuccessCriteria: [
      'Every guest shares a favorite memory or heartfelt toast during dessert',
      'Sociopetal seating where all guests feel included in the room context',
      'Dietary restrictions seamlessly accommodated without awkwardness'
    ]
  },
  {
    id: 'casual-hang',
    title: 'To Simply Unwind',
    subtitle: 'Casual Weekend Hangout — zero-pressure drop-in connection',
    category: 'Casual Drop-in',
    defaultPurpose: 'To create a zero-stress space where friends can drop in, unwind, play games, and catch up without formal expectations.',
    defaultDurationHours: 4,
    suggestedCapacity: 20,
    suggestedBudget: 100,
    coverImage: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-emerald-500 to-teal-600',
    defaultSuccessCriteria: [
      'Drop-in friendly with continuous snacks & refreshing drinks',
      'Host spends more time socializing than cooking or cleaning',
      'Easy background games & icebreakers available for natural clumps'
    ]
  },
  {
    id: 'milestone-celebration',
    title: 'To Celebrate a Milestone',
    subtitle: 'Milestone Party / Reception — vibrant celebration with music, toasts & photos',
    category: 'Milestone Party',
    defaultPurpose: 'To honor a big life moment with a vibrant gathering of family and friends, featuring memorable toasts, music, and lasting photos.',
    defaultDurationHours: 4,
    suggestedCapacity: 40,
    suggestedBudget: 600,
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-pink-500 to-purple-600',
    defaultSuccessCriteria: [
      'Planned emotional peak: central toast block at the peak of attendance',
      'Seamless guest doorstep greeting & photo collection setup',
      'High RSVP turnout (> 80%) with lasting parting gratitude'
    ]
  }
];
