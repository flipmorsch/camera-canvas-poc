'use client'
import {useRef, useState, useEffect} from 'react'
import '../polyfill/image-capture.js' // Import the polyfill before using ImageCapture

const HighQualityCameraCapture = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [imgSrc, setImgSrc] = useState('')
  const [imageCapture, setImageCapture] = useState(null)
  const [photoBlob, setPhotoBlob] = useState(null)

  // Initialize camera stream with ImageCapture
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const constraints = {
          video: {
            width: {ideal: 4096}, // Request ultra HD resolution
            height: {ideal: 2160},
            facingMode: 'environment',
            advanced: [{zoom: 1}], // Some devices support digital zoom
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        const videoTrack = stream.getVideoTracks()[0]

        // Create ImageCapture instance
        const capture = new ImageCapture(videoTrack)
        setImageCapture(capture)

        // Show preview
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([videoTrack])
          videoRef.current.play()
        }

        // Log actual camera capabilities
        const capabilities = videoTrack.getCapabilities()
        console.log('Camera capabilities:', capabilities)
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    initializeCamera()

    return () => {
      if (imageCapture) {
        imageCapture.track.stop()
      }
    }
  }, [])

  const capturePhoto = async () => {
    if (!imageCapture) return

    try {
      // Try to capture full-resolution photo (if supported)
      let capturedBlob
      if (typeof imageCapture.takePhoto === 'function') {
        capturedBlob = await imageCapture.takePhoto({
          imageWidth: 4096, // Use max supported width
          imageHeight: 2160, // Use max supported height
          fillLightMode: 'auto',
        })
      } else {
        // Fallback to grabbing frame
        const bitmap = await imageCapture.grabFrame()
        const canvas = canvasRef.current
        canvas.width = bitmap.width
        canvas.height = bitmap.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(bitmap, 0, 0)
        capturedBlob = await new Promise(resolve =>
          canvas.toBlob(resolve, 'image/jpeg', 0.95)
        )
        bitmap.close()
      }

      // Store the blob for later saving
      setPhotoBlob(capturedBlob)

      // Create object URL with proper EXIF orientation
      const imgUrl = URL.createObjectURL(capturedBlob)
      setImgSrc(imgUrl)
    } catch (error) {
      console.error('Capture error:', error)
    }
  }

  const saveImage = () => {
    if (!photoBlob) return

    // Create a timestamp for the filename
    const now = new Date()
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}`

    // Create a download link
    const link = document.createElement('a')
    link.href = URL.createObjectURL(photoBlob)
    link.download = `photo_${timestamp}.jpg`

    // Append to body, click and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the object URL
    URL.revokeObjectURL(link.href)
  }

  return (
    <div>
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{width: '100%', maxWidth: '640px'}}
        />
      </div>

      <button onClick={capturePhoto} style={{margin: '20px 0'}}>
        Capture Ultra HD Photo
      </button>

      <canvas ref={canvasRef} style={{display: 'none'}} />

      {imgSrc && (
        <div>
          <h3>Captured Image:</h3>
          <img
            src={imgSrc}
            alt="Captured"
            style={{
              width: '100%',
              maxWidth: '640px',
              imageOrientation: 'from-image', // Respect EXIF data
            }}
            onLoad={() => URL.revokeObjectURL(imgSrc)}
          />
          <button
            onClick={saveImage}
            style={{
              margin: '10px 0',
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save Image
          </button>
        </div>
      )}
    </div>
  )
}

export default HighQualityCameraCapture
