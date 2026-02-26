import { describe, it, expect } from 'vitest'
import { parseCSV, suggestMapping } from '../lib/csvImport'

describe('parseCSV', () => {
  it('parses simple CSV', () => {
    const result = parseCSV('name,value\nAlice,10\nBob,20')
    expect(result.headers).toEqual(['name', 'value'])
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', value: '10' })
  })

  it('handles quoted fields with commas', () => {
    const result = parseCSV('name,desc\n"Smith, John","A, B, C"')
    expect(result.rows[0].name).toBe('Smith, John')
    expect(result.rows[0].desc).toBe('A, B, C')
  })

  it('handles escaped quotes', () => {
    const result = parseCSV('name\n"He said ""hello"""')
    expect(result.rows[0].name).toBe('He said "hello"')
  })

  it('handles line breaks in quoted fields', () => {
    const result = parseCSV('name,desc\n"Card 1","Line 1\nLine 2"')
    expect(result.rows[0].desc).toBe('Line 1\nLine 2')
  })

  it('returns empty for empty input', () => {
    const result = parseCSV('')
    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })
})

describe('suggestMapping', () => {
  it('maps name/description columns', () => {
    const headers = ['Title', 'Description', 'Speed', 'Power']
    const rows = [{ Title: 'A', Description: 'B', Speed: '50', Power: '80' }]
    const result = suggestMapping(headers, rows)
    expect(result.mapping['Title']).toBe('name')
    expect(result.mapping['Description']).toBe('description')
    expect(result.mapping['Speed']).toBe('stat')
    expect(result.mapping['Power']).toBe('stat')
  })

  it('falls back to first column as name', () => {
    const headers = ['foo', 'bar']
    const rows = [{ foo: 'a', bar: 'b' }]
    const result = suggestMapping(headers, rows)
    expect(result.mapping['foo']).toBe('name')
  })
})
