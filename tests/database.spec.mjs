import { describe, it, expect } from 'vitest'
import { Database } from '../src/database.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { URL } from 'node:url'

describe('database', () => {
  it('creating database and testing boot method', async () => {
    const databasePath = new URL('../db-test.json', import.meta.url)
    const sut = new Database()

    // clean file
    await writeFile(databasePath, JSON.stringify({}))
    const file = JSON.parse(await readFile(databasePath))
    expect(file).toEqual({})

    await sut.boot()
    expect(sut).toBeInstanceOf(Database)
  })

  it('creating table', async () => {
    const databasePath = new URL('../db-test.json', import.meta.url)
    const sut = new Database(databasePath)
    await sut.boot()
    await writeFile(databasePath, JSON.stringify({}))
    const data = {
      name: 'test',
      email: 'test@test.comß'
    }
    const table = 'test-table'
    await sut.insert(table, data)
    const usersFromDb = await sut.select(table)
    expect(sut).toBeInstanceOf(Database)
    expect(usersFromDb[0]).toEqual(data)
  })
  it('creating table', async () => {
    const databasePath = new URL('../db-test.json', import.meta.url)
    const sut = new Database(databasePath)
    await sut.boot()
    expect(sut).toBeInstanceOf(Database)
  })
})
