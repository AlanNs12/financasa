'use client'

import { useState, useTransition } from 'react'
import { Clock, Settings2, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { updateWorkHoursAction } from '@/app/actions/household-settings'

interface ValorRealData {
  monthlyIncome: number
  hoursPerDay: number
  daysInMonth: number
  totalHours: number
  hourlyRate: number
}

function formatHoursMinutes(decimalHours: number): string {
  const totalMinutes = Math.round(decimalHours * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}min`
}

function formatWorkDays(decimalHours: number, hoursPerDay: number): string {
  const days = decimalHours / hoursPerDay
  if (days < 1) return formatHoursMinutes(decimalHours)
  const wholeDays = Math.floor(days)
  const remainderHours = decimalHours - (wholeDays * hoursPerDay)
  if (remainderHours < 0.1) return `${wholeDays} dia${wholeDays > 1 ? 's' : ''}`
  return `${wholeDays} dia${wholeDays > 1 ? 's' : ''} e ${formatHoursMinutes(remainderHours)}`
}

export function ValorRealClient({ data }: { data: ValorRealData }) {
  const [price, setPrice] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [hoursPerDay, setHoursPerDay] = useState(String(data.hoursPerDay))
  const [isPending, startTransition] = useTransition()

  const priceValue = Number(price) || 0
  const hoursNeeded = data.hourlyRate > 0 ? priceValue / data.hourlyRate : 0

  function handleUpdateHours() {
    const hours = Number(hoursPerDay)
    if (hours < 1 || hours > 24) {
      toast.error('Informe um valor entre 1 e 24 horas')
      return
    }
    startTransition(async () => {
      const result = await updateWorkHoursAction(hours)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success('Configuração salva!')
      setShowSettings(false)
    })
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div>
        <h1 className="text-xl font-bold text-foreground">Valor Real</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Veja o preço das coisas em horas de trabalho
        </p>
      </div>

      <div className="rounded-2xl p-6 text-white shadow-theme-lg relative overflow-hidden bg-gradient-to-br from-[#0F1115] to-[#2D2F36]">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/[0.04] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wide">
              Seu valor-hora
            </p>
            <button
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Configurar horas de trabalho"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 transition-colors"
            >
              <Settings2 size={14} />
            </button>
          </div>
          <p className="text-3xl font-bold tracking-tight">
            {formatCurrency(data.hourlyRate)}
            <span className="text-base font-normal text-white/50">/hora</span>
          </p>
          <p className="text-white/50 text-xs mt-2">
            {formatCurrency(data.monthlyIncome)} ÷ {data.totalHours}h
            ({data.daysInMonth} dias × {data.hoursPerDay}h/dia)
          </p>

          {showSettings && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-end gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-white/60 uppercase tracking-wide block mb-1">
                  Horas trabalhadas por dia
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:border-white/40"
                />
              </div>
              <button
                onClick={handleUpdateHours}
                disabled={isPending}
                className="h-9 px-4 rounded-lg bg-white text-[#0F1115] text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-colors"
              >
                {isPending ? '...' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-theme-xs p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Quanto custa em horas de trabalho?
          </h3>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
            R$
          </span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
            min="0"
            step="0.01"
            autoFocus
            className="w-full h-14 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground text-2xl font-bold placeholder:text-muted-foreground placeholder:font-normal focus:outline-none focus:border-ring transition-colors"
          />
        </div>

        {priceValue > 0 && data.hourlyRate > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              Isso equivale a
            </p>
            <p className="text-2xl font-bold text-foreground">
              {formatWorkDays(hoursNeeded, data.hoursPerDay)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              de trabalho ({hoursNeeded.toFixed(1)}h no total)
            </p>
          </div>
        )}

        {data.hourlyRate === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Cadastre uma receita para calcular seu valor-hora
          </p>
        )}
      </div>

      {data.hourlyRate > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-theme-xs p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Exemplos rápidos
            </h3>
          </div>
          <div className="space-y-2">
            {[50, 100, 300, 1000].map((value) => {
              const hrs = value / data.hourlyRate
              return (
                <button
                  key={value}
                  onClick={() => setPrice(String(value))}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm text-foreground">
                    {formatCurrency(value)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatWorkDays(hrs, data.hoursPerDay)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
