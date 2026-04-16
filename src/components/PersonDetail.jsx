import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ImageStackCarousel from './ImageStackCarousel'

const API_URL = 'https://api.demandprogress.org/wp-json/wp/v2/pages/1390'

function PersonDetail() {
  const { slug } = useParams()
  const [person, setPerson] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch data')
        return response.json()
      })
      .then(data => {
        setPageData(data)
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
  if (!person || !pageData) return null

  return (
    <div className="container detail">
      <Link to="/" className="detail-header-link">
        <header className="site-header detail-header">
          <div className="header-text">
            <h1 dangerouslySetInnerHTML={{ __html: pageData.title.rendered }} />
            <div
              className="site-content"
              dangerouslySetInnerHTML={{ __html: pageData.content.rendered }}
            />
          </div>
        </header>
      </Link>

      <div className="person-detail">
        <div className="folder-open-top">
          <h2 className="person-detail-name">{person.name}</h2>
          <div className='person-detail-image-wrap'>
            {person.detail_images && person.detail_images.length > 0 ? (
              <ImageStackCarousel images={person.detail_images} />
            ) : person.image ? (
              <img
                src={person.image.url}
                alt={person.name}
                width={person.image.width}
                height={person.image.height}
                className="person-image"
              />
            ) : null}
          </div>
        </div>
        <div className="folder-open-middle">

          {person.body && (
            <div
              className="person-body"
              dangerouslySetInnerHTML={{ __html: person.body }}
            />
          )}
        </div>
        <div className="folder-open-bottom">
          <Link to="/" className="back-link">← Back</Link>
        </div>
      </div>
    </div>
  )
}

export default PersonDetail
