'use client'

import { useRouter } from 'next/navigation'

interface MonthSelectorProps {
  currentYear: number
  currentMonth: number
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MonthSelector({ currentYear, currentMonth }: MonthSelectorProps) {
  const router = useRouter()

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1
    let newYear = currentYear
    if (newMonth < 1) {
      newMonth = 12
      newYear -= 1
    }
    router.push(`/?year=${newYear}&month=${newMonth}`)
  }

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1
    let newYear = currentYear
    if (newMonth > 12) {
      newMonth = 1
      newYear += 1
    }
    router.push(`/?year=${newYear}&month=${newMonth}`)
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?year=${currentYear}&month=${e.target.value}`)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`/?year=${e.target.value}&month=${currentMonth}`)
  }

  return (
    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 p-1.5 rounded-xl text-sm">
      <button
        onClick={handlePrevMonth}
        className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        title="Mes anterior"
      >
        ←
      </button>

      <select
        value={currentMonth}
        onChange={handleMonthChange}
        className="bg-slate-800 text-white font-medium border border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none cursor-pointer"
      >
        {MONTH_NAMES.map((name, index) => (
          <option key={index + 1} value={index + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={currentYear}
        onChange={handleYearChange}
        className="bg-slate-800 text-white font-medium border border-slate-700 rounded-lg px-2.5 py-1 text-sm focus:outline-none cursor-pointer"
      >
        {[2024, 2025, 2026, 2027, 2028].map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <button
        onClick={handleNextMonth}
        className="px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
        title="Mes siguiente"
      >
        →
      </button>
    </div>
  )
}
