import { describe, it, expect } from 'vitest'
import { Database } from '../src/database.mjs'
import { readFile, writeFile } from 'node:fs/promises'
import { URL } from 'node:url'
import { randomUUID } from 'node:crypto'

const setupDatabase = async () => {
  const databasePath = new URL('../db-test.json', import.meta.url)
  const sut = new Database(databasePath)
  await sut.boot()

  const data = {
    id: randomUUID(),
    name: 'test',
    email: 'test@test.com'
  }
  const table = 'test-table'
  return { sut, databasePath, table, data }
}
const { sut, databasePath, table, data } = await setupDatabase()

describe('database', async () => {
  it('should create database and call boot method', async () => {
    // clean file
    await writeFile(databasePath, JSON.stringify({}))
    const file = JSON.parse(await readFile(databasePath))
    expect(file).toEqual({})

    await sut.boot()
    expect(sut).toBeInstanceOf(Database)
  })

  it('creating table and first registry', async () => {
    await sut.insert(table, data)
    const usersFromDb = await sut.select(table)
    expect(sut).toBeInstanceOf(Database)
    expect(usersFromDb[0]).toEqual(data)
  })

  it('selecting table', async () => {
    await sut.select(table)
    const usersFromDb = await sut.select(table)
    expect(sut).toBeInstanceOf(Database)
    expect(usersFromDb).toEqual([data])
  })

  it('updating registry in table by id', async () => {
    const listOfDataFromTable = await sut.select(table)
    const firstUserFromDb = listOfDataFromTable[0]
    expect(firstUserFromDb).toEqual(data)

    const updatedData = {
      name: 'updated test',
      email: 'updated-test@test.com'
    }

    await sut.update(table, data.id, updatedData)

    const listFromTable = await sut.select(table)
    const firstUpdatedUser = listFromTable[0]
    expect(firstUpdatedUser).toEqual({ ...updatedData, id: data.id })
  })

  it('select registry from table by filter and return empty array for not found registry ', async () => {
    /*
        search: {
          name: valueToBeSearched,
          email: valueToBeSearched,
        }

        return array with only filtered data or just empty in case not found
      */
    const notFoundSearch = {
      name: 'not found registry',
      email: 'not-found@test.com'
    }

    const filteredData = await sut.select(table, notFoundSearch)

    expect(filteredData).toEqual([])
  })

  it('select registry from table by filter and return array with filtered data ', async () => {
    /*
      search: {
        name: valueToBeSearched,
        email: valueToBeSearched,
      }
      return array with only filtered data or just empty in case not found
      */
    const newData = {
      id: randomUUID(),
      name: 'chuck',
      email: 'chuck@gmail.br'
    }

    await sut.insert(table, newData)

    const searchByName = {
      name: 'Chuck '
    }
    let filteredData = await sut.select(table, searchByName)

    expect(filteredData).toEqual([newData])

    const searchByEmail = {
      email: 'CHUCK@gmail.br  '
    }
    filteredData = await sut.select(table, searchByEmail)

    expect(filteredData).toEqual([newData])
  })

  it('delete registry in table by id', async () => {
    const newData = {
      id: randomUUID(),
      name: 'deleted user',
      email: 'deleted-user@test.br'
    }
    // create new user
    await sut.insert(table, newData)

    // search by id to check it was created
    const searchById = {
      id: newData.id
    }
    let filteredData = await sut.select(table, searchById)

    expect(filteredData).toEqual([newData])

    // delete it
    await sut.delete(table, newData.id)

    // check again to see if it was deleted
    filteredData = await sut.select(table, searchById)

    expect(filteredData).toEqual([])
    expect(filteredData).not.toEqual([newData])
  })
})
