import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        
        if (existingUser) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword
            }
        });
        
        return res.status(201).json({
            message: "Account created successfully!",
            success: true,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        
        let user = await prisma.user.findUnique({
            where: { email },
            include: {
                posts: {
                    include: {
                        author: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                followers: true,
                following: true
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }

        const token = await jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        const userResponse = {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        };

        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const logout = async (__, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully!",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id || req.id;
        let user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: {
                    orderBy: { createdAt: 'desc' }
                },
                followers: {
                    select: { follower: { select: { id: true, username: true, profilePicture: true } } }
                },
                following: {
                    select: { following: { select: { id: true, username: true, profilePicture: true } } }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return res.status(200).json({
            user: userWithoutPassword,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;
        
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found!',
                success: false,
            });
        }

        const updateData = {};
        if (bio) updateData.bio = bio;
        if (profilePicture) updateData.profilePicture = cloudResponse.secure_url;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                bio: true
            }
        });

        return res.status(200).json({
            message: 'Profile updated!',
            success: true,
            user: updatedUser
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await prisma.user.findMany({
            where: {
                id: { not: req.id }
            },
            select: {
                id: true,
                username: true,
                profilePicture: true,
                bio: true
            },
            take: 10
        });

        if (!suggestedUsers || suggestedUsers.length === 0) {
            return res.status(400).json({
                message: 'Currently do not have any users...',
            });
        }

        return res.status(200).json({
            success: true,
            users: suggestedUsers
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const followOrUnfollow = async (req, res) => {
    try {
        const followerId = req.id;
        const followingId = req.params.id;
        
        if (followerId === followingId) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const [user, targetUser] = await Promise.all([
            prisma.user.findUnique({ where: { id: followerId } }),
            prisma.user.findUnique({ where: { id: followingId } })
        ]);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false,
            });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: followingId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: followerId,
                        followingId: followingId
                    }
                }
            });
            
            return res.status(200).json({
                message: 'Unfollowed successfully',
                success: true
            });
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: followerId,
                    followingId: followingId
                }
            });
            
            return res.status(200).json({
                message: 'Followed successfully',
                success: true
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};