import client from './client'

export type Project = {
  id: string
  title: string
  author: string
  authorId: string
  emoji: string
  likes: number
  views: number
  description: string
  tags: string[]
  blocks_json: Record<string, unknown>
}

export async function getProjects(sort?: string, search?: string): Promise<Project[]> {
  const params: Record<string, string> = {}
  if (sort) params.sort = sort
  if (search) params.search = search

  const response = await client.get<Project[]>('/projects', { params })
  return response.data
}

export async function getMyProjects(): Promise<Project[]> {
  const response = await client.get<Project[]>('/projects/me')
  return response.data
}

export async function getProject(id: string): Promise<Project> {
  const response = await client.get<Project>(`/projects/${id}`)
  return response.data
}

export async function createProject(data: {
  title: string
  emoji?: string
  description?: string
  tags?: string[]
}): Promise<Project> {
  const response = await client.post<Project>('/projects', data)
  return response.data
}

export async function updateProject(
  id: string,
  data: Partial<{
    title: string
    emoji: string
    description: string
    tags: string[]
    blocks_json: Record<string, unknown>
  }>
): Promise<Project> {
  const response = await client.put<Project>(`/projects/${id}`, data)
  return response.data
}

export async function deleteProject(id: string): Promise<void> {
  await client.delete(`/projects/${id}`)
}
