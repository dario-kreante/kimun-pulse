import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface UsuarioCompleto {
  id: string
  email: string
  nombre: string
  cargo?: string
  telefono?: string
  activo: boolean
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  usuario: UsuarioCompleto | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    usuario: null,
    loading: true,
    error: null
  })

  // Cargar datos del usuario desde la tabla usuarios
  const cargarUsuario = async (userId: string) => {
    console.log('👤 cargarUsuario: Intentando cargar usuario con ID:', userId)
    
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('👤 cargarUsuario: Error al cargar usuario:', error)
        // Si el usuario no existe en la tabla, no es un error crítico
        if (error.code === 'PGRST116') {
          console.log('👤 cargarUsuario: Usuario no encontrado en tabla usuarios, continuando sin datos de usuario...')
          return null
        }
        return null
      }

      console.log('👤 cargarUsuario: Usuario cargado exitosamente:', data)
      return data as UsuarioCompleto
    } catch (error) {
      console.error('👤 cargarUsuario: Error al cargar usuario:', error)
      return null
    }
  }

  // Crear usuario en la tabla usuarios después del registro
  const crearUsuarioEnTabla = async (user: User, nombre: string, cargo?: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          id: user.id,
          email: user.email!,
          nombre,
          cargo: cargo || 'Operador',
          activo: true
        })
        .select()
        .single()

      if (error) {
        console.error('Error al crear usuario en tabla:', error)
        return null
      }

      return data as UsuarioCompleto
    } catch (error) {
      console.error('Error al crear usuario en tabla:', error)
      return null
    }
  }

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      console.log('🔐 useAuth: Iniciando login para:', email)
      console.log('🔐 useAuth: Dominio actual:', window.location.hostname)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('🔐 useAuth: Error en login:', error)
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      console.log('🔐 useAuth: Login exitoso, procesando usuario...')
      
      // Cargar datos del usuario desde la tabla
      const usuario = await cargarUsuario(data.user.id)
      
      setAuthState({
        user: data.user,
        session: data.session,
        usuario,
        loading: false,
        error: null
      })

      console.log('🔐 useAuth: Estado de autenticación actualizado')
      return { success: true, user: data.user, usuario }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('🔐 useAuth: Error crítico en login:', error)
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }

  // Función de registro
  const register = async (email: string, password: string, nombre: string, cargo?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            cargo: cargo || 'Operador'
          }
        }
      })

      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Crear usuario en la tabla usuarios
        const usuario = await crearUsuarioEnTabla(data.user, nombre, cargo)
        
        setAuthState({
          user: data.user,
          session: data.session,
          usuario,
          loading: false,
          error: null
        })

        return { success: true, user: data.user, usuario }
      }

      return { success: false, error: 'No se pudo crear el usuario' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }

  // Función de logout
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      setAuthState({
        user: null,
        session: null,
        usuario: null,
        loading: false,
        error: null
      })

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setAuthState(prev => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }

  // Función para actualizar perfil
  const actualizarPerfil = async (updates: Partial<UsuarioCompleto>) => {
    if (!authState.user) return { success: false, error: 'No hay usuario autenticado' }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', authState.user.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      setAuthState(prev => ({
        ...prev,
        usuario: data as UsuarioCompleto
      }))

      return { success: true, usuario: data as UsuarioCompleto }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      return { success: false, error: errorMessage }
    }
  }

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    console.log('🔐 useAuth: Iniciando verificación de sesión en:', window.location.hostname)
    
    // Timeout de seguridad para evitar que se quede colgando
    const timeoutId = setTimeout(() => {
      console.warn('🔐 useAuth: Timeout al verificar sesión, forzando estado no autenticado')
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Timeout al verificar sesión. Intenta recargar la página.' 
      }))
    }, 10000) // 10 segundos
    
    // Obtener sesión inicial
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId)
        console.log('🔐 useAuth: Sesión obtenida:', { session: !!session, error })
        
        if (error) {
          console.error('🔐 useAuth: Error al obtener sesión:', error)
          setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
          return
        }
        
        if (session?.user) {
          console.log('🔐 useAuth: Usuario encontrado, procesando autenticación...')
          // Por ahora simplificamos - no cargamos datos de la tabla usuarios
          // Esto permite que la aplicación funcione sin depender de datos específicos del usuario
          setAuthState({
            user: session.user,
            session,
            usuario: {
              id: session.user.id,
              email: session.user.email || '',
              nombre: session.user.user_metadata?.nombre || session.user.email?.split('@')[0] || 'Usuario',
              cargo: 'Operador',
              activo: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            loading: false,
            error: null
          })
        } else {
          console.log('🔐 useAuth: No hay sesión activa')
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      })
      .catch(error => {
        clearTimeout(timeoutId)
        console.error('🔐 useAuth: Error al verificar sesión:', error)
        setAuthState(prev => ({ ...prev, loading: false, error: error.message }))
      })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 useAuth: Cambio de estado:', event)
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔐 useAuth: Usuario autenticado exitosamente')
          setAuthState({
            user: session.user,
            session,
            usuario: {
              id: session.user.id,
              email: session.user.email || '',
              nombre: session.user.user_metadata?.nombre || session.user.email?.split('@')[0] || 'Usuario',
              cargo: 'Operador',
              activo: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            loading: false,
            error: null
          })
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 useAuth: Usuario cerró sesión')
          setAuthState({
            user: null,
            session: null,
            usuario: null,
            loading: false,
            error: null
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return {
    ...authState,
    login,
    register,
    logout,
    actualizarPerfil,
    isAuthenticated: !!authState.user,
    isLoading: authState.loading
  }
} 