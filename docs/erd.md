# NitroPicks — Entity Relationship Diagram

```mermaid
erDiagram

    USER {
        ObjectId _id PK
        string firstname
        string lastname
        string ucfID
        string username
        string email
        string major
        number pointBalance
        boolean isVerified
        string role
        string authentication_password
        string authentication_resetPasswordToken
        date authentication_resetPasswordExpires
        date createdAt
        date updatedAt
    }

    GAME {
        ObjectId _id PK
        string homeTeam
        string awayTeam
        number numBettorsHome
        number numBettorsAway
        number totalBetAmountHome
        number totalBetAmountAway
        number betPool
        string homeWin_label
        number homeWin_odds
        string awayWin_label
        number awayWin_odds
        number scoreHome
        number scoreAway
        string winner
        string status
        date bettingOpensAt
        date bettingClosesAt
        date createdAt
        date updatedAt
    }

    BET {
        ObjectId _id PK
        ObjectId userId FK
        number stake
        string betType
        string status
        number totalOdds
        number expectedPayout
        date createdAt
        date updatedAt
    }

    BET_LEG {
        ObjectId gameId FK
        string team
        number odds
        string result
    }

    REWARD {
        ObjectId _id PK
        string name
        string category
        string description
        number pointsCost
        number quantityAvailable
        number quantityRedeemed
        boolean isActive
        string eligibility
        string redemptionInstructions
        date createdAt
        date updatedAt
    }

    USER ||--o{ BET : "places"
    BET ||--|{ BET_LEG : "contains"
    BET_LEG }o--|| GAME : "references"
    USER ||--o{ REWARD : "redeems"
```

## Notes
- `BET_LEG` is an embedded subdocument inside `BET` (not a separate collection)
- `USER.pointBalance` is the single shared balance used for both betting credits and Knight Points — split into `betCredits` / `knightPoints` is pending
- `REWARD` catalog is currently hardcoded; the full seeded catalog (30 rewards) needs to be loaded via `seedRewards.js`
- `GAME.status` transitions: `upcoming → live → finished` or `→ cancelled`
- A `parlay` BET has multiple BET_LEGs (one per game); a `single` BET has exactly one
