'use client'

import { useState } from 'react'
import { createGlobalDebt, addPaymentToDebt, deleteGlobalDebt, updateGlobalDebt } from './actions/debt'

interface GlobalDebtsClientProps {
  debts: any[]
  userId: string
  currentBudgetId?: string
  currentYear?: number
  currentMonth?: number
}

export default function GlobalDebtsClient({
  debts,
  userId,
  currentBudgetId,
  currentYear,
  currentMonth,
}: GlobalDebtsClientProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<any>(null)

  // Formulario de creación
  const [creditorName, setCreditorName] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [initialPaid, setInitialPaid] = useState('')
  const [monthlyPayment, setMonthlyPayment] = useState('')
  const [paymentType, setPaymentType] = useState<'FIXED' | 'VARIABLE'>('FIXED')

  // Formulario de edición
  const [editName, setEditName] = useState('')
  const [editTotal, setEditTotal] = useState('')
  const [editPaid, setEditPaid] = useState('')
  const [editMonthly, setEditMonthly] = useState('')
  const [editType, setEditType] = useState<'FIXED' | 'VARIABLE'>('FIXED')

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
      monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : 0,
      paymentType,
      currentBudgetId,
    })

    setCreditorName('')
    setTotalAmount('')
    setInitialPaid('')
    setMonthlyPayment('')
    setIsAddModalOpen(false)
    setLoading(false)
  }

  const handleOpenEdit = (debt: any) => {
    setSelectedDebt(debt)
    setEditName(debt.creditorName)
    setEditTotal(debt.totalAmount.toString())
    setEditPaid(debt.paidAmount.toString())
    setEditMonthly(debt.monthlyPayment.toString())
    setEditType(debt.paymentType as any)
    setIsEditModalOpen(true)
  }

  const handleUpdateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebt) return
    if (!confirm(`¿Deseas guardar las modificaciones para "${editName}"?`)) return
    setLoading(true)

    await updateGlobalDebt(selectedDebt.id, {
      creditorName: editName,
      totalAmount: parseFloat(editTotal),
      paidAmount: parseFloat(editPaid),
      monthlyPayment: parseFloat(editMonthly),
      paymentType: editType,
    })

    setSelectedDebt(null)
    setIsEditModalOpen(false)
    setLoading(false)
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebt || !paymentAmount) return
    if (!confirm(`¿Confirmas abonar $${paymentAmount} a "${selectedDebt.creditorName}" y vincularlo a tus movimientos del mes?`)) return
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

  // Totales
  const grandTotal = debts.reduce((sum, d) => sum + Number(d.totalAmount), 0)
  const grandPaid = debts.reduce((sum, d) => sum + Number(d.paidAmount), 0)
  const grandRemaining = grandTotal - grandPaid

  // Helper para proyección de fecha de término basado en el período seleccionado en la App
  const calculateProjection = (remaining: number, monthly: number) => {
    if (remaining <= 0) return '¡Liquidado!'
    if (monthly <= 0) return 'Sin abono programado'

    const monthsLeft = Math.ceil(remaining / monthly)

    // Base de cálculo tomada del período activo en el selector global
    const baseYear = currentYear || new Date().getFullYear()
    const baseMonth = currentMonth ? currentMonth - 1 : new Date().getMonth()

    // Se fuerza el día 1 para evitar desbordamiento por meses de menos días (ej. Febrero)
    const targetDate = new Date(baseYear, baseMonth + monthsLeft, 1)

    const dateStr = targetDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
    return `${monthsLeft} pagos (~ ${dateStr})`
  }

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>🏛️</span> Control de Deudas Globales
          </h3>
          <p className="text-slate-400 text-xs font-medium">Seguimiento de saldos, proyección de plazos y traspaso automático de cuotas</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-3 rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
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
                <th className="px-5 py-3.5 text-right">Pago Mensual</th>
                <th className="px-5 py-3.5 text-right">Monto Total</th>
                <th className="px-5 py-3.5 text-right">Pagado</th>
                <th className="px-5 py-3.5 text-right">Faltante</th>
                <th className="px-5 py-3.5 text-center">Proyección Término</th>
                <th className="px-5 py-3.5 text-right rounded-r-2xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-semibold">
              {debts.map((d: any) => {
                const total = Number(d.totalAmount)
                const paid = Number(d.paidAmount)
                const remaining = total - paid
                const monthly = Number(d.monthlyPayment || 0)
                const projectionText = calculateProjection(remaining, monthly)

                return (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 text-white font-bold">{d.creditorName}</td>
                    <td className="px-5 py-4 text-right font-mono text-cyan-400">
                      ${monthly.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      <span className="text-[10px] block text-slate-500 font-normal">
                        {d.paymentType === 'FIXED' ? '📌 Fijo' : '🛒 Variable'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-right font-mono text-emerald-400">${paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-right font-mono text-rose-400 font-black">${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700/60 font-mono capitalize">
                        {projectionText}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedDebt(d)
                          setIsPayModalOpen(true)
                        }}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-xl transition border border-emerald-500/30 cursor-pointer"
                        title="Registrar Abono"
                      >
                        + Abono
                      </button>
                      <button
                        onClick={() => handleOpenEdit(d)}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold px-2 py-1 rounded-xl transition cursor-pointer"
                        title="Editar Deuda"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        className="bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold px-2 py-1 rounded-xl transition cursor-pointer"
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

      {/* Modal: Crear Deuda */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Nueva Deuda / Crédito Global</h3>
            <form onSubmit={handleCreateDebt} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Nombre (ej. Crédito Coche)</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Crédito Automotriz"
                  value={creditorName}
                  onChange={(e) => setCreditorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="75000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Enganche / Pagado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={initialPaid}
                    onChange={(e) => setInitialPaid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-cyan-400 font-bold block mb-1">Pago Mensual ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="5000"
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-3 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Tipo de Pago</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs cursor-pointer"
                  >
                    <option value="FIXED">📌 Fijo (Se traspasa cada mes)</option>
                    <option value="VARIABLE">🛒 Variable (Aprox)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-600/30"
                >
                  {loading ? 'Guardando...' : 'Crear Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Deuda Completa */}
      {isEditModalOpen && selectedDebt && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Editar Deuda Global</h3>
            <form onSubmit={handleUpdateDebt} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Monto Total ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editTotal}
                    onChange={(e) => setEditTotal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Total Pagado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPaid}
                    onChange={(e) => setEditPaid(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-xs text-cyan-400 font-bold block mb-1">Pago Mensual ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editMonthly}
                    onChange={(e) => setEditMonthly(e.target.value)}
                    className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl p-3 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Tipo de Pago</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs cursor-pointer"
                  >
                    <option value="FIXED">📌 Fijo</option>
                    <option value="VARIABLE">🛒 Variable</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
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
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold"
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
