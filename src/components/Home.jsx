import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = 'https://api.demandprogress.org/wp-json/wp/v2/pages/1390'

function Home() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="loading">Loading...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!data) return null

  const createSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '-')
  }

  return (
    <div className="container">
      <header className="site-header">
        <h1 dangerouslySetInnerHTML={{ __html: data.title.rendered }} />
      </header>

      <div
        className="site-content"
        dangerouslySetInnerHTML={{ __html: data.content.rendered }}
      />

      <div className="people-grid">
        {data.acf.bros.map((person, index) => (
          <Link
            key={index}
            to={`/${createSlug(person.name)}`}
            className="person-card"
          >
            {person.image && (
              <img
                src={person.image.url}
                alt={person.name}
                width={person.image.width}
                height={person.image.height}
              />
            )}
            <h2>{person.name}</h2>
            {person.sub_1 && <p className="subtitle">{person.sub_1}</p>}
            {person.sub_2 && <p className="subtitle">{person.sub_2}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
