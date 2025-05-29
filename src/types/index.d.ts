export interface Token {
  type: string
  name: any
  token: string
  abilities: string[]
  lastUsedAt: any
  expiresAt: any
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth?: number
  }[]
}