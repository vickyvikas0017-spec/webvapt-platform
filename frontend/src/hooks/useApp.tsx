import React, { createContext, useContext, useState, useEffect } from 'react'
import { getProjects } from '../services/api'
import { Project } from '../utils/types'

interface AppContextType {
  projectId: number | null
  setProjectId: (id: number | null) => void
  projects: Project[]
  refreshProjects: () => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextType>({
  projectId: null,
  setProjectId: () => {},
  projects: [],
  refreshProjects: () => {},
  sidebarOpen: true,
  setSidebarOpen: () => {},
})

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projectId, setProjectIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('webvapt_project_id')
    return saved ? Number(saved) : null
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const setProjectId = (id: number | null) => {
    setProjectIdState(id)
    if (id) localStorage.setItem('webvapt_project_id', String(id))
    else localStorage.removeItem('webvapt_project_id')
  }

  const refreshProjects = async () => {
    try {
      const data = await getProjects()
      setProjects(data)
      if (data.length > 0 && !projectId) {
        setProjectId(data[0].id)
      }
    } catch {}
  }

  useEffect(() => { refreshProjects() }, [])

  return (
    <AppContext.Provider value={{ projectId, setProjectId, projects, refreshProjects, sidebarOpen, setSidebarOpen }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
