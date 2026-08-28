'use client'

import { useState } from 'react'
import { createTransaction, deleteTransaction } from './actions/transaction'
import { addBudgetItem, updateInitialBalance } from './actions/budget'

export default function BudgetClient({ budget }: { budget: any }) {
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false)

  // Form states
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [itemId, setItemId] = useState('')

  const [itemName, setItemName] = useState('')
  const [itemType, setItemType] = useState('FIXED_EXPENSE')
  const [itemEstimated, setItemEstimated] = useState('')

  const [initialBalance, setInitialBalance] = useState(budget.initialBalance?.toString() || '0')
  const [loading, setLoading] = useState(false)

  // Handlers
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

  const handleDeleteTx = async (id: string) => {
    if (confirm('¿Deseas eliminar este movimiento?')) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Botones de Acción */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setIsTxModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-sm transition"
        >
          + Registrar Movimiento
        </button>
        <button
          onClick={() => setIsItemModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-xl text-sm border border-slate-700 transition"
        >
          + Agregar Rubro Estimado
        </button>
        <button
          onClick={() => setIsBalanceModalOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium px-4 py-2 rounded-xl text-sm border border-slate-700 transition"
        >
          ✏️ Editar Saldo Inicial
        </button>
      </div>

      {/* Modal: Registrar Movimiento */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Movimiento</h3>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Ej. Depósito, Despensa, Gasolina"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Asignar a Rubro (Opcional)</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Sin Asignar / Movimiento General</option>
                  {budget.items?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Agregar Rubro Estimado */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white">Nuevo Rubro Estimado</h3>
            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre del Rubro</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Renta, Sueldo, Tarjeta Nu"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Categoria</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                >
                  <option value="INCOME">Ingreso</option>
                  <option value="FIXED_EXPENSE">Gasto Fijo / Factura</option>
                  <option value="DEBT">Deuda / Crédito</option>
                  <option value="VARIABLE_EXPENSE">Gasto Variable</option>
                  <option value="SAVING_INVESTMENT">Ahorro / Inversión</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto Presupuestado / Estimado ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={itemEstimated}
                  onChange={(e) => setItemEstimated(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm"
                >
                  {loading ? 'Guardando...' : 'Crear Rubro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Saldo Inicial */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-white">Editar Saldo Inicial del Mes</h3>
            <form onSubmit={handleUpdateBalance} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Monto Inicial ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm"
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
