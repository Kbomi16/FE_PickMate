import axiosInstance from '../axiosInstance'
import { StudyDataResponse } from '@/types/study'

// 스터디 생성 (CREATE)
export const createStudy = async (data: StudyDataResponse) => {
  try {
    const response = await axiosInstance.post('/studies/addStudy', data)
    return response.data
  } catch (error) {
    console.error('스터디 생성 실패:', error)
    throw error
  }
}

// 전체 스터디 조회 (READ)
export const getAllStudies = async () => {
  try {
    const response = await axiosInstance.get('/studies/all')
    return response.data
  } catch (error) {
    console.error('스터디 조회 실패:', error)
    throw error
  }
}

// 단일 스터디 조회 (READ)
export const getStudyById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/studies/${id}`)
    return response.data
  } catch (error) {
    console.error('단일 스터디 조회 실패:', error)
    throw error
  }
}

// 스터디 수정 (UPDATE)
export const updateStudy = async (
  id: number,
  data: StudyDataResponse,
  accessToken: string,
) => {
  try {
    const response = await axiosInstance.put(`/studies/${id}`, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    console.error('스터디 수정 실패:', error)
    throw error
  }
}

// 스터디 삭제 (DELETE)
export const deleteStudy = async (id: number) => {
  try {
    const response = await axiosInstance.delete(`/studies/${id}`)
    return response.data
  } catch (error) {
    console.error('스터디 삭제 실패:', error)
    throw error
  }
}
