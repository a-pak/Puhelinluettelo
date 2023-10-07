const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors()) 
app.use(bodyParser.json())
app.use(express.json())
morgan.token('req-body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

let persons = [
    {
      "name": "Arto Hellas",
      "number": "040-123456",
      "id": 1
    },
    {
      "name": "Ada Lovelace",
      "number": "39-44-5323523",
      "id": 2
    },
    {
      "name": "Dan Abramov",
      "number": "12-43-234345",
      "id": 3
    },
    {
      "name": "Mary Poppendieck",
      "number": "39-23-6423122",
      "id": 4
    },
    {
      "name": "Testi1",
      "number": "123",
      "id": 5
    }
  ]

app.get('/', (req, res) => {
  res.send('<h1>Phonebook Service</h1>')
})

app.get('/info', (req, res) => {

  const personsLen = persons.length
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }
  const currentDate = new Date().toLocaleDateString('fi-FI', options);
  const message = `
    <p>Phonebook has info for ${personsLen} people</p> 
    <p>${currentDate}</p>
    `
  res.send(message)
})

app.get('/api/persons/', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id/', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(p => {
    console.log(p.id, typeof p.id, typeof id)
    return p.id === id
  })
  console.log(person)
  person
    ? res.json(person)
    : res.status(404).end() 
})

app.post('/api/persons/', (req, res) => {
  const person = req.body
  console.log(req.body)
  if (person.name !== undefined) {
    person.id = Math.floor(10000*Math.random(0, 99999))
    console.log(person.id)
    if (!persons.find(i => i.name === person.name)) {
      persons = persons.concat(person)
      res.json(person)
    } else {
      return res.status(400).json({
        error: 'name is already in the phonebook'
      })
    }
  } else {
    return res.status(400).json({
      error: 'you need to provide both name and number'
    })
  }
})

app.delete('/api/persons/:id/', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(p => p.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
