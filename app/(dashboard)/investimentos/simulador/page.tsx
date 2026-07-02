import { getCurrentUserHousehold } from '@/lib/db/queries/user'
import { SimuladorClient } from '@/components/investimentos/simulador-client'

export default async function SimuladorPage() {
  const current = await getCurrentUserHousehold()

  if (!current) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground mb-1">Simulador de aposentadoria</h1>
          <p className="text-sm text-muted-foreground">Faça login para usar o simulador</p>
        </div>
      </div>
    )
  }

  return <SimuladorClient />
}
