# Football Stat Game

## Project idea

A football statistics game in which the player selects footballers
and their corresponding seasons to satisfy specific requirements
and maximize the total score.

The project is inspired by the gameplay concept of StatPad Game,
but uses football statistics and an original interface.

## Core gameplay

Each daily game contains five slots.

Every slot defines:

- player requirements,
- season requirements,
- career requirements,
- a scoring statistic.

The user selects one footballer and one season for every slot.

If the answer satisfies all requirements, the selected statistic
from that season is added to the total score.

## Example

Requirements:

- played for FC Barcelona,
- forward,
- season between 2015/16 and 2022/23.

Scoring category:

- goals.

Valid answer:

- Luis Suárez, 2015/16.

## MVP

- one playable game,
- five answer slots,
- player search,
- season selection,
- answer validation,
- score calculation,
- percentile calculation,
- game summary,
- responsive interface,
- light and dark mode.

## Initial data scope

The initial prototype will use a manually prepared local dataset.

Planned statistics:

- appearances,
- starts,
- minutes,
- goals,
- assists,
- yellow cards,
- red cards,
- clean sheets.

Planned qualifiers:

- club,
- league,
- position,
- nationality,
- age range,
- season range,
- career achievement.

## Planned technology stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL

### Deployment

- frontend hosting,
- backend hosting,
- managed PostgreSQL database.

## Development stages

1. Repository and project structure
2. Static user interface
3. Local prototype dataset
4. Game validation logic
5. Backend API
6. PostgreSQL database
7. Data import process
8. Daily games
9. Deployment
10. Documentation and tests