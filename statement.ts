import { IInvoice, IPlays, IStatement } from './metadata'
import { createStatementData } from './create-statement'

export function statement(invoice: IInvoice, plays: IPlays) {
  const statementData = createStatementData(invoice, plays) as IStatement
  return renderPlainText(statementData)
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
