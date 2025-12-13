import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">글을 찾을 수 없습니다.</p>
        <Link 
          href="/"
          className="inline-block bg-[#C8D932] text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          잔디밭으로 돌아가기
        </Link>
      </div>
    </div>
  )
}