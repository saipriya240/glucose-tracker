
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

const ACCESS_TOKEN_KEY = 'gluco_access_token'
const REFRESH_TOKEN_KEY = 'gluco_refresh_token'

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

function saveTokens(access, refresh) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

async function request(endpoint, options = {}, authenticated = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (authenticated) {
    const token = getAccessToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error(
      'Cannot connect to Gluco server. Make sure Django is running.'
    )
  }

  const data =
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearTokens()
    }

    const message =
      data?.detail ||
      data?.non_field_errors?.[0] ||
      data?.target_low?.[0] ||
      data?.target_high?.[0] ||
      'Something went wrong. Please try again.'

    throw new Error(message)
  }

  return data
}

export const authAPI = {
  async register(userData) {
    return request(
      '/accounts/register/',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      },
      false
    )
  },

  async login(username, password) {
    const data = await request(
      '/accounts/login/',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      },
      false
    )

    saveTokens(data.access, data.refresh)

    return data
  },

  async getProfile() {
    return request('/accounts/profile/')
  },

  async updateProfile(settings) {
    return request('/accounts/profile/', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    })
  },

  logout() {
    clearTokens()
  },
}

export const readingsAPI = {
  getAll() {
    return request('/readings/')
  },

  create(reading) {
    return request('/readings/', {
      method: 'POST',
      body: JSON.stringify(reading),
    })
  },

  update(id, reading) {
    return request(`/readings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(reading),
    })
  },

  delete(id) {
    return request(`/readings/${id}/`, {
      method: 'DELETE',
    })
  },
}
