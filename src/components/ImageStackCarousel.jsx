import { useState, useEffect, useRef } from 'react'

function ImageStackCarousel({ images }) {
  // Generate random rotations on mount (stored to prevent jitter)
  const [rotations] = useState(() =>
    images.map(() => (Math.random() - 0.5) * 20) // -10° to 10°
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState(null)
  const [scale, setScale] = useState(1.1)

  const containerRef = useRef(null)

  // Update scale based on window width
  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth
      if (width <= 500) {
        setScale(1.8)
      } else {
        setScale(1.2)
      }
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Handle pointer down
  const handlePointerDown = (e) => {
    if (isAnimating) return
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({ x: 0, y: 0 })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  // Handle pointer move
  const handlePointerMove = (e) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setDragOffset({ x: deltaX, y: deltaY })
  }

  // Handle pointer up
  const handlePointerUp = (e) => {
    if (!isDragging) return

    setIsDragging(false)

    const deltaX = dragOffset.x
    const deltaY = dragOffset.y

    // Ignore if primarily vertical scroll
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      resetDrag()
      return
    }

    // Check horizontal threshold (100px)
    if (Math.abs(deltaX) > 100) {
      completeSwipe(deltaX > 0 ? 'right' : 'left')
    } else {
      resetDrag()
    }
  }

  // Reset drag state
  const resetDrag = () => {
    setDragOffset({ x: 0, y: 0 })
  }

  // Complete swipe animation
  const completeSwipe = (direction) => {
    setIsAnimating(true)
    setSwipeDirection(direction)

    // Wait for animation to complete
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
      setDragOffset({ x: 0, y: 0 })
      setSwipeDirection(null)
      setIsAnimating(false)
    }, 300)
  }

  // Handle dot click
  const handleDotClick = (index) => {
    if (isAnimating) return
    setCurrentIndex(index)
  }

  // Handle image click
  const handleImageClick = (e) => {
    if (isAnimating || isDragging) return
    e.stopPropagation()
    completeSwipe('right')
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating) return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentIndex((prev) => (prev + 1) % images.length)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images.length, isAnimating])

  // No images
  if (!images || images.length === 0) return null

  // Single image - no carousel UI
  if (images.length === 1) {
    const image = images[0].image
    return (
      <img
        src={image.url}
        alt=""
        width={image.width}
        height={image.height}
        className="person-image"
      />
    )
  }

  // Render only top 5 visible cards for performance
  const visibleCards = [0, 1, 2, 3, 4].map(offset => {
    const index = (currentIndex + offset) % images.length
    return { index, offset }
  })

  return (
    <div className="image-stack-carousel" role="region" aria-label={`Image carousel with ${images.length} images`}>
      <div
        className="image-stack"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetDrag}
        style={{ touchAction: 'pan-y' }}
      >
        {visibleCards.map(({ index, offset }) => {
          const image = images[index].image
          const rotation = rotations[index]
          const zIndex = 5 - offset

          // Calculate transform
          // Start with centering transform and scale
          let transform = `translate(-50%, -50%) scale(${scale})`

          // Top card gets drag offset
          if (offset === 0 && (isDragging || swipeDirection)) {
            const dragX = isDragging ? dragOffset.x : 0
            const dragRotation = isDragging ? dragOffset.x * 0.05 : 0
            transform = `translate(calc(-50% + ${dragX}px), -50%) scale(${scale}) rotate(${rotation + dragRotation}deg)`
          } else {
            transform += ` rotate(${rotation}deg)`
          }

          // Apply offset for stacked effect (cards behind are slightly offset)
          if (offset > 0) {
            transform += ` translateY(${offset * -5}px)`
          }

          const isExiting = offset === 0 && swipeDirection

          return (
            <div
              key={index}
              className={`carousel-image-wrapper ${isExiting ? 'exiting-' + swipeDirection : ''}`}
              style={{
                transform,
                zIndex,
                transition: (isDragging || isExiting) ? 'none' : 'transform 0.3s ease-out',
                willChange: isDragging ? 'transform' : 'auto',
                cursor: offset === 0 ? 'pointer' : 'default',
              }}
              aria-label={`Image ${index + 1} of ${images.length}`}
              onClick={offset === 0 ? handleImageClick : undefined}
            >
              <img
                src={image.url}
                alt=""
                width={image.width}
                height={image.height}
                className="person-image"
                draggable="false"
              />
            </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="carousel-dots">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to image ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  )
}

export default ImageStackCarousel
