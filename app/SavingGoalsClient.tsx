'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { createSavingGoal, addContributionToGoal, deleteSavingGoal, updateSavingGoal } from './actions/goal'

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Semanal',
  FORTNIGHTLY: 'Quincenal',
  MONTHLY: 'Mensual',
}

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null
  return createPortal(children, document.body)
}

interface SavingGoalsClientProps {
  goals: any[]
  userId: string
  currentBudgetId?: string
  currentYear?: number
  currentMonth?: number
}

export default function SavingGoalsClient({
  goals,
  userId,
  currentBudgetId,
  currentYear,
  currentMonth,
}: SavingGoalsClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<any>(null)

  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialSaved, setInitialSaved] = useState('')
  const [periodAmount, setPeriodAmount] = useState('')
  const [frequency, setFrequency] = useState<'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'>('FORTNIGHTLY')

  const [editTitle, setEditTitle] = useState('')
  const [editTarget, setEditTarget] = useState('')
  const [editSaved, setEditSaved] = useState('')
  const [editPeriod, setEditPeriod] = useState('')
  const [editFrequency, setEditFrequency] = useState<'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'>('FORTNIGHTLY')

  const [contributionAmount, setContributionAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !targetAmount || !periodAmount) return
    setLoading(true)

    await createSavingGoal({
      userId,
      title,
      targetAmount: parseFloat(targetAmount),
      savedAmount: initialSaved ? parseFloat(initialSaved) : 0,
      periodAmount: parseFloat(periodAmount),
      frequency,
      currentBudgetId,
    })

    setTitle('')
    setTargetAmount('')
    setInitialSaved('')
    setPeriodAmount('')
    setIsAddModalOpen(false)
    setLoading(false)
  }

  const handleOpenEdit = (goal: any) => {
    setSelectedGoal(goal)
    setEditTitle(goal.title)
    setEditTarget(goal.targetAmount.toString())
    setEditSaved(goal.savedAmount.toString())
    setEditPeriod(goal.periodAmount.toString())
    setEditFrequency(goal.frequency as any)
    setIsEditModalOpen(true)
  }

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal) return
    if (!confirm(`¿Deseas actualizar los datos de "${editTitle}"?`)) return
    setLoading(true)

    await updateSavingGoal(selectedGoal.id, {
      title: editTitle,
      targetAmount: parseFloat(editTarget),
      savedAmount: parseFloat(editSaved),
      periodAmount: parseFloat(editPeriod),
      frequency: editFrequency,
    })

    setSelectedGoal(null)
    setIsEditModalOpen(false)
    setLoading(false)
  }

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGoal || !contributionAmount) return
    if (!confirm(`¿Confirmas abonar $${contributionAmount} a la meta "${selectedGoal.title}" y registrarlo en tus movimientos?`)) return
    setLoading(true)

    await addContributionToGoal(selectedGoal.id, parseFloat(contributionAmount), currentBudgetId)

    setContributionAmount('')
    setSelectedGoal(null)
    setIsPayModalOpen(false)
    setLoading(false)
  }

  const handleDelete = async (goal: any) => {
    if (confirm(`¿Estás seguro de que deseas ELIMINAR la meta "${goal.title}"?`)) {
      await deleteSavingGoal(goal.id)
    }
  }

  const grandTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const grandSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0)
  const grandRemaining = grandTarget - grandSaved

  const calculateProjection = (target: number, saved: number, period: number, freq: string) => {
    const remaining = target - saved
    if (remaining <= 0) return '🎯 ¡Meta Alcanzada!'
    if (period <= 0) return 'Sin abono configurado'

    const periodsLeft = Math.ceil(remaining / period)
    const baseYear = currentYear || new Date().getFullYear()
    const baseMonth = currentMonth ? currentMonth - 1 : new Date().getMonth()

    let totalDays = 0
    if (freq === 'WEEKLY') totalDays = periodsLeft * 7
    else if (freq === 'FORTNIGHTLY') totalDays = periodsLeft * 15
    else totalDays = periodsLeft * 30

    const targetDate = new Date(baseYear, baseMonth, 1)
    targetDate.setDate(targetDate.getDate() + totalDays)

    const dateStr = targetDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    return `${periodsLeft} abonos (~ ${dateStr})`
  }

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>🚀</span> Metas de Ahorro e Inversión
          </h3>
          <p className="text-slate-400 text-xs font-medium">Seguimiento de objetivos financieros y planificación de aportaciones</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 cursor-pointer"
        >
          + Nueva Meta de Ahorro
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Objetivo Total Acumulado</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            ${grandTarget.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Ahorrado a la Fecha</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${grandSaved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faltante General</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            ${(grandRemaining > 0 ? grandRemaining : 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {goals.length === 0 ? (
        <p className="text-slate-500 text-sm italic py-8 text-center">No hay metas de ahorro registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5 rounded-l-2xl">Nombre Meta</th>
                <th className="px-5 py-3.5 text-right">Abono / Periodo</th>
                <th className="px-5 py-3.5 text-right">Monto Meta</th>
                <th className="px-5 py-3.5 text-right">Ahorrado</th>
                <th className="px-5 py-3.5 text-center">Progreso</th>
                <th className="px-5 py-3.5 text-center">Proyección Término</th>
                <th className="px-5 py-3.5 text-right rounded-r-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {goals.map((g: any) => {
                const target = Number(g.targetAmount)
                const saved = Number(g.savedAmount)
                const period = Number(g.periodAmount || 0)
                const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0
                const projectionText = calculateProjection(target, saved, period, g.frequency)

                return (
                  <tr key={g.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-white font-bold">{g.title}</td>
                    <td className="px-5 py-4 text-right font-mono text-emerald-400">
                      ${period.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      <span className="text-[10px] block text-slate-500 font-normal">
                        {FREQUENCY_LABELS[g.frequency] || g.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">${target.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-right font-mono text-emerald-400 font-black">${saved.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-center w-32">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60 font-mono capitalize">
                        {projectionText}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedGoal(g)
                          setIsPayModalOpen(true)
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl transition border border-emerald-500/30 cursor-pointer"
                        title="Registrar Abono"
                      >
                        + Abono
                      </button>
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold px-2 py-1 rounded-xl transition cursor-pointer"
                        title="Editar Meta"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(g)}
                        className="bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold px-2 py-1 rounded-xl transition cursor-pointer"
                        title="Eliminar Meta"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Crear Meta */}
      {isAddModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Nueva Meta de Ahorro</h3>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Nombre (ej. Vacaciones, Enganche Spark)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Vacaciones Cancún"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Monto Meta ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="15000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Ahorrado Inicial ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={initialSaved}
                      onChange={(e) => setInitialSaved(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-xs text-emerald-400 font-bold block mb-1">Abono por Periodo ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="500"
                      value={periodAmount}
                      onChange={(e) => setPeriodAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-3 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Periodicidad</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs cursor-pointer"
                    >
                      <option value="WEEKLY">Semanal</option>
                      <option value="FORTNIGHTLY">Quincenal</option>
                      <option value="MONTHLY">Mensual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    {loading ? 'Guardando...' : 'Crear Meta'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal: Editar Meta */}
      {isEditModalOpen && selectedGoal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Editar Meta de Ahorro</h3>
              <form onSubmit={handleUpdateGoal} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Nombre Meta</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Monto Meta ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Monto Ahorrado ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editSaved}
                      onChange={(e) => setEditSaved(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <label className="text-xs text-emerald-400 font-bold block mb-1">Abono por Periodo ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editPeriod}
                      onChange={(e) => setEditPeriod(e.target.value)}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl p-3 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-bold block mb-1">Periodicidad</label>
                    <select
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs cursor-pointer"
                    >
                      <option value="WEEKLY">Semanal</option>
                      <option value="FORTNIGHTLY">Quincenal</option>
                      <option value="MONTHLY">Mensual</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal: Registrar Abono */}
      {isPayModalOpen && selectedGoal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Abono a Meta: {selectedGoal.title}</h3>
              <form onSubmit={handleAddContribution} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Monto del Abono ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                  >
                    Confirmar Abono
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
