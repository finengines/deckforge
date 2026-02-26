// CSV Import with column mapping

export interface ParsedCSV {
  headers: string[]
  rows: Record<string, string>[]
}

export interface ColumnMapping {
  [csvColumn: string]: 'name' | 'description' | 'funFact' | 'image' | 'stat' | 'skip'
}

export interface SuggestedMapping {
  mapping: ColumnMapping
  /** For stat columns, which CSV header maps to which stat name */
  statNames: Record<string, string>
}

/**
 * Parse CSV text handling quoted fields, commas in values, and line breaks in quotes.
 */
export function parseCSV(text: string): ParsedCSV {
  const rows: string[][] = []
  let current: string[] = []
  let cell = ''
  let inQuotes = false
  let i = 0

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cell += '"'
          i += 2
        } else {
          inQuotes = false
          i++
        }
      } else {
        cell += ch
        i++
      }
    } else {
      if (ch === '"') {
        inQuotes = true
        i++
      } else if (ch === ',') {
        current.push(cell.trim())
        cell = ''
        i++
      } else if (ch === '\r') {
        // handle \r\n or lone \r
        current.push(cell.trim())
        cell = ''
        rows.push(current)
        current = []
        i++
        if (i < text.length && text[i] === '\n') i++
      } else if (ch === '\n') {
        current.push(cell.trim())
        cell = ''
        rows.push(current)
        current = []
        i++
      } else {
        cell += ch
        i++
      }
    }
  }

  // Flush remaining
  if (cell || current.length > 0) {
    current.push(cell.trim())
    rows.push(current)
  }

  // Filter empty rows
  const nonEmpty = rows.filter((r) => r.some((c) => c.length > 0))
  if (nonEmpty.length === 0) return { headers: [], rows: [] }

  const headers = nonEmpty[0]
  const dataRows = nonEmpty.slice(1).map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? ''
    })
    return obj
  })

  return { headers, rows: dataRows }
}

/**
 * Auto-detect column mapping based on header names.
 */
export function suggestMapping(headers: string[], rows: Record<string, string>[]): SuggestedMapping {
  const mapping: ColumnMapping = {}
  const statNames: Record<string, string> = {}

  const namePatterns = /^(name|title|card.?name|card.?title)$/i
  const descPatterns = /^(description|desc|text|flavor|flavor.?text)$/i
  const funFactPatterns = /^(fun.?fact|fact|trivia|note)$/i
  const imagePatterns = /^(image|img|picture|photo|art|artwork|src)$/i

  for (const h of headers) {
    if (namePatterns.test(h)) {
      mapping[h] = 'name'
    } else if (descPatterns.test(h)) {
      mapping[h] = 'description'
    } else if (funFactPatterns.test(h)) {
      mapping[h] = 'funFact'
    } else if (imagePatterns.test(h)) {
      mapping[h] = 'image'
    } else {
      // Check if column values are mostly numeric → stat
      const vals = rows.slice(0, 10).map((r) => r[h])
      const numericCount = vals.filter((v) => v && !isNaN(Number(v))).length
      if (numericCount > vals.length * 0.5 && vals.length > 0) {
        mapping[h] = 'stat'
        statNames[h] = h
      } else {
        mapping[h] = 'skip'
      }
    }
  }

  // Ensure at least one name column
  if (!Object.values(mapping).includes('name') && headers.length > 0) {
    mapping[headers[0]] = 'name'
  }

  return { mapping, statNames }
}
