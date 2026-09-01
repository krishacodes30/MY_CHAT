// import axios from 'axios';


// const axiosInstance = axios.create({
//     baseURL: import.meta.env.VITE_API_URL,
//     headers: {
//         "Authorization": `Bearer ${localStorage.getItem('token')}`
//     }
// })


// export default axiosInstance;   


import axios from 'axios'

// Automatically picks up Vercel env var in production, falls back to localhost in dev
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  return response.json()
}


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})



axiosInstance.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem('token')


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`
        }


        return config
    }
)


export default axiosInstance

