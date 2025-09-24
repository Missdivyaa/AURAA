import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, email, name } = body

    const user = await prisma.user.create({
      data: {
        id: id || 'demo-user-123',
        email: email || 'demo@auraa.com',
        name: name || 'Demo User',
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

// GET /api/users - Get user by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo-user-123'

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Create user if doesn't exist
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          email: 'demo@auraa.com',
          name: 'Demo User',
        }
      })
      return NextResponse.json(newUser)
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}









