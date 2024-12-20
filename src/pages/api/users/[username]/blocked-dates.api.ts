import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)
  const { year, month } = req.query

  if (!month || !year) {
    return res.status(400).json({ message: 'Month or year not provided.' })
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exists.' })
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.week_day === weekDay,
    )
  })

  const blockedDaysRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT
      EXTRACT(DAY FROM S.DATE) AS date,
      COUNT(S.date),
      ((UTI.end_time_in_minutes - UTI.start_time_in_minutes) / 60)

    FROM schedulings S

    LEFT JOIN users_time_intervals UTI
      ON UTI.week_day = EXTRACT(DOW FROM S.date + INTERVAL '1 day')

    WHERE S.user_id = ${user.id}
      AND EXTRACT(YEAR FROM S.date) = ${year}::int
      AND EXTRACT(MONTH FROM S.date) = ${month}::int

    GROUP BY EXTRACT(DAY FROM S.DATE),
      ((UTI.end_time_in_minutes - UTI.start_time_in_minutes) / 60)

    HAVING
      COUNT(S.date) >= ((UTI.end_time_in_minutes - UTI.start_time_in_minutes) / 60);
  `

  const blockedDays = blockedDaysRaw.map((item) => Number(item.date))
  console.log(blockedDays)

  return res.json({ blockedWeekDays, blockedDays })
}
