export default function AlertBanner({ message, type = 'info' }) {
  const colorMap = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <div className={`w-full p-4 text-center ${colorMap[type]}`}>
      {message}
    </div>
  )
}
