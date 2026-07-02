import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/login', '/cadastro']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase env missing')
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookies) {
          cookies.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()

  const user = data.user

  const pathname = request.nextUrl.pathname

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  )


  if (!user && !isPublicRoute) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }


  if (user && isPublicRoute) {
    return NextResponse.redirect(
      new URL('/', request.url)
    )
  }


  return response
}


export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|css|js|json|txt)).*)',
  ],
}