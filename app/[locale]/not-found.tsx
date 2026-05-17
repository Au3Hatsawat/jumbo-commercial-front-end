'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          
          {/* 404 Icon & Text */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4">
              <Search className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              ไม่พบหน้าที่คุณค้นหา
            </h2>
            <p className="text-sm text-gray-500">
              ขอโทษครับ หน้าที่คุณพยายามเข้าถึงไม่มีอยู่ในระบบ<br />
              หรืออาจถูกย้ายไปที่อื่นแล้ว
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/pos"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <Home className="w-5 h-5" />
              กลับหน้าหลัก (POS)
            </Link>
            
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium border border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
              ย้อนกลับ
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">หน้าที่น่าสนใจ</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/pos"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                POS
              </Link>
              <Link
                href="/products"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                สินค้า
              </Link>
              <Link
                href="/orders"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                คำสั่งซื้อ
              </Link>
              <Link
                href="/customers"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                ลูกค้า
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
