'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from './../utils/supabaseClient'
import { Eye, EyeOff } from 'lucide-react'

export default function Account() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [description, setDescription] = useState('')
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url, email, pin, description, role')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error cargando perfil:', error.message)
      } else {
        setName(data?.name || '')
        setAvatarUrl(data?.avatar_url || '')
        setEmail(data?.email || '')
        setPin(data?.pin || '')
        setDescription(data?.description || '')
        setRole(data?.role || '')
      }

      setLoading(false)
    }

    getProfile()
  }, [router])

  const updateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    const updates = {
      user_id: userId,
      name,
      avatar_url: avatarUrl,
      pin,
      description,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      alert('Error al actualizar perfil: ' + error.message)
    } else {
      alert('Perfil actualizado correctamente.')
    }

    setLoading(false)
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file || !userId) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      alert('Error al subir imagen: ' + uploadError.message)
      return
    }

    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath)

    setAvatarUrl(data.publicUrl)
  }

  if (loading) return <p className="p-4 text-white bg-gray-900">Cargando...</p>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Configuración de Perfil</h2>

        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white focus:outline-none focus:ring focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-white pr-10 focus:outline-none focus:ring focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

<div>
  <label className="block font-medium mb-1">Descripción</label>
  <textarea
    value={description}
    disabled
    placeholder="Esto solo se puede cambiar yéndote a tu perfil"
    className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-gray-400 cursor-not-allowed resize-none"
  />
</div>


          <div>
            <label className="block font-medium mb-1">Rol</label>
            <input
              type="text"
              value={role}
              disabled
              className="w-full bg-gray-700 border border-gray-600 px-3 py-2 rounded text-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Foto de perfil</label>
            {avatarUrl && (
              <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mb-2 border border-gray-600" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full transition-colors duration-200"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}
