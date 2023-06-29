import { readFile, writeFile } from 'node:fs/promises'
import { URL } from 'node:url'

export class Database {
  #database = {}
  #base_path = ''

  constructor (path) {
    this.#base_path = new URL(path || '../db.json', import.meta.url)
  }

  async boot () {
    try {
      const database = await readFile(this.#base_path)
      this.#database = JSON.parse(database)
    } catch (error) {
      await this.#persist()
    }
  }

  async #persist () {
    await writeFile(this.#base_path, JSON.stringify(this.#database, null, 2))
  }

  async insert (table, data) {
    const isTableExists = this.#database[table]
    if (isTableExists) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }
    await this.#persist()
  }

  select (table, search) {
    let dataTable = this.#database[table] ?? []
    if (search) {
      // transformed object in {key:value} to [[key, value]]
      Object.entries(search).forEach(([key, value]) => {
        // filtered each table[key]
        dataTable = this.#database[table].filter(tableRow => {
          const cleanValue = value?.toLowerCase().trim()
          return tableRow[key]?.toLowerCase().includes(cleanValue)
        })
      })
    }

    return dataTable
  }

  async update (table, id, data) {
    const rowIndexFound = this.#database[table].findIndex(data => data.id === id)
    if (rowIndexFound > -1) {
      this.#database[table][rowIndexFound] = { ...data, id }
      await this.#persist()
    }
  }

  async delete (table, id) {
    const rowIndexFound = this.#database[table].findIndex(data => data.id === id)

    if (rowIndexFound > -1) {
      this.#database[table].splice(rowIndexFound, 1)
      await this.#persist()
    }
  }
}
