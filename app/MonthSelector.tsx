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
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 p-1 rounded-xl text-xs shadow-inner">
      <button
        onClick={handlePrevMonth}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition active:scale-95"
        title="Mes anterior"
      >
        ←
      </button>

      <div className="flex items-center gap-1 px-1">
        <select
          value={currentMonth}
          onChange={handleMonthChange}
          className="bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
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
          className="bg-slate-800 text-slate-100 font-semibold border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
        >
          {[2024, 2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleNextMonth}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition active:scale-95"
        title="Mes siguiente"
      >
        →
      </button>
    </div>
  )
}
