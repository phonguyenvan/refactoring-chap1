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
  constructor(public perf: IPerformanceEnrich, public play: IPlay) {}

  getAmount() {
    let result = 0

    switch (this.perf.play.type) {
      case EPlayType.TRADGEDY:
        result = 40000
        if (this.perf.audience > 30) {
          result += 1000 * (this.perf.audience - 30)
        }
        break
      case EPlayType.COMEDY:
        result = 30000
        if (this.perf.audience > 20) {
          result += 10000 + 500 * (this.perf.audience - 20)
        }
        result += 300 * this.perf.audience
        break
      default:
        throw new Error(`unknown type: ${this.perf.play.type}`)
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
    return { ...p1, amount: amountFor(p1), volumeCredits: volumeCreditFor(p1) }
  }

  function amountFor(perf: IPerformanceEnrich) {
    return new PerformanceCalculator(perf, playFor(perf)).getAmount()
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
}

export function statement(invoice: IInvoice, plays: IPlays) {
  const statementData = createStatementData(invoice, plays)
  return renderPlainText(statementData, plays)
}

function volumeCreditFor(perf: IPerformanceEnrich) {
  let result = 0
  result += Math.max(perf.audience - 30, 0)
  if (perf.play.type == EPlayType.COMEDY) result += Math.floor(perf.audience / 5)
  return result    
}

function totalVolumeCredits(statementData: IStatement) {
  let result = 0
  for (let perf of statementData.performances) {
    result += perf.volumeCredits
  }
  return result
}

export function renderPlainText (statementData: IStatement, plays: IPlays) {
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
