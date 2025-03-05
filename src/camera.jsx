'use client'

import React, {useRef, useState} from 'react'
import {getDownloadSignedUrl} from './services/inspection'
import axios from 'axios'
import pica from 'pica'

const CameraCapture = () => {
  const videoRef = useRef < MediaStream > null
  const canvasRef = useRef(null)
  const [photo, setPhoto] = useState(null)
  const [cameraType, setCameraType] = useState('user')

  const startCamera = async facingMode => {
    try {
      const constraints = {
        video: {facingMode: facingMode},
        width: {ideal: 4096},
        height: {ideal: 2160},
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoRef.current.srcObject = stream
    } catch (err) {
      console.error('Error accessing the camera:', err)
    }
  }

  const capturePhoto = async () => {
    try {
      console.log('bateu aqui')
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      context.imageSmoothingEnabled = false
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvas.width = canvas.width
      offscreenCanvas.height = canvas.height

      await pica().resize(canvas, offscreenCanvas, {quality: 3, alpha: true})
      const photoDataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.9)
      setPhoto(photoDataUrl)
    } catch (error) {
      console.error(error.cause)
    }
  }

  const clearPhoto = () => {
    setPhoto(null)
  }

  const savePhoto = () => {
    if (!photo) return

    const link = document.createElement('a')
    link.href = photo
    link.download = `photo_${new Date().toISOString()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stopCamera = () => {
    const stream = videoRef.current.srcObject
    if (stream) {
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const switchCamera = () => {
    stopCamera()
    const newCameraType = cameraType === 'user' ? 'environment' : 'user'
    setCameraType(newCameraType)
    startCamera(newCameraType)
  }

  const uploadPhoto = async () => {
    const url = await getDownloadSignedUrl()
    await axios.put(url, photo, {headers: {'Content-type': 'image/jpeg'}})
  }

  return (
    <div className="camera-container" style={{maxWidth: '100%'}}>
      <h1>Camera Capture</h1>
      <div className="button-container" style={{marginBottom: '10px'}}>
        <button onClick={() => startCamera(cameraType)}>Start Camera</button>
        <button onClick={() => capturePhoto()}>Capture Photo</button>
        <button onClick={switchCamera}>
          Switch to {cameraType === 'user' ? 'Rear' : 'Front'} Camera
        </button>
        <button onClick={stopCamera}>Stop Camera</button>
        <button onClick={() => uploadPhoto()}>Fazer upload</button>
        <button onClick={() => clearPhoto()}>Clear Photo</button>
        {photo && <button onClick={savePhoto}>Save Photo</button>}
      </div>
      <canvas ref={canvasRef} style={{display: 'none'}}></canvas>
      {photo && (
        <div>
          <h2>Captured Photo</h2>
          <div style={{maxWidth: '100%', overflow: 'hidden'}}>
            <img
              src={photo}
              alt="Captured"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}
      {!photo && (
        <div style={{maxWidth: '100%', overflow: 'hidden'}}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          ></video>
        </div>
      )}
    </div>
  )
}

export default CameraCapture
