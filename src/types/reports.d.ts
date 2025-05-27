export type IssuesOverTime = IssuesOverTimeDay[]

export interface IssuesOverTimeDay {
  date: string
  total: number
}
