import { IInvoice, IPlays, EPlayType, IPerformance, IPlay } from './metadata'

export function statement (invoice: IInvoice, plays: IPlays) {
  let totalAmount = 0
  let volumeCredits = 0

  let result = `Statement for ${invoice.customer}\n`

  for (let perf of invoice.performances) {
    volumeCredits += volumeCreditFor(perf)
    result += `  ${playFor(perf).name}: ${usd(amountFor(perf) / 100)} (${perf.audience} seats)\n`
    totalAmount += amountFor(perf)
  }
  result += `Amount owed is ${usd(totalAmount / 100)} \n`
  result += `You earned ${volumeCredits} credits\n`
  return result

  function amountFor(perf: IPerformance) {
    let result = 0

    switch (playFor(perf).type) {
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
        throw new Error(`unknown type: ${playFor(perf).type}`)
    }

    return result
  }

  function playFor(perf: IPerformance): IPlay {
    return plays[perf.playId]
  }

  function volumeCreditFor(perf: IPerformance) {
    let result = 0
    result += Math.max(perf.audience - 30, 0)
    if (playFor(perf).type == EPlayType.COMEDY) result += Math.floor(perf.audience / 5)
    return result    
  }

  function usd(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
      .format(value)
  }
}
