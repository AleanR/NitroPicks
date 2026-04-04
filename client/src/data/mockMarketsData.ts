export type MarketEvent = {
  id: number
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  status: string
  homeEmoji: string
  awayEmoji: string
  moneyline: {
    home: {
      label: string
      odds: string
    }
    away: {
      label: string
      odds: string
    }
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
    moneyline: {
      home: {
        label: 'UCF Win',
        odds: '1.67',
      },
      away: {
        label: 'South Florida Win',
        odds: '2.25',
      },
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
    moneyline: {
      home: {
        label: 'UCF Win',
        odds: '1.91',
      },
      away: {
        label: 'Cincinnati Win',
        odds: '1.91',
      },
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
    moneyline: {
      home: {
        label: 'UCF Win',
        odds: '2.20',
      },
      away: {
        label: 'Houston Win',
        odds: '1.67',
      },
    },
  },
]