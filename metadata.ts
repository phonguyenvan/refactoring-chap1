export enum EPlayType {
  TRADGEDY = 'TRADGEDY', // thảm kịch
  COMEDY = 'COMEDY', // hài kịch
}

export interface IPlay { // vở kịch
  name: string
  type: EPlayType
}

export interface IPlays {
  [key: string]: IPlay
}

export interface IPerformance { // buổi biểu diễn
  playId: string
  audience: number
}

export interface IInvoice { // hoá đơn
  customer: string
  performances: IPerformance[]
}

export interface IPerformanceEnrich extends IPerformance {
  play: IPlay
  amount: number
  volumeCredits: number
}

export interface IStatement {
  customer: string
  performances: IPerformanceEnrich[]
  totalAmount: number
  totalVolumeCredits: number
}
