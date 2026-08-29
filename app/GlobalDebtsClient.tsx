'use client'

import { useState } from 'react'
import { createGlobalDebt, addPaymentToDebt, deleteGlobalDebt } from './actions/debt'

export default function GlobalDebtsClient({ debts, userId, currentBudgetId }: { debts: any[]; userId: string; currentBudgetId?: string }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<any>(null)

  const [creditorName, setCreditorName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [initialPaid, setInitialPaid] = useState('')

  const [paymentAmount, setPaymentAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!creditorName || !totalAmount) return
    setLoading(true)

    await createGlobalDebt({
      userId,
      creditorName,
      totalAmount: parseFloat(totalAmount),
      paidAmount: initialPaid ? parseFloat(initialPaid) : 0,
    })

    setCreditorName('')
    setTotalAmount('')
    setInitialPaid('')
    setIsAddModalOpen(false)
    setLoading(false)
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebt || !paymentAmount) return
    if (!confirm(`¿Confirmas abonar $${paymentAmount} a "${selectedDebt.creditorName}" y vincularlo a tus movimientos de este mes?`)) return
    setLoading(true)

    await addPaymentToDebt(selectedDebt.id, parseFloat(paymentAmount), currentBudgetId)

    setPaymentAmount('')
    setSelectedDebt(null)
    setIsPayModalOpen(false)
    setLoading(false)
  }

  const handleDelete = async (debt: any) => {
    if (confirm(`¿Estás seguro de que deseas ELIMINAR la deuda de "${debt.creditorName}"?`)) {
      await deleteGlobalDebt(debt.id)
    }
  }

  const grandTotal = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0)
  const grandPaid = debts.reduce((sum, d) => sum + Number(d.paidAmount), 0)
  const grandRemaining = grandTotal - grandPaid

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>🏛️</span> Control de Deudas Globales
          </h3>
          <p className="text-slate-400 text-xs font-medium">Seguimiento de saldos totales y abonos vinculados a tus movimientos</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30"
        >
          + Nueva Deuda Global
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Deuda Acumulada</span>
          <p className="text-2xl font-black text-white font-mono mt-1">
            ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Pagado a la Fecha</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ${grandPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Saldo Faltante Global</span>
          <p className="text-2xl font-black text-rose-400 font-mono mt-1">
            ${grandRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {debts.length === 0 ? (
        <p className="text-slate-500 text-sm italic py-8 text-center">No hay deudas globales registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider bg-slate-950/60 text-slate-400 font-bold">
              <tr>
                <th className="px-5 py-3.5 rounded-l-2xl">Acreedor / Concepto</th>
                <th className="px-5 py-3.5 text-right">Monto Total</th>
                <th className="px-5 py-3.5 text-right">Pagado</th>
                <th className="px-5 py-3.5 text-right">Faltante</th>
                <th className="px-5 py-3.5 text-center">Progreso</th>
                <th className="px-5 py-3.5 text-right rounded-r-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {debts.map((d: any) => {
                const total = Number(d.totalAmount)
                const paid = Number(d.paidAmount)
                const remaining = total - paid
                const progressPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

                return (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-white font-bold">{d.creditorName}</td>
                    <td className="px-5 py-4 text-right font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-right font-mono text-emerald-400">${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-right font-mono text-rose-400 font-black">${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-center w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDebt(d)
                          setIsPayModalOpen(true)
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl transition border border-emerald-500/30"
                      >
                        + Abono
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1.5 transition"
                        title="Eliminar Deuda"
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

      {/* Modal: Agregar Deuda */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Nueva Deuda / Crédito Global</h3>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Nombre (ej. Auto, Liverpool)</label>
                <input
                  type="text"
                  required
                  value={creditorName}
                  onChange={(e) => setCreditorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Monto Total ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Monto Pagado Inicialmente ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={initialPaid}
                  onChange={(e) => setInitialPaid(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  {loading ? 'Guardando...' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Abono */}
      {isPayModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Abono a: {selectedDebt.creditorName}</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Monto del Abono ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  Confirmar Abono
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
