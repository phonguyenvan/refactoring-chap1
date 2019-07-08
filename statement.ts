import { IInvoice, IPlays, EPlayType, IPerformance, IPlay } from './metadata'

interface IPerformanceEnrich extends IPerformance {
  play: IPlay
  amount?: number
  volumeCredits?: number
}

interface IStatement {
  customer: string
  performances: IPerformanceEnrich[]
  totalAmount?: number
  totalVolumeCredits?: number
}

class PerformanceCalculator {
  constructor(public perf: IPerformanceEnrich, public play: IPlay) { }

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
  const statementData1: IStatement = {
    customer: invoice.customer,
    performances: invoice.performances.map(enrichPerformance),
  };
  const statementData: IStatement = {
    ...statementData1,
    totalAmount: totalAmount(statementData1),
    totalVolumeCredits: totalVolumeCredits(statementData1)
  }
  return statementData

  function enrichPerformance(perf: IPerformance) {
    const p1 = { ...perf, play: playFor(perf) }
    const performanceCalculator = createPerformanceCalculator(p1, playFor(perf))
    return {
      ...p1,
      amount: performanceCalculator.getAmount(),
      volumeCredits: performanceCalculator.getVolumeCredits()
    }
  }

  function playFor(perf: IPerformance): IPlay {
    return plays[perf.playId]
  }

  function totalAmount(statementData: IStatement) {
    let result = 0
    for (let perf of statementData.performances) {
      result += perf.amount
    }
    return result
  }

  function createPerformanceCalculator(perf: IPerformanceEnrich, play: IPlay) {
    if (play.type === EPlayType.TRADGEDY) return new TradgedyCalculator(perf, play)
    if (play.type === EPlayType.COMEDY) return new ComedyCalculator(perf, play)
    throw new Error(`unknown type: ${play.type}`)
  }
}

export function statement(invoice: IInvoice, plays: IPlays) {
  const statementData = createStatementData(invoice, plays)
  return renderPlainText(statementData, plays)
}

function totalVolumeCredits(statementData: IStatement) {
  let result = 0
  for (let perf of statementData.performances) {
    result += perf.volumeCredits
  }
  return result
}

export function renderPlainText(statementData: IStatement, plays: IPlays) {
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
