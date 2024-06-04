import { utcToZonedTime, format } from 'date-fns-tz'
import { formatDistance, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

const tzTime = (date: Date) => {
  return utcToZonedTime(date, 'Europe/Paris')
}

const formatDist = (dateStart: Date, dateEnd: Date) => {
  const formattedDate = formatDistance(dateStart, dateEnd, {
    locale: fr,
    includeSeconds: true
  })
  return formattedDate
}

const isDateInCurrentWeek = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })

  // check if date is between start and end
  return isWithinInterval(date, { start, end })
}

export { tzTime, format, formatDist, isDateInCurrentWeek }
