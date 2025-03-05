import {useState, useEffect, useCallback, useRef} from 'react'
import '../polyfill/image-capture' // Import the polyfill to ensure ImageCapture is available

/**
 * React hook to use the ImageCapture API with proper lifecycle management
 *
 * @param {MediaStreamTrack|MediaStreamConstraints} trackOrConstraints - Video track or constraints to use
 * @returns {Object} Camera control methods and state
 */
const useImageCapture = trackOrConstraints => {
  const [mediaStream, setMediaStream] = useState(null)
  const [imageCapture, setImageCapture] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const videoTrackRef = useRef(null)

  // Initialize with either a track or by requesting access with constraints
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      try {
        setError(null)
        setIsLoading(true)

        let videoTrack

        // If provided a track directly, use it
        if (trackOrConstraints && trackOrConstraints.kind === 'video') {
          videoTrack = trackOrConstraints
        }
        // If provided constraints, request media access
        else {
          const constraints = trackOrConstraints || {
            video: {facingMode: 'environment'},
          }

          const stream = await navigator.mediaDevices.getUserMedia(constraints)
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop())
            return
          }

          setMediaStream(stream)
          videoTrack = stream.getVideoTracks()[0]
        }

        if (!videoTrack) {
          throw new Error('No video track available')
        }

        videoTrackRef.current = videoTrack
        const capture = new ImageCapture(videoTrack)

        if (mounted) {
          setImageCapture(capture)
          setIsLoading(false)
        }
      } catch (err) {
        if (mounted) {
          console.error('Error initializing ImageCapture:', err)
          setError(err)
          setIsLoading(false)
        }
      }
    }

    initialize()

    return () => {
      mounted = false
      // Cleanup resources
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [trackOrConstraints])

  /**
   * Take a photo using the camera
   * @returns {Promise<Blob>} Photo as a Blob
   */
  const takePhoto = useCallback(async () => {
    if (!imageCapture) {
      throw new Error('ImageCapture not initialized')
    }
    return imageCapture.takePhoto()
  }, [imageCapture])

  /**
   * Grab a frame from the camera
   * @returns {Promise<ImageBitmap>} Frame as an ImageBitmap
   */
  const grabFrame = useCallback(async () => {
    if (!imageCapture) {
      throw new Error('ImageCapture not initialized')
    }
    return imageCapture.grabFrame()
  }, [imageCapture])

  /**
   * Get photo capabilities
   * @returns {Promise<PhotoCapabilities>}
   */
  const getPhotoCapabilities = useCallback(async () => {
    if (!imageCapture) {
      throw new Error('ImageCapture not initialized')
    }
    return imageCapture.getPhotoCapabilities()
  }, [imageCapture])

  return {
    mediaStream,
    imageCapture,
    isLoading,
    error,
    takePhoto,
    grabFrame,
    getPhotoCapabilities,
    videoTrack: videoTrackRef.current,
  }
}

export default useImageCapture
