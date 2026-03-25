export type TopUser = {
  id: number
  name: string
  initials: string
  rank: number
  points: string
  winRate: number
  bets: number
  medal: 'gold' | 'silver' | 'bronze' | 'none'
}

export const topUsers: TopUser[] = [
  {
    id: 1,
    name: 'Marcus Johnson',
    initials: 'MJ',
    rank: 1,
    points: '12,450',
    winRate: 68,
    bets: 142,
    medal: 'gold',
  },
  {
    id: 2,
    name: 'Sarah Chen',
    initials: 'SC',
    rank: 2,
    points: '11,890',
    winRate: 65,
    bets: 138,
    medal: 'silver',
  },
  {
    id: 3,
    name: 'James Williams',
    initials: 'JW',
    rank: 3,
    points: '10,320',
    winRate: 62,
    bets: 125,
    medal: 'bronze',
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    initials: 'ER',
    rank: 4,
    points: '9,750',
    winRate: 61,
    bets: 118,
    medal: 'none',
  },
  {
    id: 5,
    name: 'Daniel Carter',
    initials: 'DC',
    rank: 5,
    points: '9,280',
    winRate: 59,
    bets: 111,
    medal: 'none',
  },
]