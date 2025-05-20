export interface Repository {
  id: string
  projectId: string
  projectName: string
  name: string
  url: string
  size: number
  defaultBranch: string
  isApi: number
  isExp: number
  package: any
  pipeline: any
  appservice: any
  createdAt: string
  updatedAt: string
}
