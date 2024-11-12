import { useState, useEffect } from 'react'
import personsService from './services/persons'

const Person = ({ person, removePerson }) => {
  return (
    <li>{person.name} {person.number}
    <button onClick={() => removePerson(person.id)}>Delete</button>

    </li>

  )
}


const Names = ({ filteredNames, removePerson }) => {
  return (
    <ul>
        {filteredNames.map(person =>
          <Person key={person.id} person={person} removePerson={removePerson} />
        )}
    </ul>
  )
}

const Filter = ({ searchNames, handleFiltering }) => {
  return (
    <form>
        filter shown with
        <input
          value = {searchNames}
          onChange={handleFiltering}
          />
      </form>
  )
}

const Notification = ({ message, errorMessage }) => {

  if (errorMessage  !== null) {
    return (
      <div className="error">
      {errorMessage}
    </div>
    )
  }
  if (message === null) {
    return null
  }

  return (
    <div className="added">
      {message}
    </div>
  )
}


const PersonForm = ({newNumber, addName, newName, handleNameChange, handleNumberChange}) => {
  return (
    <div>
    <form onSubmit={addName}>
        <div>
          name: 
          <input
            value={newName}
            onChange={handleNameChange}
          />
          <div>
            number: 
            <input 
              value={newNumber}
              onChange={handleNumberChange}
            />
            </div>
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
      </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([])
  

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchNames, setSearchNames] = useState('')

  const [addMessage, setAddMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const removePerson = (id) => {
    const person = persons.find(p => p.id === id)

    if (window.confirm(`Delete ${person.name}?`)) {
      personsService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        }, [])

    }
    
  }

  useEffect(() => {
    personsService
      .getAll()
        .then(initialPersons => {
          setPersons(initialPersons)
        })
  }, [])

  const findPersonIdByName = (name) => {
    const person = persons.find(person => person.name.toLowerCase() === name.toLowerCase());
    return person ? person.id : null;
  }
  

  const addName = (event) => {
    event.preventDefault()
    const nameExist = persons.some(item => item.name === newName)
    

    if  ( nameExist) {
      const id = findPersonIdByName(newName)
      

      if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
        const person = persons.find(p => p.id === id)
        const changedNumber = { ...person, number: newNumber }

        
        personsService.update(id, changedNumber)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== id ? p : returnedPerson))
            setNewName('') 
            setNewNumber('') 
          })
          .catch(error => {
            setErrorMessage(
              error.response.data.error      
              )        
              setTimeout(() => {          
                setErrorMessage(null)        
              }, 5000)        
              setPersons(persons.filter(n => n.id !== id))
          })

      }
    }
    else {
    const nameObject = {
      name: newName,
      number: newNumber,
      }
    
    personsService
      .create(nameObject)  
      .then(returnedPerson => {      
        setPersons(persons.concat(returnedPerson))
        setAddMessage(`Added ${newName}`)
        setTimeout(() => {
          setAddMessage(null);
        }, 5000)
        setNewName('') 
        setNewNumber('')  
      })
      .catch(error => {
        setErrorMessage(
          error.response.data.error
          )        
          setTimeout(() => {          
            setErrorMessage(null)        
          }, 5000) 
      })
  
    }
  }
  const handleNameChange = (event) => {
    setNewName(event.target.value) 
  }
  const handleNumberChange = (event) =>{
    setNewNumber(event.target.value)
  }

  const handleFiltering = (event) => {
    setSearchNames(event.target.value)
  }

  const filteredNames = persons.filter(person => person.name && person.name.toLowerCase().includes(searchNames.toLowerCase()))


  return (
    <div>
        <h2>Phonebook</h2>
        <Notification message={addMessage} errorMessage={errorMessage}/>

        <Filter searchNames={searchNames} handleFiltering={handleFiltering} />

        <h3>Add a new</h3>
  
        <PersonForm persons = {persons} addName={addName} newNumber={newNumber} newName={newName}  handleNameChange={handleNameChange} handleNumberChange={handleNumberChange}/>
      
  
        <h3>Numbers</h3>
        <Names filteredNames={filteredNames} removePerson={removePerson}/>
      </div>
    )
  }

      



export default App
