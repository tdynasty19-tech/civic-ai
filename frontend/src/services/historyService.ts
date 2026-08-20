const STORAGE_KEY = 'civicai_history_v1'

type HistoryItem = {
  id: string
  type: 'analyze' | 'draft' | 'schemes'
  title: string
  description?: string
  timestamp: number
  payload?: Record<string, any>
}

const nowId = () => String(Date.now())

export const getHistory = (): HistoryItem[] => {
  try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

const persist = (items: HistoryItem[]) => {
  try {
     sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
  const list = getHistory()
  const toSave: HistoryItem = {
    id: nowId(),
    timestamp: Date.now(),
    ...item,
  }
  list.unshift(toSave)
  // keep recent 50 only
  persist(list.slice(0, 50))
}

export const deleteHistoryItem = (id: string) => {
  const list = getHistory().filter((i) => i.id !== id)
  persist(list)
}

export const clearHistory = () => {
  persist([])
}

export type { HistoryItem }

export default {
  getHistory,
  addHistoryItem,
  deleteHistoryItem,
  clearHistory,
}
