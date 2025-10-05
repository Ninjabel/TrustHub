'use client'

import { useState } from 'react'
// SystemBreadcrumb removed; page uses heading instead
import { Search, BookOpen, FileText, Video, HelpCircle, ChevronRight } from 'lucide-react'

interface KnowledgeCategory {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  articleCount: number
  subcategories?: string[]
}

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const categories: KnowledgeCategory[] = [
    {
      id: '1',
      title: 'Raportowanie i sprawozdawczość',
      description: 'Instrukcje wypełniania formularzy, terminy, wymagania techniczne',
      icon: <FileText className="h-6 w-6" />,
      articleCount: 24,
      subcategories: ['Formularze RIP', 'Sprawozdania kwartalne', 'Raporty roczne'],
    },
    {
      id: '2',
      title: 'Wymogi prawne i regulacyjne',
      description: 'Akty prawne, rekomendacje, wytyczne UKNF',
      icon: <BookOpen className="h-6 w-6" />,
      articleCount: 36,
      subcategories: ['Ustawy', 'Rozporządzenia', 'Rekomendacje'],
    },
    {
      id: '3',
      title: 'Obsługa systemu',
      description: 'Instrukcje korzystania z systemu komunikacji',
      icon: <HelpCircle className="h-6 w-6" />,
      articleCount: 15,
      subcategories: ['Logowanie', 'Wysyłka dokumentów', 'Zarządzanie użytkownikami'],
    },
    {
      id: '4',
      title: 'Szkolenia i webinary',
      description: 'Materiały szkoleniowe, nagrania webinarów',
      icon: <Video className="h-6 w-6" />,
      articleCount: 8,
      subcategories: ['Nagrania', 'Prezentacje', 'Materiały dodatkowe'],
    },
  ]

  const recentArticles = [
    {
      id: '1',
      title: 'Zmiany w raportowaniu na Q2 2025',
      category: 'Raportowanie',
      date: '2025-03-15',
      views: 245,
    },
    {
      id: '2',
      title: 'Nowe wymogi dotyczące kredytów konsumenckich',
      category: 'Wymogi prawne',
      date: '2025-03-10',
      views: 189,
    },
    {
      id: '3',
      title: 'Jak wypełnić formularz F01.01.01.a',
      category: 'Raportowanie',
      date: '2025-03-08',
      views: 342,
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      {/* SystemBreadcrumb removed - heading below serves as context */}
      {/* Breadcrumbs removed - TabNavigation in layout is used for tabs */}

      <div className="flex-1 px-6 py-6">
        {/* Search */}
        <div className="bg-white rounded border border-gray-300 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Baza wiedzy</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj w bazie wiedzy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded border border-gray-300 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {category.articleCount} artykułów
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  {category.subcategories && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-300">
            <h2 className="text-lg font-semibold text-gray-900">Ostatnio dodane artykuły</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentArticles.map((article) => (
              <div
                key={article.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                        {article.category}
                      </span>
                      <span>{new Date(article.date).toLocaleDateString('pl-PL')}</span>
                      <span>{article.views} wyświetleń</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-white border border-gray-300 rounded text-left hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-1">
              FAQ - najczęściej zadawane pytania
            </div>
            <div className="text-xs text-gray-600">
              Odpowiedzi na popularne pytania
            </div>
          </button>
          
          <button className="p-4 bg-white border border-gray-300 rounded text-left hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Kontakt z helpdesk
            </div>
            <div className="text-xs text-gray-600">
              Pomoc techniczna i wsparcie
            </div>
          </button>
          
          <button className="p-4 bg-white border border-gray-300 rounded text-left hover:bg-gray-50">
            <div className="text-sm font-medium text-gray-900 mb-1">
              Zgłoś problem
            </div>
            <div className="text-xs text-gray-600">
              Zgłoś błąd lub sugestię
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
