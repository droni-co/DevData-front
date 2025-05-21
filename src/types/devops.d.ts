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
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string
  previousPageUrl: any
}
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
export interface RepositoryFilters {
  projectName: string[]
}

export interface Commit {
  id: number
  commitId: string
  repositoryId: string
  repositoryName: string
  projectId: string
  projectName: string
  authorName: string
  authorEmail: string
  authorDate: string
  committerName: string
  committerEmail: string
  committerDate: string
  comment: string
  commentTruncated: number
  changeAdd: number
  changeEdit: number
  changeDelete: number
}

export interface CommitFilters {
  projectName: string[]
  authorEmail: string[]
  committerEmail: string[]
}

