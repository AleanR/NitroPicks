export type StatCard = {
  id: number
  value: string
  label: string
  icon: 'leagues' | 'points' | 'wins'
}

export type UpcomingGame = {
  id: number
  title: string
  date: string
  time: string
  status: 'open' | 'closed'
}

export type Winner = {
  id: number
  initials: string
  name: string
  points: string
  subtitle: string
}

export const statCards: StatCard[] = [
  {
    id: 1,
    value: '1,274',
    label: 'Active Leagues',
    icon: 'leagues',
  },
  {
    id: 2,
    value: '4,512,800',
    label: 'Points Circulating',
    icon: 'points',
  },
  {
    id: 3,
    value: '12',
    label: 'Total Wins',
    icon: 'wins',
  },
]

export const upcomingGames: UpcomingGame[] = [
  {
    id: 1,
    title: 'UCF Knights vs. Central State',
    date: 'Sat, Mar 27',
    time: 'Kickoff 7:30 PM',
    status: 'open',
  },
  {
    id: 2,
    title: 'UCF Knights vs. Coastal City',
    date: 'Sun, Mar 28',
    time: 'Kickoff 2:00 PM',
    status: 'open',
  },
  {
    id: 3,
    title: 'UCF Knights vs. State University',
    date: 'Wed, Mar 31',
    time: 'Kickoff 8:00 PM',
    status: 'open',
  },
  {
    id: 4,
    title: 'UCF Knights vs. Conference Rival',
    date: 'Sat, Apr 3',
    time: 'Kickoff 3:00 PM',
    status: 'closed',
  },
]

export const winners: Winner[] = [
  {
    id: 1,
    initials: 'MJ',
    name: 'Malik Johnson',
    points: '5,405 pts',
    subtitle: 'Predicted winner of East State +9, +8 units',
  },
  {
    id: 2,
    initials: 'SB',
    name: 'Sophia Bennett',
    points: '3,200 pts',
    subtitle: 'Daily placing in home game',
  },
  {
    id: 3,
    initials: 'LR',
    name: 'Liam Ramirez',
    points: '2,450 pts',
    subtitle: 'Best pick week-off',
  },
]