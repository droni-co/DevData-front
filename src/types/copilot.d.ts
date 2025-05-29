export interface Pagination<T extends Iterable<unknown>> {
  meta: Meta
  data: T
}

export interface Meta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl?: string
  lastPageUrl?: string
  nextPageUrl?: string
  previousPageUrl?: string
}
export interface Metric {
  id: number
  orgId: string
  date: string
  totalActiveUsers: number
  totalEngagedUsers: number
  copilotIdeChat: CopilotIdeChat
  copilotDotcomChat: CopilotDotcomChat
  copilotDotcomPullRequests: CopilotDotcomPullRequests
  copilotIdeCodeCompletions: CopilotIdeCodeCompletions
  createdAt: string
  updatedAt: string
}

export interface CopilotIdeChat {
  editors: Editor[]
  total_engaged_users: number
}

export interface Editor {
  name: string
  models: Model[]
  total_engaged_users: number
}

export interface Model {
  name: string
  total_chats: number
  is_custom_model: boolean
  total_engaged_users: number
  total_chat_copy_events: number
  total_chat_insertion_events: number
}

export interface CopilotDotcomChat {
  models?: Model2[]
  total_engaged_users: number
}

export interface Model2 {
  name: string
  total_chats: number
  is_custom_model: boolean
  total_engaged_users: number
}

export interface CopilotDotcomPullRequests {
  total_engaged_users: number
}

export interface CopilotIdeCodeCompletions {
  editors: Editor2[]
  languages: Language2[]
  total_engaged_users: number
}

export interface Editor2 {
  name: string
  models: Model3[]
  total_engaged_users: number
}

export interface Model3 {
  name: string
  languages: Language[]
  is_custom_model: boolean
  total_engaged_users?: number
}

export interface Language {
  name: string
  total_engaged_users: number
  total_code_acceptances: number
  total_code_suggestions: number
  total_code_lines_accepted: number
  total_code_lines_suggested: number
}

export interface Language2 {
  name: string
  total_engaged_users: number
}
