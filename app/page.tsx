'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Eye, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bhtqjipygkawoyieidgp.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodHFqaXB5Z2thd285aWVpZGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODg5NjgsImV4cCI6MjA3MDA2NDk2OH0.hu2EAj9RCq436QBtfbEVF4aGOau4WWomLMDKahN4iAA'
)

interface Guide {
  id: string
  month: number
  day: number
  image_url: string
  created_at: string
}

export default function GiftGuideViewer() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    file: null as File | null
  })

  // 가이드 목록 조회
  const fetchGuides = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gift_guides')
        .select('*')
        .order('month', { ascending: false })
        .order('day', { ascending: false })

      if (error) throw error
      setGuides(data || [])
    } catch (error) {
      console.error('가이드 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  // 가이드 삭제
  const deleteGuide = async (guide: Guide) => {
    if (!confirm('이 가이드를 삭제하시겠습니까?')) return
    
    try {
      // 이미지 파일 삭제
      if (guide.image_url) {
        const fileName = guide.image_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('gift-guide-images')
            .remove([fileName])
        }
      }

      // 데이터베이스에서 삭제
      const { error } = await supabase
        .from('gift_guides')
        .delete()
        .eq('id', guide.id)
      
      if (error) throw error
      
      fetchGuides()
      setSelectedGuide(null)
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 파일 업로드
  const handleUpload = async () => {
    if (!uploadForm.file) {
      alert('이미지를 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      // 파일명 생성
      const timestamp = Date.now()
      const fileName = `${uploadForm.month}_${uploadForm.day}_${timestamp}_${uploadForm.file.name}`

      // Supabase Storage에 이미지 업로드
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gift-guide-images')
        .upload(fileName, uploadForm.file)

      if (uploadError) throw uploadError

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('gift-guide-images')
        .getPublicUrl(fileName)

      // 데이터베이스에 저장
      const { error: dbError } = await supabase
        .from('gift_guides')
        .insert({
          month: uploadForm.month,
          day: uploadForm.day,
          image_url: publicUrl
        })

      if (dbError) throw dbError

      // 폼 초기화
      setUploadForm({
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        file: null
      })
      setShowUpload(false)
      fetchGuides()
      alert('가이드가 성공적으로 업로드되었습니다.')

    } catch (error) {
      console.error('업로드 오류:', error)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuides()
  }, [])

  return (
    <html lang="ko" className="dark">
      <head>
        <title>사은품 가이드</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background-color: #0f1419; color: white; font-family: system-ui, sans-serif; }
        `}</style>
      </head>
      <body className="bg-slate-900">
        <div className="min-h-screen bg-slate-900 text-white">
          {/* 헤더 */}
          <header className="bg-slate-800 border-b border-slate-700 p-4">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-blue-400">사은품 가이드</h1>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus size={20} />
                가이드 추가
              </button>
            </div>
          </header>

          <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 좌측: 가이드 목록 */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-4 text-slate-200">가이드 목록</h2>
                  {loading ? (
                    <div className="text-center py-8 text-slate-400">로딩 중...</div>
                  ) : guides.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">가이드가 없습니다.</div>
                  ) : (
                    <div className="space-y-2">
                      {guides.map((guide) => (
                        <div
                          key={guide.id}
                          onClick={() => setSelectedGuide(guide)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedGuide?.id === guide.id
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white'
                          }`}
                        >
                          <div className="font-medium text-center">
                            {guide.month}월 {guide.day}일
                          </div>
                          <div className="text-xs text-center opacity-75 mt-1">
                            사은품 가이드
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 우측: 이미지 뷰어 */}
              <div className="lg:col-span-3">
                {selectedGuide ? (
                  <div className="bg-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-blue-400">
                        {selectedGuide.month}월 {selectedGuide.day}일 사은품 가이드
                      </h2>
                      <button
                        onClick={() => deleteGuide(selectedGuide)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-900 rounded-lg"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* 이미지 표시 */}
                    <div className="bg-slate-900 rounded-xl p-4">
                      {selectedGuide.image_url ? (
                        <img
                          src={selectedGuide.image_url}
                          alt={`${selectedGuide.month}월 ${selectedGuide.day}일 사은품 가이드`}
                          className="w-full h-auto rounded-lg shadow-2xl"
                          style={{ maxHeight: '85vh', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="text-center py-20 text-slate-400">
                          이미지를 불러올 수 없습니다.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded-xl p-6 text-center">
                    <Eye size={64} className="mx-auto mb-4 text-slate-600" />
                    <p className="text-slate-400 text-lg">가이드를 선택하여 이미지를 확인하세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 업로드 모달 */}
          {showUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                <h3 className="text-xl font-semibold mb-6 text-blue-400">가이드 추가</h3>
                
                <div className="space-y-4">
                  {/* 월 선택 */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">월</label>
                    <select
                      value={uploadForm.month}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, month: Number(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month}월</option>
                      ))}
                    </select>
                  </div>

                  {/* 일 선택 */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">일</label>
                    <select
                      value={uploadForm.day}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, day: Number(e.target.value) }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}일</option>
                      ))}
                    </select>
                  </div>

                  {/* 파일 업로드 */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">이미지 파일</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setUploadForm(prev => ({ ...prev, file }))
                      }}
                      className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowUpload(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={loading || !uploadForm.file}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 px-4 py-2 rounded-lg text-white transition-colors"
                  >
                    {loading ? '업로드 중...' : '업로드'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </body>
    </html>
  )
}
