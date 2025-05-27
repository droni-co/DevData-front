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
  repoId: string
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
  projects: ListProject[]
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
  projects: ListProject[]
  authors: ListCommitAuthor[]
}
export interface ListCommitAuthor {
  authorName: string
  authorEmail: string
}


export interface Pullrequest {
  id: number
  repositoryId: string
  repositoryName: string
  projectId: string
  projectName: string
  creatorId: string
  creatorName: string
  status: number
  creationDate: string
  closedDate: string
  title: string
  description: string
  sourceRefName: string
  targetRefName: string
  mergeStatus: number
  completionQueueTime: string
}

export interface PullrequestFilters {
  creators: ListCreator[]
  repositories: ListRepository[]
  projects: ListProject[]
  sources: ListSource[]
  targets: ListTarget[]
  statuses: ListStatus[]
  mergeStatus: ListMergeStatus[]
}

export interface ListCreator {
  creatorName: string
}

export interface ListRepository {
  repositoryName: string
  repositoryId: string
}

export interface ListProject {
  projectName: string
  projectId: string
}

export interface ListSource {
  sourceRefName: string
}

export interface ListTarget {
  targetRefName: string
}

export interface ListStatus {
  status: number
}

export interface ListMergeStatus {
  mergeStatus: number
}

export interface Sonars {
  id: number
  key: string
  rule: string
  severity: string
  component: string
  project: string
  line?: number
  hash: string
  textRange: SonarsTextRange
  flows: SonarsFlow[]
  resolution?: string
  status: string
  message: string
  effort: string
  debt: string
  author: string
  tags: string[]
  creationDate: string
  updateDate: string
  closeDate?: string
  type: string
  organization: string
  cleanCodeAttribute: string
  cleanCodeAttributeCategory: string
  impacts: SonarsImpact[]
  issueStatus: string
  projectName: string
  createdAt: string
  updatedAt: string
}

export interface SonarsTextRange {
  endLine: number
  endOffset: number
  startLine: number
  startOffset: number
}

export interface SonarsFlow {
  locations: SonarsLocation[]
}

export interface SonarsLocation {
  msg: string
  component: string
  textRange: SonarsTextRange2
}

export interface SonarsTextRange2 {
  endLine: number
  endOffset: number
  startLine: number
  startOffset: number
}

export interface SonarsImpact {
  severity: string
  softwareQuality: string
}

export interface SonarsFilters {
  rule: string[]
  project: string[]
  severity: string[]
  status: string[]
  type: string[]
}
