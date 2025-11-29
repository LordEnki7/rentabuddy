export const MOCK_BUDDIES = [
  {
    id: 1,
    name: "Sarah J.",
    city: "San Francisco, CA",
    rate: 45,
    bio: "Avid hiker and coffee enthusiast. I love exploring new trails and trying out local cafes. Great listener!",
    tags: ["Hiking", "Coffee", "Listening", "Museums"],
    rating: 4.9,
    reviews: 12,
    verified: true,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 2,
    name: "David Chen",
    city: "New York, NY",
    rate: 60,
    bio: "Tech professional who enjoys gallery hopping and board games. Happy to accompany you to events or just chat.",
    tags: ["Art", "Board Games", "Tech", "Events"],
    rating: 5.0,
    reviews: 28,
    verified: true,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 3,
    name: "Elena R.",
    city: "Austin, TX",
    rate: 40,
    bio: "Foodie and live music fan. I can show you the best taco spots or go to a concert with you.",
    tags: ["Foodie", "Music", "Concerts", "Nightlife"],
    rating: 4.7,
    reviews: 8,
    verified: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 4,
    name: "Marcus W.",
    city: "Chicago, IL",
    rate: 55,
    bio: "History buff and architecture nerd. Let's take a walking tour or visit historical sites.",
    tags: ["History", "Architecture", "Walking Tours", "Trivia"],
    rating: 4.8,
    reviews: 15,
    verified: false,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 5,
    name: "Priya P.",
    city: "Seattle, WA",
    rate: 50,
    bio: "Book lover and tea drinker. Perfect companion for a quiet afternoon or a bookstore crawl.",
    tags: ["Books", "Tea", "Quiet", "Conversation"],
    rating: 5.0,
    reviews: 5,
    verified: true,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: 6,
    name: "James T.",
    city: "Boston, MA",
    rate: 45,
    bio: "Sports fan and gym goer. Need a gym buddy or someone to watch the game with? I'm your guy.",
    tags: ["Sports", "Gym", "Running", "Beer"],
    rating: 4.6,
    reviews: 20,
    verified: true,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
  }
];

export const MOCK_BOOKINGS = [
  {
    id: 101,
    buddyName: "Sarah J.",
    date: "2025-06-15",
    time: "14:00 - 16:00",
    location: "Golden Gate Park",
    status: "CONFIRMED",
    type: "Upcoming"
  },
  {
    id: 102,
    buddyName: "David Chen",
    date: "2025-05-20",
    time: "19:00 - 21:00",
    location: "MoMA",
    status: "COMPLETED",
    type: "Past"
  }
];
