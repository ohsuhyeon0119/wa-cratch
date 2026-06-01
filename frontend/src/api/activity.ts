import client from './client'

export type Activity = {
  type: string
  icon: string
  text: string
  actor: string
  projectTitle: string
  time: string
}

export async function getActivity(): Promise<Activity[]> {
  const response = await client.get<Activity[]>('/activity')
  return response.data
}
