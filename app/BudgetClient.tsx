'use client'

import { useState } from 'react'
import { createTransaction } from './actions/transaction'
import { addBudgetItem, updateInitialBalance } from './actions/budget'

// Acciones para Presupuesto Estimado
export function EstimatedBudgetActions({ budget }: { budget: any }) {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

  const [itemName, setItemName] = useState('')
  const [itemType, setItemType] = useState('FIXED_EXPENSE')
  const [itemEstimated, setItemEstimated] = useState('')

  const [initialBalance, setInitialBalance] = useState(budget?.initialBalance?.toString() || '0')
  const [loading, setLoading] = useState(false)

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemName || !itemEstimated) return
    setLoading(true)

    await addBudgetItem({
      budgetId: budget.id,
      name: itemName,
      type: itemType as any,
      estimatedAmount: parseFloat(itemEstimated),
    })

    setItemName('')
    setItemEstimated('')
    setIsItemModalOpen(false)
    setLoading(false)
  }

  const handleUpdateBalance = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await updateInitialBalance(budget.id, parseFloat(initialBalance || '0'))
    setIsBalanceModalOpen(false)
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={() => setIsItemModalOpen(true)}
        className="flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-4 rounded-2xl text-sm transition-all duration-300 shadow-xl shadow-cyan-500/20 active:scale-95 cursor-pointer"
      >
        <span className="text-xl">➕</span>
        <span>Agregar Rubro Estimado</span>
      </button>

      <button
        onClick={() => setIsBalanceModalOpen(true)}
        className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold px-6 py-4 rounded-2xl text-sm border border-slate-700/80 transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
      >
        <span className="text-xl">⚙️</span>
        <span>Editar Saldo Inicial</span>
      </button>

      {/* Modal: Agregar Rubro Estimado */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>📝</span> Nuevo Rubro Presupuestado
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-500 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Nombre del Rubro</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Renta, Sueldo, Tarjeta Nu"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-medium focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Categoría</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-medium focus:outline-none focus:border-cyan-500 transition cursor-pointer"
                >
                  <option value="INCOME">💵 Ingreso</option>
                  <option value="FIXED_EXPENSE">📌 Gasto Fijo / Factura</option>
                  <option value="DEBT">💳 Deuda / Crédito</option>
                  <option value="VARIABLE_EXPENSE">🛒 Gasto Variable</option>
                  <option value="SAVING_INVESTMENT">📈 Ahorro / Inversión</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Monto Presupuestado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={itemEstimated}
                  onChange={(e) => setItemEstimated(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono font-bold text-lg focus:outline-none focus:border-cyan-500 transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-5 py-3 text-sm text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-lg shadow-cyan-500/20"
                >
                  {loading ? 'Guardando...' : 'Guardar Rubro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Saldo Inicial */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>⚙️</span> Editar Saldo Inicial
            </h3>
            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Monto Inicial ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 text-slate-950 font-black px-5 py-2.5 rounded-xl text-sm"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Acciones para Movimientos Reales
export function RealTransactionActions({ budget }: { budget: any }) {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [itemId, setItemId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return
    setLoading(true)

    await createTransaction({
      budgetId: budget.id,
      budgetItemId: itemId || undefined,
      amount: parseFloat(amount),
      description,
    })

    setAmount('')
    setDescription('')
    setItemId('')
    setIsTxModalOpen(false)
    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={() => setIsTxModalOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-6 py-4 rounded-2xl text-base transition-all duration-300 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer"
      >
        <span className="text-2xl">💸</span>
        <span>Registrar Movimiento Real</span>
      </button>

      {/* Modal: Registrar Movimiento */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>💸</span> Nuevo Movimiento Real
              </h3>
              <button onClick={() => setIsTxModalOpen(false)} className="text-slate-500 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Monto Real ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-mono font-black text-xl focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Depósito, Despensa, Gasolina"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-medium focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1.5 uppercase tracking-wider">Asignar a Rubro Estimado</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer text-sm"
                >
                  <option value="">Sin Asignar / Movimiento General</option>
                  {budget.items?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-5 py-3 text-sm text-slate-400 hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-lg shadow-amber-500/20"
                >
                  {loading ? 'Guardando...' : 'Guardar Movimiento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
