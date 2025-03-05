import ClientOnly from '../components/client-only'
import HighQualityCameraCapture from '../high-quality-camera-capture'

export default function CameraPage() {
  return (
    <main>
      <h1>Camera Test</h1>
      <ClientOnly>
        <HighQualityCameraCapture />
      </ClientOnly>
    </main>
  )
}
