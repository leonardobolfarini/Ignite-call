import { ConfirmStep } from './ConfirmStep'
import { CalendarStep } from './CalendarStep'
import { useState } from 'react'

export function ScheduleForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>()

  function handleClearSelectedDate() {
    setSelectedDate(null)
  }

  if (selectedDate) {
    return (
      <ConfirmStep
        schedulingDate={selectedDate}
        onCancelConfirmation={handleClearSelectedDate}
      />
    )
  }

  return <CalendarStep onSelectedDateTime={setSelectedDate} />
}
