// app/(auth)/layout.tsx
import CommonLayout from '@/components/CommonLayout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CommonLayout>{children}</CommonLayout>
}
