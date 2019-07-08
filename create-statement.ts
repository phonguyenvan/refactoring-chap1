import { IInvoice, IPerformance, IPlay, IPlays, IStatement, EPlayType, IPerformanceEnrich } from './metadata'
import { createPerformanceCalculator } from './calculator'

export function createStatementData(invoice: IInvoice, plays: IPlays) {
  const result: Partial<IStatement> = {}
  result.customer = invoice.customer
  result.performances = invoice.performances.map(enrichPerformance),
  result.totalAmount = totalAmount(result)
  result.totalVolumeCredits = totalVolumeCredits(result)
  return result

  function enrichPerformance(perf: IPerformance) {
    const result: Partial<IPerformanceEnrich> = { ...perf }
    const performanceCalculator = createPerformanceCalculator(perf, playFor(perf))
    result.amount = performanceCalculator.getAmount()
    result.volumeCredits = performanceCalculator.getVolumeCredits()
    result.play = performanceCalculator.play
    return result as IPerformanceEnrich
  }

  function playFor(perf: IPerformance): IPlay {
    return plays[perf.playId]
  }
}

function totalAmount(statementData: Partial<IStatement>) {
  let result = 0
  for (let perf of statementData.performances) {
    result += perf.amount
  }
  return result
}

function totalVolumeCredits(statementData: Partial<IStatement>) {
  let result = 0
  for (let perf of statementData.performances) {
    result += perf.volumeCredits
  }
  return result
}
