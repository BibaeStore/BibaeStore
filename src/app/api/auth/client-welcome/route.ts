import { NextResponse } from 'next/server'
import { sendClientWelcomeEmail, sendAdminNewUserEmail } from '@/lib/resend'

export async function POST(request: Request) {
    try {
        const { email, name, phone } = await request.json()

        if (!email || !name) {
            return NextResponse.json({ error: 'Missing email or name' }, { status: 400 })
        }

        // 1. Send Welcome Email to Client
        await sendClientWelcomeEmail({ email, name })

        // 2. Send Notification to Admin
        await sendAdminNewUserEmail({ email, name, phone: phone || 'Not provided' })

        return NextResponse.json({ message: 'Notifications sent' }, { status: 200 })
    } catch (error) {
        console.error('Email Send Error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}
