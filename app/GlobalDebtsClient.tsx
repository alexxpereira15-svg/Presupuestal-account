'use client'

import { useState } from 'react'
import { createGlobalDebt, addPaymentToDebt, deleteGlobalDebt } from './actions/debt'

export default function GlobalDebtsClient({ debts, userId }: { debts: any[]; userId: string }) {
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
    setLoading(true)

    await addPaymentToDebt(selectedDebt.id, parseFloat(paymentAmount))

    setPaymentAmount('')
    setSelectedDebt(null)
    setIsPayModalOpen(false)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Deseas eliminar esta deuda del control global?')) {
      await deleteGlobalDebt(id)
    }
  }

  // Totales de pasivos
  const grandTotal = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0)
  const grandPaid = debts.reduce((sum, d) => sum + Number(d.paidAmount), 0)
  const grandRemaining = grandTotal - grandPaid

  return (
    <div className="bg-slate-800/30 rounded-2xl border border-slate-800 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">🏛️ Control de Deudas Globales (Hoja 1)</h3>
          <p className="text-slate-400 text-xs mt-0.5">Seguimiento de saldos totales y pasivos pendientes</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-indigo-500/10 self-start sm:self-auto"
        >
          + Nueva Deuda Global
        </button>
      </div>

      {/* Resumen de Pasivos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs">Total Deuda Acumulada</span>
          <p className="text-xl font-bold text-white mt-1">
            ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs">Total Pagado a la Fecha</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            ${grandPaid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <span className="text-slate-400 text-xs">Saldo Faltante Global</span>
          <p className="text-xl font-bold text-rose-400 mt-1">
            ${grandRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Tabla de Deudas */}
      {debts.length === 0 ? (
        <p className="text-slate-500 text-sm italic py-4 text-center">No hay deudas globales registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-800/80 text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Acreedor / Concepto</th>
                <th className="px-4 py-3 text-right">Monto Total</th>
                <th className="px-4 py-3 text-right">Pagado</th>
                <th className="px-4 py-3 text-right">Faltante</th>
                <th className="px-4 py-3 text-center">Progreso</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {debts.map((d: any) => {
                const total = Number(d.totalAmount)
                const paid = Number(d.paidAmount)
                const remaining = total - paid
                const progressPct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

                return (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{d.creditorName}</td>
                    <td className="px-4 py-3 text-right font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-400 font-semibold">${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-center w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div className="bg-emerald-400 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDebt(d)
                          setIsPayModalOpen(true)
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-md transition border border-emerald-500/30"
                      >
                        + Abono
                      </button>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-slate-500 hover:text-rose-400 text-xs px-1.5 py-1 transition"
                        title="Eliminar"
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

      {/* Modal: Agregar Deuda Global */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Nueva Deuda / Crédito Global</h3>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre (ej. Auto, Liverpool, Préstamo)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Crédito Automotriz"
                  value={creditorName}
                  onChange={(e) => setCreditorName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto Total de la Deuda ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto Pagado Inicialmente ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={initialPaid}
                  onChange={(e) => setInitialPaid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
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
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {loading ? 'Guardando...' : 'Crear Registros'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Abono */}
      {isPayModalOpen && selectedDebt && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Registrar Abono a: {selectedDebt.creditorName}</h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto del Abono ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
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
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {loading ? 'Guardando...' : 'Abonar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
