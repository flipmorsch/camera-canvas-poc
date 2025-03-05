import axios from "axios"

export const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
      'Content-Type': 'application/json',
    }
  })

  instance.interceptors.request.use(undefined, error => {
    return new Promise.reject(error)
  })
  return instance
}

export const api = createAxiosInstance()
