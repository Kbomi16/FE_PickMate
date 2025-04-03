import { GetServerSidePropsContext } from 'next'
import { Project } from '@/types/project'
import Image from 'next/image'
import profile from '@/assets/icons/profile.png'
import Button from '@/components/Button'
import { MouseEvent, useCallback, useEffect, useState } from 'react'

import eyeVisible from '@/assets/icons/eyeVisible.png'
import { deleteProject, getProjectById } from '@/libs/apis/project'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/router'
import { notify } from '@/components/Toast'
import { applyProject, getAppliedProjects } from '@/libs/apis/apply'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Applicant } from '@/types/apply'
import LikeButton from '@/components/LikeButton'

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!context.params?.id) {
    return { notFound: true }
  }

  const project = await getProjectById(Number(context.params.id))

  return {
    props: {
      project,
    },
  }
}

type ProjectDetailProps = {
  project: Project
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const router = useRouter()
  const { id } = router.query
  const projectId = Number(id)

  const { user } = useAuthStore()
  const isAuthor = user?.nickname === project.authorNickname
  const [hasApplied, setHasApplied] = useState(false)

  const [message, setMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const [isClosed, setIsClosed] = useState(false)

  // 이미 신청한 프로젝트인지 확인
  const checkIfApplied = useCallback(async () => {
    try {
      const appliedProjects: Applicant[] = await getAppliedProjects()
      const isAlreadyApplied = appliedProjects.some(
        (appliedProject) => appliedProject.projectId === project.id,
      )
      setHasApplied(isAlreadyApplied)
    } catch (error) {
      console.error('신청 여부 확인 실패:', error)
    }
  }, [project.id])

  useEffect(() => {
    if (user) {
      checkIfApplied()
    }
  }, [user, project.id, checkIfApplied])

  // 프로젝트 마감일 체크
  useEffect(() => {
    const deadlineDate = new Date(project.deadline)
    const currentDate = new Date()

    // 마감일이 지나면 마감 처리
    if (currentDate > deadlineDate) {
      setIsClosed(true)
    }
  }, [project.deadline])

  const handleAccept = () => {
    setModalOpen(true)
  }

  const handleModalSubmit = async () => {
    try {
      await applyProject(project.id, message)
      setModalOpen(false)
      notify('success', '프로젝트 신청 완료!')
      router.push('/my')
    } catch (error) {
      console.error('프로젝트 신청 실패:', error)
    }
  }

  const handleOutsideClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false)
    }
  }

  const handleEdit = () => {
    router.push(`/edit/project/${project.id}`)
  }

  const handleDelete = async () => {
    try {
      await deleteProject(project.id)
      notify('success', '프로젝트 삭제 성공!')
      router.push('/home')
    } catch (error) {
      notify('error', '프로젝트 삭제에 실패했습니다.')
      console.error('프로젝트 삭제 오류:', error)
      throw error
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-3xl font-bold text-white">
            {project.title}
          </h1>
        </div>
        <div className="flex items-center justify-between gap-1">
          <Image
            src={profile}
            alt="프로필 이미지"
            className="size-10 rounded-full object-cover"
          />
          <p>{project.authorNickname}</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <span className="text-primary text-lg">
          📅 {project.deadline.split('T')[0]} 까지
        </span>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <LikeButton
            id={projectId}
            initialLikes={project.likes}
            type="project"
          />
          <div className="flex items-center gap-1">
            <Image src={eyeVisible} alt="조회수 아이콘" className="size-5" />
            <span>{project.views}</span>
          </div>
        </div>
      </div>

      <div className="border-t pt-10">
        <h2 className="mb-2 text-2xl font-semibold">📄 프로젝트 설명</h2>
        <div className="text-custom-gray-200 min-h-100">
          <div className="markdown-preview min-h-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {project.description}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="pb-10">
        <h2 className="pt-10 text-2xl font-semibold">⚒️ 기술 스택</h2>
        <div className="my-2 flex flex-wrap gap-2">
          {project.techStack.map((stack, index) => (
            <span
              key={index}
              className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
            >
              {stack}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        {isAuthor ? (
          <div className="flex items-center justify-center gap-4">
            <Button type="secondary" className="max-w-100" onClick={handleEdit}>
              편집하기
            </Button>
            <Button
              type="tertiary"
              className="max-w-100"
              onClick={handleDelete}
            >
              삭제하기
            </Button>
          </div>
        ) : isClosed ? (
          <Button type="tertiary" className="max-w-100" disabled>
            마감되었어요.
          </Button>
        ) : hasApplied ? (
          <Button type="tertiary" className="max-w-100" disabled>
            이미 신청했어요.
          </Button>
        ) : (
          <Button type="primary" className="max-w-100" onClick={handleAccept}>
            신청하기
          </Button>
        )}
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg"
          onClick={handleOutsideClick}
        >
          <div
            className="bg-custom-black min-w-100 rounded-lg border-2 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-semibold">🖥️ 메세지 입력</h2>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-custom-white focus:border-custom-white border-custom-gray-300 w-full rounded-lg border-2 bg-transparent px-4 py-3 outline-none"
              placeholder="작성자에게 보낼 메세지를 입력하세요"
            />
            <div className="mt-4 flex w-full items-center justify-center gap-4">
              <Button
                type="primary"
                onClick={handleModalSubmit}
                className="max-w-30"
              >
                제출
              </Button>
              <Button
                type="tertiary"
                onClick={() => setModalOpen(false)}
                className="max-w-30"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
