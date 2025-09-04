import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options'; // adjust this import path as needed
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/userModel'; // adjust based on where your User model is

export async function POST(request: NextRequest) {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session?.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 });
    }
    const isAcceptingMessages = await request.json();
    const userId = session.user._id; 
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            { userId },
            { isAcceptingMessages },
            { new: true }
        );
        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            message: `Updated isAcceptingMessages to ${isAcceptingMessages}`,
            data: {
                updatedUser: updatedUser
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating isAcceptingMessages:', error);
        return NextResponse.json({
            success: false,
            message: "Server error while updating user.",
        }, { status: 500 });
    }
}

export async function GET() {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session || !session?.user) {
        return NextResponse.json({
            success: false,
            message: "Unauthorized",
        }, { status: 401 });
    }

    const userId = session.user._id;
    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            isAcceptingMessages: user.isAcceptingMessages 
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching isAcceptingMessages:', error);
        return NextResponse.json({
            success: false,
            message: "Server error while retrieving user data.",
        }, { status: 500 });
    }
}