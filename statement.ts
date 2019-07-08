import { IInvoice, IPlays, EPlayType, IPerformance, IPlay, IStatement, IPerformanceEnrich } from './metadata'

class PerformanceCalculator {
  constructor(public perf: IPerformance, public play: IPlay) { }

  getAmount() {
    throw new Error('subclass responsibility')
  }

  getVolumeCredits() {
    let result = 0
    result += Math.max(this.perf.audience - 30, 0)
    return result
  }
}

class ComedyCalculator extends PerformanceCalculator {
  getAmount() {
    let result = 30000
    if (this.perf.audience > 20) {
      result += 10000 + 500 * (this.perf.audience - 20)
    }
    result += 300 * this.perf.audience
    return result
  }

  getVolumeCredits() {
    return super.getVolumeCredits() + Math.floor(this.perf.audience / 5)
  }
}
class TradgedyCalculator extends PerformanceCalculator {
  getAmount() {
    let result = 0
    result = 40000
    if (this.perf.audience > 30) {
      result += 1000 * (this.perf.audience - 30)
    }
    return result
  }
}

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

  function totalAmount(statementData: Partial<IStatement>) {
    let result = 0
    for (let perf of statementData.performances) {
      result += perf.amount
    }
    return result
  }

  function createPerformanceCalculator(perf: IPerformance, play: IPlay) {
    if (play.type === EPlayType.TRADGEDY) return new TradgedyCalculator(perf, play)
    if (play.type === EPlayType.COMEDY) return new ComedyCalculator(perf, play)
    throw new Error(`unknown type: ${play.type}`)
  }
}

export function statement(invoice: IInvoice, plays: IPlays) {
  const statementData = createStatementData(invoice, plays) as IStatement
  return renderPlainText(statementData)
}

function totalVolumeCredits(statementData: Partial<IStatement>) {
  let result = 0
  for (let perf of statementData.performances) {
    result += perf.volumeCredits
  }
  return result
}

export function renderPlainText(statementData: IStatement) {
  let result = `Statement for ${statementData.customer}\n`
  for (let perf of statementData.performances) {
    result += `  ${perf.play.name}: ${usd(perf.amount / 100)} (${perf.audience} seats)\n`
  }
  result += `Amount owed is ${usd(statementData.totalAmount / 100)} \n`
  result += `You earned ${statementData.totalVolumeCredits} credits\n`
  return result

  function usd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(value)
  }
}
