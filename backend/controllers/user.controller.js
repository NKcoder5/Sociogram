import prisma from "../utils/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { createNotification } from "./notification.controller.js";
import { getFirebaseAuth } from "../config/firebase-admin.js";
export const register=async(req,res)=>{
    try{
        const {
            username,
            email,
            password,
            collegeId,
            departmentId,
            classId,
            year,
            departmentName,
            className
        }=req.body;
        if(!username||!email||!password){
            return res.status(401).json({
                message:"Something is missing, please check!",
                success:false,
            });
        }
        const user=await prisma.user.findUnique({where: {email}});
        if(user){
            return res.status(401).json({
                message:"Try different email",
                success:false,
            });
        };
        const hashedPassword=await bcrypt.hash(password, 10);
        const profileMeta = {};
        if(!departmentId && departmentName){
            profileMeta.requestedDepartment = departmentName;
        }
        if(!classId && className){
            profileMeta.requestedClass = className;
        }
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password:hashedPassword,
                collegeId,
                departmentId: departmentId || undefined,
                classId: classId || undefined,
                year,
                role: "STUDENT",
                profileStatus: "PENDING",
                profileMeta: Object.keys(profileMeta).length ? profileMeta : undefined
            }
        });

        // Generate token for the new user
        const token = await jwt.sign({userId: newUser.id}, process.env.SECRET_KEY, {expiresIn: '1d'});

        // Prepare user data (exclude password)
        const userData = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            profilePicture: newUser.profilePicture,
            bio: newUser.bio,
            followers: [],
            following: [],
            posts: [],
            role: newUser.role,
            profileStatus: newUser.profileStatus,
            departmentId: newUser.departmentId,
            classId: newUser.classId,
            year: newUser.year
        };

        return res.cookie('token', token, {httpOnly: true, sameSite: 'strict', maxAge: 1*24*60*60*1000}).status(201).json({
                message: `Welcome to Sociogram, ${newUser.username}!`,
                success: true,
                user: userData,
                token // Include token in response for frontend
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
}
export const login=async (req, res)=>{
    try{
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(401).json({
                message:"Something is missing, please check!",
                success:false,
            });
        }
        let user=await prisma.user.findUnique({where: {email}, include: {posts: true, followers: true, following: true}});

        if(!user){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false,
            });
        }

        const isPasswordMatch=await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success:false,
            });
        };

        const token= await jwt.sign({userId:user.id},process.env.SECRET_KEY,{expiresIn:'1d'});

        //populate each post if in the posts array
        const populatedPosts = user.posts || [];

        user={
            id:user.id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:populatedPosts,
            role:user.role,
            profileStatus:user.profileStatus,
            departmentId:user.departmentId,
            classId:user.classId,
            year:user.year,
            collegeId:user.collegeId
        }

        return res.cookie('token',token,{httpOnly:true, sameSite:'strict', maxAge:1*24*60*60*1000}).json({
            message:`Welcome back ${user.username}`,
            success:true,
            user,
            token // Include token in response for frontend
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};
export const logout=async(__,res)=>{
    try {
        return res.cookie("token","",{maxAge:0}).json({
            message:"Logged out successfully!",
            success:true
        })
    } catch (error) {
        console.log(error);
    }
};
export const getProfile=async(req,res)=>{
    try {
        const userId=req.params.id || req.id;
        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required',
                success: false
            });
        }
        
        let user=await prisma.user.findUnique({
            where: {id: userId},
            include: {
                posts: {orderBy: {createdAt: 'desc'}},
                followers: {select: {follower: {select: {id: true, username: true, profilePicture: true}}}},
                following: {select: {following: {select: {id: true, username: true, profilePicture: true}}}},
                department: {select: {id: true, name: true, code: true}},
                classSection: {select: {id: true, name: true, code: true, section: true}}
            }
        });
        
        if(!user){
            return res.status(404).json({
                message:'User not found',
                success:false,
            });
        }

        // Remove password from response
        const {password, ...userWithoutPassword} = user;

        return res.status(200).json({
            user: userWithoutPassword,
            success:true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};

export const getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json({
                message: 'Username is required',
                success: false
            });
        }
        
        let user = await prisma.user.findUnique({
            where: { username: username },
            include: {
                posts: { orderBy: { createdAt: 'desc' } },
                followers: { select: { follower: { select: { id: true, username: true, profilePicture: true } } } },
                following: { select: { following: { select: { id: true, username: true, profilePicture: true } } } }
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

export const editProfile=async(req,res)=>{
    try {
        const userId=req.id;
        const {bio, gender, collegeId, departmentId, classId, year}=req.body;
        const profilePicture=req.file;
        let cloudResponse;
        if(profilePicture){
            const fileUri=getDataUri(profilePicture);
            cloudResponse=await cloudinary.uploader.upload(fileUri)
        }

        const user=await prisma.user.findUnique({where: {id: userId}});
        if(!user){
            return res.status(404).json({
                message:'User not found!',
                success:false,
            });
        }
        const updateData = {};
        if(bio) updateData.bio=bio;
        if(profilePicture) updateData.profilePicture=cloudResponse.secure_url;
        if(gender) updateData.gender=gender;
        if(collegeId) updateData.collegeId=collegeId;
        if(year) updateData.year=year;
        if(departmentId && departmentId !== user.departmentId){
            updateData.departmentId=departmentId;
            updateData.profileStatus="PENDING";
        }
        if(classId && classId !== user.classId){
            updateData.classId=classId;
            updateData.profileStatus="PENDING";
        }
        
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                bio: true,
                year: true,
                collegeId: true,
                departmentId: true,
                classId: true,
                profileStatus: true
            }
        });
        return res.status(200).json({
            message:'Profile updated!',
            success:true,
            user: updatedUser
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};

// Get mutual connections (users who follow each other)
export const getMutualConnections = async (req, res) => {
    try {
        const userId = req.id;
        
        console.log('🤝 Getting mutual connections for user:', userId);
        
        // Get users that the current user follows
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        bio: true
                    }
                }
            }
        });
        
        // Filter for mutual connections (users who also follow back)
        const mutualConnections = [];
        
        for (const follow of following) {
            const followsBack = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: follow.followingId,
                        followingId: userId
                    }
                }
            });
            
            if (followsBack) {
                mutualConnections.push(follow.following);
            }
        }
        
        console.log('🤝 Found mutual connections:', mutualConnections.length);
        
        return res.status(200).json({
            success: true,
            mutualConnections
        });
        
    } catch (error) {
        console.error('❌ Error getting mutual connections:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                profilePicture: true
            }
        });
        if(!suggestedUsers){
            return res.status(400).json({
                message:'Currently do not have any users...',
            });
        };
        return res.status(200).json({
                success:true,
                users:suggestedUsers
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};
export const followOrUnfollow = async(req,res)=>{
    try {
        const followerofmine=req.id;
        const whomifollow=req.params.id;
        
        console.log('Follow request:', { followerofmine, whomifollow });
        
        if(!followerofmine || !whomifollow){
            return res.status(400).json({
                message:'Missing user IDs',
                success:false
            });
        }
        
        if(followerofmine === whomifollow){
            return res.status(400).json({
                message:'You cannot follow/unfollow yourself',
                success:false
            });
        }
        const [user, targetUser] = await Promise.all([
            prisma.user.findUnique({where: {id: followerofmine}}),
            prisma.user.findUnique({where: {id: whomifollow}})
        ]);
        if(!user||!targetUser){
            return res.status(400).json({
                message:'User not found',
                success:false,
            });
        }
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerofmine,
                    followingId: whomifollow
                }
            }
        });

        if(existingFollow){
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: followerofmine,
                        followingId: whomifollow
                    }
                }
            });
            
            // Get updated counts
            const [followerCount, followingCount] = await Promise.all([
                prisma.follow.count({ where: { followingId: whomifollow } }),
                prisma.follow.count({ where: { followerId: followerofmine } })
            ]);
            
            return res.status(200).json({
                message:'Unfollowed successfully',
                success:true,
                action: 'unfollowed',
                targetUserFollowerCount: followerCount,
                currentUserFollowingCount: followingCount
            });
        }else{
            await prisma.follow.create({
                data: {
                    followerId: followerofmine,
                    followingId: whomifollow
                }
            });
            
            // Get updated counts
            const [followerCount, followingCount] = await Promise.all([
                prisma.follow.count({ where: { followingId: whomifollow } }),
                prisma.follow.count({ where: { followerId: followerofmine } })
            ]);
            
            // Check if this creates a mutual follow
            const mutualFollow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: whomifollow,
                        followingId: followerofmine
                    }
                }
            });
            
            // Create notification for the followed user
            await createNotification(
                followerofmine,
                whomifollow,
                'follow',
                `${user.username} started following you`
            );
            
            return res.status(200).json({
                message:'Followed successfully',
                success:true,
                action: 'followed',
                targetUserFollowerCount: followerCount,
                currentUserFollowingCount: followingCount,
                isMutualFollow: !!mutualFollow
            });
        }
    } catch (error) {
        console.log('Follow/Unfollow error:', error);
        return res.status(500).json({
            message:'Internal server error',
            success:false,
            error: error.message
        });
    }
}

export const getFollowers = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        bio: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            followers: followers.map(follow => follow.follower)
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const getFollowing = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        bio: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            following: following.map(follow => follow.following)
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

export const uploadProfilePicture = async (req, res) => {
    try {
        console.log('Upload profile picture request received');
        console.log('User ID:', req.id);
        console.log('File info:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');

        const userId = req.id;
        const file = req.file;

        if (!file) {
            console.log('No file in request');
            return res.status(400).json({
                message: 'No file uploaded',
                success: false
            });
        }

        // Upload to Cloudinary
        let profilePictureUrl;
        try {
            const fileUri = getDataUri(file);
            console.log('File URI generated:', fileUri ? 'Success' : 'Failed');
            
            const cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: 'profile_pictures',
                transformation: [
                    { width: 400, height: 400, crop: 'fill' },
                    { quality: 'auto' }
                ]
            });
            profilePictureUrl = cloudResponse.secure_url;
            console.log('Cloudinary upload successful:', profilePictureUrl);
        } catch (cloudinaryError) {
            console.log('Cloudinary error:', cloudinaryError);
            return res.status(500).json({
                message: 'Failed to upload image',
                success: false
            });
        }

        // Update user profile picture
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: profilePictureUrl },
            select: {
                id: true,
                username: true,
                email: true,
                profilePicture: true,
                bio: true
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.log('Upload profile picture error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};

// Firebase Authentication Handler
export const firebaseAuth = async (req, res) => {
    try {
        console.log('🔥 Firebase auth request received');
        const { idToken, user: firebaseUser } = req.body;
        
        if (!idToken || !firebaseUser) {
            console.error('❌ Missing required data:', { hasToken: !!idToken, hasUser: !!firebaseUser });
            return res.status(400).json({
                message: "Firebase ID token and user data are required",
                success: false
            });
        }

        console.log('📧 Firebase user email:', firebaseUser.email);

        // Verify Firebase ID token
        try {
            const auth = getFirebaseAuth();
            const decodedToken = await auth.verifyIdToken(idToken);
            console.log('✅ Firebase token verified for user:', decodedToken.uid);
        } catch (error) {
            console.error('❌ Firebase token verification error:', error);
            return res.status(401).json({
                message: "Invalid Firebase token",
                success: false
            });
        }

        // Check if user exists in database
        let user = await prisma.user.findUnique({
            where: { email: firebaseUser.email },
            include: { posts: true, followers: true, following: true }
        });

        // If user doesn't exist, create new user
        if (!user) {
            // Generate username from display name or email
            let username = firebaseUser.displayName || firebaseUser.email.split('@')[0];
            
            // Ensure username is unique
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser) {
                username = `${username}_${Date.now()}`;
            }

            user = await prisma.user.create({
                data: {
                    username,
                    email: firebaseUser.email,
                    password: '', // Empty password for Firebase users
                    profilePicture: firebaseUser.photoURL || '',
                    bio: '',
                    firebaseUid: firebaseUser.uid,
                    provider: firebaseUser.provider || 'google'
                },
                include: { posts: true, followers: true, following: true }
            });
        } else {
            // Update Firebase UID if not set
            if (!user.firebaseUid) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { firebaseUid: firebaseUser.uid },
                    include: { posts: true, followers: true, following: true }
                });
            }
        }

        // Generate JWT token for your backend
        const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Format user data (same as login)
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts || []
        };

        return res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 1 * 24 * 60 * 60 * 1000
        }).json({
            message: `Welcome ${user.username}`,
            success: true,
            user: userData,
            token
        });

    } catch (error) {
        console.error('Firebase auth error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            success: false
        });
    }
};