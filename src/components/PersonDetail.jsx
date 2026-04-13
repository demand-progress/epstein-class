import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

const API_URL = 'https://api.demandprogress.org/wp-json/wp/v2/pages/1390'

function PersonDetail() {
  const { slug } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      })
      .then(data => {
        const createSlug = (name) => name.toLowerCase().replace(/\s+/g, '-')
        const foundPerson = data.acf.bros.find(
          p => createSlug(p.name) === slug
        )
        if (foundPerson) {
          setPerson(foundPerson)
        } else {
          setError('Person not found')
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!person) return null

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to list</Link>

      <div className="person-detail">
        {person.image && (
          <img
            src={person.image.url}
            alt={person.name}
            width={person.image.width}
            height={person.image.height}
            className="person-image"
          />
        )}

        <h1>{person.name}</h1>
        {person.sub_1 && <p className="subtitle">{person.sub_1}</p>}
        {person.sub_2 && <p className="subtitle">{person.sub_2}</p>}

        {person.body && (
          <div
            className="person-body"
            dangerouslySetInnerHTML={{ __html: person.body }}
          />
        )}
      </div>
    </div>
  )
}

export default PersonDetail
