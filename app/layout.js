```jsx
import './globals.css'

export const metadata = {
  title: '전화번호부',
  description: '나만의 전화번호부',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
```
