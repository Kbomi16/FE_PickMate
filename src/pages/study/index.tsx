/* eslint-disable @typescript-eslint/no-unused-vars */
import StudyBanner from '@/components/Banner/StudyBanner'
import Dropdown from '@/components/Dropdown'
import Pagination from '@/components/Pagination'
import SearchBar from '@/components/SearchBar'
import StudyList from '@/components/StudyList'
import { getAllStudies } from '@/libs/apis/study'
import { Study } from '@/types/study'
import { useState } from 'react'

export async function getStaticProps() {
  const studies = await getAllStudies()
  return {
    props: { studies },
    revalidate: 300, // 5분마다 revalidate
  }
}

type StudyProps = {
  studies: Study[]
}

export default function StudyPage({ studies }: StudyProps) {
  const [sortedStudies, setSortedStudies] = useState<Study[]>(studies)
  const [sortOption, setSortOption] = useState('최신순')

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const totalPages = Math.ceil(studies.length / itemsPerPage)

  const handleSortChange = (option: string) => {
    setSortOption(option)
    const sorted = [...studies]

    switch (option) {
      case '최신순':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case '좋아요순':
        sorted.sort((a, b) => b.likes - a.likes)
        break
      case '조회순':
        sorted.sort((a, b) => b.views - a.views)
        break
      default:
        break
    }

    setSortedStudies(sorted)
  }

  return (
    <div>
      <StudyBanner />
      <div className="mx-auto w-full max-w-[1200px] px-10 py-10">
        <div className="flex items-center justify-start gap-4 py-10">
          <Dropdown onSelect={handleSortChange} />
          <SearchBar />
        </div>
        <StudyList
          currentPage={currentPage}
          studies={sortedStudies}
          itemsPerPage={itemsPerPage}
        />
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  )
}
