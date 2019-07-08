import { IInvoice, IPlays, EPlayType, IPerformance, IPlay } from './metadata'

interface IPerformanceEnrich extends IPerformance {
  play: IPlay
  amount?: number
}

interface IStatement {
  customer: string
  performances: IPerformanceEnrich[]
}

export function statement(invoice: IInvoice, plays: IPlays) {
  const statementData: IStatement = {
    customer: invoice.customer,
    performances: invoice.performances.map(enrichPerformance),
  };
  return renderPlainText(statementData, plays)

  function enrichPerformance(perf: IPerformance) {
    const p1 = { ...perf, play: playFor(perf) }
    return { ...p1, amount: amountFor(p1) }
  }

  function playFor(perf: IPerformance): IPlay {
    return plays[perf.playId]
  }
}

function amountFor(perf: IPerformanceEnrich) {
  let result = 0

  switch (perf.play.type) {
    case EPlayType.TRADGEDY:
      result = 40000
      if (perf.audience > 30) {
        result += 1000 * (perf.audience - 30)
      }
      break
    case EPlayType.COMEDY:
      result = 30000
      if (perf.audience > 20) {
        result += 10000 + 500 * (perf.audience - 20)
      }
      result += 300 * perf.audience
      break
    default:
      throw new Error(`unknown type: ${perf.play.type}`)
  }

  return result
}

export function renderPlainText (statementData: IStatement, plays: IPlays) {
  let result = `Statement for ${statementData.customer}\n`
  for (let perf of statementData.performances) {
    result += `  ${perf.play.name}: ${usd(amountFor(perf) / 100)} (${perf.audience} seats)\n`
  }
  result += `Amount owed is ${usd(totalAmount() / 100)} \n`
  result += `You earned ${totalVolumeCredits()} credits\n`
  return result



  function volumeCreditFor(perf: IPerformanceEnrich) {
    let result = 0
    result += Math.max(perf.audience - 30, 0)
    if (perf.play.type == EPlayType.COMEDY) result += Math.floor(perf.audience / 5)
    return result    
  }

  function totalVolumeCredits() {
    let result = 0
    for (let perf of statementData.performances) {
      result += volumeCreditFor(perf)
    }
    return result
  }

  function totalAmount() {
    let result = 0
    for (let perf of statementData.performances) {
      result += amountFor(perf)
    }
    return result
  }

  function usd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(value)
  }
}
