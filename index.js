require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')
const Person = require('./models/person.js')
const app = express()

const requestLogger = (req, response, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('---')
  next()
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message})
  }

  next(error)
}


app.use(express.json())
app.use(express.static('build'))
app.use(cors()) 
app.use(requestLogger)
app.use(bodyParser.json())

morgan.token('req-body', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))
app.use(express.static('dist'))



app.get('/info', (req, res, next) => {

  Person.find({})
    .then(persons => {
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
        <p>Phonebook has info for ${persons.length} people</p> 
        <p>${currentDate}</p>
        `
      res.send(message)    
    })
    .catch(e => next(e))


})

app.get('/', (req, res) => {
  res.send('<h1>Phonebook Service</h1>')
})

app.get('/api/persons/', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id/', (req, res) => {
  Person.findById(req.params.id)
    .then(person => {
      if(person) {
        res.json(person)
      } else {
        response.status(404).end()
      }  
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.put('/api/persons/:id/', (req, res, next) => {
  const {name, number} = req.body

  Person.findByIdAndUpdate(
    req.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query'})
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (req, res, next) => {
  
  const body = req.body
  console.log(body)
  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: 'content missing' })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id/', (req, res, next) => {

  const id = Number(req.params.id)
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
