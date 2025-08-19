# 견적 관리 시스템 🚀

## 파일 3개로 1분 배포!

### 📁 프로젝트 구조
```
quote-system/
├── package.json
├── app/page.tsx
└── README.md
```

### 🗄️ 1. Supabase 테이블 생성
```sql
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL, title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quote_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
    provider TEXT, plan_type TEXT, price_100gb TEXT, price_500gb TEXT,
    price_1m TEXT, price_5m TEXT, price_500m_benefit TEXT, 
    price_500m_salary TEXT, notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔑 2. 환경변수 (Vercel에 추가)
```
NEXT_PUBLIC_SUPABASE_URL=https://bhtqjipygkawoyieidgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJodHFqaXB5Z2thd295aWVpZGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODg5NjgsImV4cCI6MjA3MDA2NDk2OH0.hu2EAj9RCq436QBtfbEVF4aGOau4WWomLMDKahN4iAA
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 🚀 3. 배포
```bash
git init && git add . && git commit -m "init" && git push
```
Vercel에서 GitHub 연결 → 환경변수 3개 추가 → 완료!

### 🎯 기능
- 견적 이미지 업로드 → AI 자동 분석
- 날짜별 조회 및 관리
- 다크모드 + 파란색 UI
