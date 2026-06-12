import axios from 'axios'
import { env } from '../config/env'
import { AppError, BadRequestError } from '../types';
import { ConversionResult, CurrencyFreaksResponse } from '../types/currency';

const BASE_URL = 'https://api.currencyfreaks.com/v2.0'

const fetchRate = async (from: string, to: string): Promise<{ rate: number; date: string }> => {
  const fromUpper = from.toUpperCase()
  const toUpper = to.toUpperCase()

  
  const symbols = [...new Set([fromUpper, toUpper, 'USD'])].join(',')

  try {
    const { data } = await axios.get<CurrencyFreaksResponse>(
      `${BASE_URL}/rates/latest`,
      {
        params: {
          apikey: env.CURRENCYFREAKS_API_KEY,
          symbols,
        },
        timeout: 8000, // fail fast if CurrencyFreaks is slow
      }
    )

    const rates = data.rates

    // make sure both currencies exist in the response
    if (!rates[fromUpper] && fromUpper !== 'USD') {
      throw new AppError(`Currency ${fromUpper} is not supported`, 400)
    }
    if (!rates[toUpper] && toUpper !== 'USD') {
      throw new AppError(`Currency ${toUpper} is not supported`, 400)
    }

    // rates are relative to USD base
    // USD → X  means  1 USD = rates[X]
    const fromRate = fromUpper === 'USD' ? 1 : parseFloat(rates[fromUpper])
    const toRate = toUpper === 'USD' ? 1 : parseFloat(rates[toUpper])

  
    const crossRate = toRate / fromRate

    return {
      rate: crossRate,
      date: data.date,
    }
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        throw new AppError('Currency service authentication failed', 502)
      }
      if (err.response?.status === 429) {
        throw new AppError('Currency rate limit exceeded. Please try again later', 429)
      }
      if (err.code === 'ECONNABORTED') {
        throw new AppError('Currency service timed out. Please try again', 504)
      }
    }
  
    if (err instanceof AppError) throw err

    throw new AppError('Failed to fetch exchange rate. Please try again', 502)
  }
}


export const convert = async (
  from: string,
  to: string,
  amount: number
): Promise<ConversionResult> => {
  if (amount <= 0) {
    throw new BadRequestError('Amount must be greater than zero', 400)
  }

  if (from.toUpperCase() === to.toUpperCase()) {
    throw new BadRequestError('From and To currencies cannot be the same', 400)
  }

  const { rate, date } = await fetchRate(from, to)


  const conversionFee = parseFloat((amount * env.CONVERSION_FEE_PERCENT).toFixed(2))

  // amount after fee is deducted from the sender
  const amountAfterFee = parseFloat((amount - conversionFee).toFixed(6))

  // final converted amount using the net amount
  const convertedAmount = parseFloat((amountAfterFee * rate).toFixed(2))

  return {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount,
    exchangeRate: parseFloat(rate.toFixed(6)),
    conversionFee,
    conversionFeePercent: env.CONVERSION_FEE_PERCENT * 100,
    convertedAmount,
    amountAfterFee,
    rateDate: date,
    deliveryTime: '1-5 minutes', 
  }
}


export const getRates = async (base: string, symbols: string[]) => {
  if (symbols.length === 0) {
    throw new BadRequestError('Please provide at least one currency symbol', 400)
  }

  if (symbols.length > 20) {
    throw new BadRequestError('Maximum 20 currencies per request', 400)
  }

  const baseUpper = base.toUpperCase()
  const symbolsUpper = symbols.map((s) => s.toUpperCase())

  // always include the base in the symbols list so we can cross-calculate
  const allSymbols = [...new Set([...symbolsUpper, 'USD'])].join(',')

  try {
    const { data } = await axios.get<CurrencyFreaksResponse>(
      `${BASE_URL}/rates/latest`,
      {
        params: {
          apikey: env.CURRENCYFREAKS_API_KEY,
          symbols: allSymbols,
        },
        timeout: 8000,
      }
    )

    const rates = data.rates
    const baseRate = baseUpper === 'USD' ? 1 : parseFloat(rates[baseUpper] || '1')

    // build a result object with the base as reference
    const result: Record<string, number> = {}
    for (const symbol of symbolsUpper) {
      if (symbol === baseUpper) {
        result[symbol] = 1
      } else if (rates[symbol]) {
        result[symbol] = parseFloat((parseFloat(rates[symbol]) / baseRate).toFixed(6))
      }
    }

    return {
      base: baseUpper,
      date: data.date,
      rates: result,
    }
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError('Failed to fetch rates. Please try again', 502)
  }
}