export type MarketEvent = {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  status: string
  homeEmoji: string
  awayEmoji: string
  spread: {
    label: string
    odds: string
  }
  moneyline: {
    label: string
    odds: string
  }
  total: {
    label: string
    odds: string
  }
}

export const marketEvents: MarketEvent[] = [
  {
    id: 1,
    homeTeam: 'UCF Knights',
    awayTeam: 'South Florida Bulls',
    date: 'Sat, Mar 27',
    time: '7:30 PM',
    status: 'Open',
    homeEmoji: '🏀',
    awayEmoji: '🐂',
    spread: {
      label: 'UCF -3.5',
      odds: '-150',
    },
    moneyline: {
      label: 'UCF Win',
      odds: '-150',
    },
    total: {
      label: 'O/U 48.5',
      odds: '-110',
    },
  },
  {
    id: 2,
    homeTeam: 'UCF Knights',
    awayTeam: 'Cincinnati Bearcats',
    date: 'Sun, Mar 28',
    time: '2:00 PM',
    status: 'Open',
    homeEmoji: '🏀',
    awayEmoji: '🐱',
    spread: {
      label: 'UCF -1.5',
      odds: '-110',
    },
    moneyline: {
      label: 'UCF Win',
      odds: '-110',
    },
    total: {
      label: 'O/U 49',
      odds: '-110',
    },
  },
  {
    id: 3,
    homeTeam: 'UCF Knights',
    awayTeam: 'Houston Cougars',
    date: 'Wed, Mar 31',
    time: '9:00 PM',
    status: 'Open',
    homeEmoji: '🏀',
    awayEmoji: '🐾',
    spread: {
      label: 'UCF +2.0',
      odds: '+100',
    },
    moneyline: {
      label: 'UCF Win',
      odds: '+120',
    },
    total: {
      label: 'O/U 51.5',
      odds: '-105',
    },
  },
]