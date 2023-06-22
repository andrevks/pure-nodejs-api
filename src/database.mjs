import { readFile, writeFile } from 'node:fs/promises'
import { URL } from 'node:url'

export class Database {
  #database = {}
  #base_path = ''

  constructor (path) {
    this.#base_path = path || new URL('../db.json', import.meta.url)
  }

  async boot () {
    try {
      const database = await readFile(this.#base_path)
      this.#database = JSON.parse(database)
    } catch (error) {
      console.log(error)
      await this.#persist()
    }
  }

  async #persist () {
    await writeFile(this.#base_path, JSON.stringify(this.#database))
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

  async select (table) {
    return this.#database[table]
  }

  async update (table, id, data) {
    const rowIndexFound = this.database[table].findIndex(data => data.id === id)
    if (rowIndexFound) {
      this.database[table][rowIndexFound] = { ...data }
    }
  }

  async delete (table, id) {
    const rowIndexFound = this.database[table].findIndex(data => data.id === id)

    if (rowIndexFound) {
      this.#database[table].splice(rowIndexFound, 1)
    }
  }
}
