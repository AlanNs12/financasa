'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createCategoryAction, deleteCategoryAction } from '@/app/actions/categories'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#0f1115',
]

const COMMON_EMOJIS = [
  '🍕', '🛒', '🚗', '💊', '🎮', '📚', '✈️', '🏥',
  '💄', '🐾', '🎵', '⚽', '🏠', '💡', '📱', '🎁',
  '💰', '📈', '💼', '🎓', '🍺', '☕', '🛠️', '🧴',
]

interface CategoryManagerProps {
  categories: Array<{
    id: string
    name: string
    icon: string
    color: string
    type: string
    is_default: boolean
  }>
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const [showModal, setShowModal] = useState(false)
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState('#22c55e')
  const [customEmoji, setCustomEmoji] = useState('')
  const [isPending, startTransition] = useTransition()

  const customCategories = categories.filter((c) => !c.is_default)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const finalIcon = customEmoji.trim() || icon
    if (!name.trim()) {
      toast.error('Nome obrigatório')
      return
    }
    startTransition(async () => {
      const result = await createCategoryAction({ name: name.trim(), icon: finalIcon, color, type })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Categoria criada!')
      setShowModal(false)
      setName('')
      setIcon('💰')
      setColor('#22c55e')
      setCustomEmoji('')
    })
  }

  function handleDelete(id: string, catName: string) {
    if (!confirm(`Apagar a categoria "${catName}"? Esta ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const result = await deleteCategoryAction(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Categoria apagada')
    })
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-theme-xs">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Categorias personalizadas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Crie categorias com emojis e cores próprias
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                     bg-primary text-primary-foreground text-xs font-medium
                     hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47] transition-colors"
        >
          <Plus size={14} /> Nova
        </button>
      </div>

      {customCategories.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria personalizada ainda.
          </p>
        </div>
      ) : (
        <div className="p-3 space-y-1.5">
          {customCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-2.5 rounded-xl
                         hover:bg-muted/40 transition-colors group"
            >
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${cat.color}20` }}
              >
                {cat.icon}
              </span>
              <span className="flex-1 text-sm text-foreground">{cat.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  cat.type === 'INCOME'
                    ? 'bg-[#dcfce7] text-[#15803d]'
                    : 'bg-[#fee2e2] text-[#b91c1c]'
                }`}
              >
                {cat.type === 'INCOME' ? 'Entrada' : 'Saída'}
              </span>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                aria-label={`Apagar categoria ${cat.name}`}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground
                           hover:text-[#ef4444] transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center
                     justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
        >
          <div
            className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl
                        border border-border shadow-theme-lg max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Nova categoria</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Fechar"
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-muted-foreground hover:bg-muted transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div className="flex gap-2">
                {(['EXPENSE', 'INCOME'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      type === t
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pet shop"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background
                             text-foreground text-sm placeholder:text-muted-foreground
                             focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Emoji
                </label>
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {COMMON_EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => { setIcon(e); setCustomEmoji('') }}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center
                                 transition-colors ${
                                   icon === e && !customEmoji
                                     ? 'bg-primary/10 ring-1 ring-primary'
                                     : 'hover:bg-muted'
                                 }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Ou cole um emoji aqui..."
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background
                             text-foreground text-sm placeholder:text-muted-foreground
                             focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Cor
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                    title="Cor personalizada"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {customEmoji || icon}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {name || 'Preview da categoria'}
                </span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-11 rounded-lg border border-border text-sm
                             text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-11 rounded-lg bg-primary text-primary-foreground
                             text-sm font-semibold hover:bg-[#2D2F36] dark:hover:bg-[#3D3F47]
                             disabled:opacity-50 transition-colors"
                >
                  {isPending ? 'Criando...' : 'Criar categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
