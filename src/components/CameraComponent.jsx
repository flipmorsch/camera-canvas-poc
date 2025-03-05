import React, {useState, useRef} from 'react'
import useImageCapture from '../hooks/useImageCapture'

const CameraComponent = () => {
  const [photo, setPhoto] = useState(null)
  const videoRef = useRef(null)

  const {mediaStream, takePhoto, grabFrame, isLoading, error} = useImageCapture(
    {video: true}
  )

  // Connect the video element to the media stream
  React.useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
    }
  }, [mediaStream])

  const handleTakePhoto = async () => {
    try {
      const blob = await takePhoto()
      setPhoto(URL.createObjectURL(blob))
    } catch (err) {
      console.error('Error taking photo:', err)
    }
  }

  const handleGrabFrame = async () => {
    try {
      const imageBitmap = await grabFrame()
      // Convert ImageBitmap to blob for display
      const canvas = document.createElement('canvas')
      canvas.width = imageBitmap.width
      canvas.height = imageBitmap.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imageBitmap, 0, 0)

      canvas.toBlob(blob => {
        setPhoto(URL.createObjectURL(blob))
      })
    } catch (err) {
      console.error('Error grabbing frame:', err)
    }
  }

  if (error) return <div>Error: {error.message}</div>
  if (isLoading) return <div>Initializing camera...</div>

  return (
    <div>
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width="100%"
          height="auto"
        />
      </div>
      <div>
        <button onClick={handleTakePhoto}>Take Photo</button>
        <button onClick={handleGrabFrame}>Grab Frame</button>
      </div>
      {photo && (
        <div>
          <h3>Captured Image:</h3>
          <img src={photo} alt="Captured" width="100%" />
        </div>
      )}
    </div>
  )
}

export default CameraComponent
