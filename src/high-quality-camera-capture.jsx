'use client'
import {useRef, useState, useEffect} from 'react'

const HighQualityCameraCapture = () => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [imgSrc, setImgSrc] = useState('')
  const [imageCapture, setImageCapture] = useState(null)
  const [photoBlob, setPhotoBlob] = useState(null)

  useEffect(() => {
    const loadImageCapturePolyfill = async () => {
      try {
        if (typeof window !== 'undefined') {
          await import('image-capture')
        }
      } catch (err) {
        console.error('Failed to load image-capture polyfill:', err)
      }
    }

    const initializeCamera = async () => {
      await loadImageCapturePolyfill()

      try {
        const constraints = {
          video: {
            width: {ideal: 4096},
            height: {ideal: 2160},
            facingMode: 'environment',
            advanced: [{zoom: 1}],
          },
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        const videoTrack = stream.getVideoTracks()[0]

        if (typeof window !== 'undefined' && window.ImageCapture) {
          const capture = new ImageCapture(videoTrack)
          setImageCapture(capture)
        }

        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([videoTrack])
          videoRef.current.play()
        }

        const capabilities = videoTrack.getCapabilities()
        console.log('Camera capabilities:', capabilities)
      } catch (err) {
        console.error('Error accessing camera:', err)
      }
    }

    initializeCamera()

    return () => {
      if (imageCapture && imageCapture.track) {
        imageCapture.track.stop()
      }
    }
  }, [])

  const capturePhoto = async () => {
    if (!imageCapture) return

    try {
      let capturedBlob
      if (typeof imageCapture.takePhoto === 'function') {
        capturedBlob = await imageCapture.takePhoto({
          imageWidth: 4096,
          imageHeight: 2160,
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

      setPhotoBlob(capturedBlob)

      const imgUrl = URL.createObjectURL(capturedBlob)
      setImgSrc(imgUrl)
    } catch (error) {
      console.error('Capture error:', error)
    }
  }

  const saveImage = () => {
    if (!photoBlob) return

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

    const link = document.createElement('a')
    link.href = URL.createObjectURL(photoBlob)
    link.download = `photo_${timestamp}.jpg`

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

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
