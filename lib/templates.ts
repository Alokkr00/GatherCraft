import { StarterTemplate } from './types';

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'cocktail-party',
    title: '2-Hour Cocktail Party',
    subtitle: 'High energy, structured networking & connection',
    category: 'Cocktail & Social',
    defaultPurpose: 'To bring together friends and new acquaintances for light bites, high-energy conversation, and introducing people who should know each other.',
    defaultDurationHours: 2,
    suggestedCapacity: 15,
    suggestedBudget: 150,
    coverImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-amber-500 to-rose-600',
    defaultSuccessCriteria: [
      'Guests meet at least 3 people they did not know before',
      'Hard end time enforced so guests leave wanting more',
      'Icebreakers kick off within the first 30 minutes'
    ]
  },
  {
    id: 'birthday-dinner',
    title: 'Intimate Birthday Dinner',
    subtitle: 'Meaningful, memorable, and warm seated dinner',
    category: 'Celebration',
    defaultPurpose: 'To gather close friends for an unforgettable evening of delicious food, heartfelt stories, and celebrating another year of life together.',
    defaultDurationHours: 3.5,
    suggestedCapacity: 10,
    suggestedBudget: 300,
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-violet-600 to-indigo-600',
    defaultSuccessCriteria: [
      'Every guest shares a favorite memory or toast',
      'Dietary restrictions seamlessly accommodated without stress',
      'Warm candles, ambient lighting & curated background playlist'
    ]
  },
  {
    id: 'casual-hang',
    title: 'Casual Weekend Hangout',
    subtitle: 'Low pressure, relaxed vibe for friends & family',
    category: 'Casual',
    defaultPurpose: 'To create a zero-stress space where friends can drop in, unwind, play games, and catch up without formal expectations.',
    defaultDurationHours: 4,
    suggestedCapacity: 20,
    suggestedBudget: 100,
    coverImage: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-emerald-500 to-teal-600',
    defaultSuccessCriteria: [
      'Drop-in friendly with continuous snacks & refreshing drinks',
      'Host spends more time socializing than cooking or cleaning',
      'Easy background games & icebreakers available'
    ]
  },
  {
    id: 'milestone-celebration',
    title: 'Milestone Party / Reception',
    subtitle: 'Vibrant celebration with music, toasts & photos',
    category: 'Celebration',
    defaultPurpose: 'To honor a big life moment with a vibrant gathering of family and friends, featuring memorable toasts, music, and lasting photos.',
    defaultDurationHours: 4,
    suggestedCapacity: 40,
    suggestedBudget: 600,
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    themeColor: 'from-pink-500 to-purple-600',
    defaultSuccessCriteria: [
      'Central toast/speech block at the peak of attendance',
      'Seamless guest check-in & photo collection setup',
      'High RSVP turnout (> 80%)'
    ]
  }
];
