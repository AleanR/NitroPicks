export type ProfileUser = {
  fullName: string
  username: string
  email: string
  campus: string
  school: string
  memberSince: string
  balance: string
  totalBets: number
  winRate: number
}

export type WeeklyProgressDay = {
  day: string
  value: number
}

export type RecentTransaction = {
  id: number
  title: string
  date: string
  amount: string
  type: 'positive' | 'negative'
}

export type ActiveBet = {
  id: number
  matchup: string
  market: string
  stake: string
  status: string
}

export const profileUser: ProfileUser = {
  fullName: 'Avery Knight',
  username: 'AveryKnight',
  email: 'test@gmail.com',
  campus: 'Orlando, FL',
  school: 'University of Central Florida',
  memberSince: '2023',
  balance: '4,860',
  totalBets: 48,
  winRate: 62,
}

export const weeklyProgress: WeeklyProgressDay[] = [
  { day: 'Mon', value: 200 },
  { day: 'Tue', value: 150 },
  { day: 'Wed', value: 300 },
  { day: 'Thu', value: 250 },
  { day: 'Fri', value: 400 },
  { day: 'Sat', value: 350 },
  { day: 'Sun', value: 500 },
]

export const recentTransactions: RecentTransaction[] = [
  {
    id: 1,
    title: 'Daily Login Bonus',
    date: 'Mar 25, 2026',
    amount: '+50 KP',
    type: 'positive',
  },
  {
    id: 2,
    title: 'Thomas, Knight Kick-off',
    date: 'Mar 24, 2026',
    amount: '-1250 KP',
    type: 'negative',
  },
  {
    id: 3,
    title: 'Contest Reward (March Bracket)',
    date: 'Mar 04, 2026',
    amount: '+2000 KP',
    type: 'positive',
  },
  {
    id: 4,
    title: 'Manual Adjustment',
    date: 'Feb 18, 2026',
    amount: '+40 KP',
    type: 'positive',
  },
]

export const activeBets: ActiveBet[] = [
  {
    id: 1,
    matchup: 'UCF vs South Florida',
    market: 'Spread • UCF -3.5',
    stake: '250 KP',
    status: 'Pending',
  },
  {
    id: 2,
    matchup: 'UCF vs Cincinnati',
    market: 'Moneyline • UCF Win',
    stake: '500 KP',
    status: 'Pending',
  },
]