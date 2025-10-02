import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import prisma from "../utils/prisma.js";
import { createNotification } from "./notification.controller.js";

// Test endpoint to debug post creation issues
export const testPostCreation = async (req, res) => {
    try {
        console.log('🧪 Testing post creation endpoint...');
        console.log('Headers:', req.headers);
        console.log('Body:', req.body);
        console.log('File:', req.file);
        console.log('User ID:', req.id);
        
        return res.status(200).json({
            message: 'Test endpoint working',
            data: {
                hasAuth: !!req.id,
                hasFile: !!req.file,
                hasBody: !!req.body,
                bodyKeys: Object.keys(req.body || {}),
                fileInfo: req.file ? {
                    fieldname: req.file.fieldname,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                } : null
            },
            success: true
        });
    } catch (error) {
        console.error('❌ Test endpoint error:', error);
        return res.status(500).json({
            message: 'Test endpoint failed',
            error: error.message,
            success: false
        });
    }
};
export const addNewPost = async (req, res) => {
    try {
        console.log('📝 Creating new post...');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('Request file:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'Missing');
        console.log('User ID:', req.id);
        
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        // Validate authentication
        if (!authorId) {
            console.log('❌ No user ID found in request');
            return res.status(401).json({
                message: 'User authentication required',
                success: false
            });
        }

        // Validate image
        if (!image) {
            console.log('❌ No image file provided');
            return res.status(400).json({
                message: 'Image is required to create a post',
                success: false
            });
        }

        // Validate image buffer
        if (!image.buffer || image.buffer.length === 0) {
            console.log('❌ Image buffer is empty');
            return res.status(400).json({
                message: 'Invalid image file - empty buffer',
                success: false
            });
        }

        // Set caption (optional)
        const finalCaption = (caption && caption.trim()) ? caption.trim() : '';
        console.log('📝 Final caption:', finalCaption);

        console.log('✅ Validation passed, processing image...');

        // Process image with Sharp
        let optimizedImageBuffer;
        try {
            console.log('🖼️ Processing image with Sharp...');
            optimizedImageBuffer = await sharp(image.buffer)
                .resize({ width: 800, height: 800, fit: 'inside' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();
            console.log('✅ Image optimized successfully, size:', optimizedImageBuffer.length);
        } catch (sharpError) {
            console.error('❌ Sharp processing error:', sharpError);
            return res.status(400).json({
                message: 'Invalid image format. Please upload a valid image file (JPG, PNG, GIF, WebP).',
                success: false
            });
        }

        // Upload to Cloudinary or use fallback
        let imageUrl;
        try {
            console.log('☁️ Uploading to Cloudinary...');
            const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
            const cloudResponse = await cloudinary.uploader.upload(fileUri);
            imageUrl = cloudResponse.secure_url;
            console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        } catch (cloudinaryError) {
            console.log('⚠️ Cloudinary error:', cloudinaryError.message);
            console.log('Using placeholder image');
            imageUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
        }
        
        // Create post in database
        console.log('💾 Creating post in database...');
        const post = await prisma.post.create({
            data: {
                caption: finalCaption,
                image: imageUrl,
                authorId
            },
            include: {
                author: {
                    select: { id: true, username: true, profilePicture: true }
                }
            }
        });

        console.log('✅ Post created successfully:', post.id);

        return res.status(201).json({
            message: 'New post added successfully',
            post,
            success: true
        });

    } catch (error) {
        console.error('❌ Post creation error:', error);
        console.error('Error stack:', error.stack);
        
        // Handle specific errors
        if (error.code === 'P2002') {
            return res.status(400).json({
                message: 'Duplicate post detected',
                success: false
            });
        }
        
        if (error.code === 'P2025') {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        if (error.name === 'PrismaClientKnownRequestError') {
            return res.status(400).json({
                message: 'Database error: ' + error.message,
                success: false
            });
        }

        return res.status(500).json({
            message: 'Internal server error while creating post',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            success: false
        });
    }
};
export const getAllPost=async(req,res)=>{
    try{
        const posts=await prisma.post.findMany({
            orderBy: {createdAt: 'desc'},
            include: {
                author: {
                    select: {id: true, username: true, profilePicture: true}
                },
                comments: {
                    orderBy: {createdAt: 'desc'},
                    include: {
                        author: {
                            select: {id: true, username: true, profilePicture: true}
                        }
                    }
                },
                reactions: {
                    include: {
                        user: {
                            select: {id: true, username: true}
                        }
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: {id: true, username: true}
                        }
                    }
                }
            }
        });

        const postsWithReactions = posts;

        return res.status(200).json({
            posts: postsWithReactions,
            success:true
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
}
export const getUserPost=async(req,res)=>{
    try {
        const authorId=req.id;
        const posts=await prisma.post.findMany({
            where: {authorId},
            orderBy: {createdAt: 'desc'},
            include: {
                author: {
                    select: {id: true, username: true, profilePicture: true}
                },
                comments: {
                    orderBy: {createdAt: 'desc'},
                    include: {
                        author: {
                            select: {id: true, username: true, profilePicture: true}
                        }
                    }
                },
                likes: true,
                reactions: true
            }
        });

        const postsWithReactions = posts;

        return res.status(200).json({
            posts: postsWithReactions,
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

export const getUserPostById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }
        
        const posts = await prisma.post.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, username: true, profilePicture: true }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                reactions: true
            }
        });

        return res.status(200).json({
            posts: posts,
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

export const getUserPostByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        
        // First find the user by username
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }
        
        const posts = await prisma.post.findMany({
            where: { authorId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { id: true, username: true, profilePicture: true }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                likes: {
                    include: {
                        user: {
                            select: { id: true, username: true, profilePicture: true }
                        }
                    }
                },
                reactions: true
            }
        });

        return res.status(200).json({
            posts: posts,
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

export const likePost=async (req,res)=>{
    try{
        const likingUser=req.id;
        const postId=req.params.id;
        const post=await prisma.post.findUnique({where: {id: postId}});
        if(!post)
            return res.status(404).json({
                message:'Post not found',
                success:false
            });

        // Check if user already liked the post
        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId: postId,
                    userId: likingUser
                }
            }
        });

        if (existingLike) {
            // Unlike the post
            await prisma.like.delete({
                where: {
                    postId_userId: {
                        postId: postId,
                        userId: likingUser
                    }
                }
            });

            return res.status(200).json({
                message:'Post unliked',
                success:true,
                action: 'unliked'
            });
        } else {
            // Like the post
            await prisma.like.create({
                data: {postId, userId: likingUser}
            });

            // Create notification for post author (if not liking own post)
            if (post.authorId !== likingUser) {
                const liker = await prisma.user.findUnique({
                    where: { id: likingUser },
                    select: { username: true }
                });
                
                await createNotification(
                    likingUser,
                    post.authorId,
                    'like',
                    `${liker.username} liked your post`,
                    postId
                );
            }

            return res.status(200).json({
                message:'Post liked',
                success:true,
                action: 'liked'
            });
        }

    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
}

export const dislikePost=async (req,res)=>{
    try{
        const likingUser=req.id;
        const postId=req.params.id;
        const post=await prisma.post.findUnique({where: {id: postId}});
        if(!post)
            return res.status(404).json({
                message:'Post not found',
                success:false
            });

        //dislike logic started
        await prisma.like.deleteMany({
            where: {postId, userId: likingUser}
        });

        return res.status(200).json({
            message:'Post disliked',
            success:true
        });

    } catch(error){
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};

export const addComment=async(req,res)=>{
    try {
        const postId=req.params.id;
        const commentingUserId=req.id;

        const {text}=req.body;
        const post=await prisma.post.findUnique({where: {id: postId}});
        if(!text)
            return res.status(400).json({
                message:'text is required',
                success:false
            });
        const comment=await prisma.comment.create({
            data: {
                text,
                authorId: commentingUserId,
                postId
            },
            include: {
                author: {
                    select: {id: true, username: true, profilePicture: true}
                }
            }
        });

        // Create notification for post author (if not commenting on own post)
        if (post.authorId !== commentingUserId) {
            await createNotification(
                commentingUserId,
                post.authorId,
                'comment',
                `${comment.author.username} commented on your post`,
                postId
            );
        }

        return res.status(201).json({
            message:'Comment added!',
            comment,
            success:true
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
};

export const getCommentsOfPost=async(req,res)=>{
    try {
        const postId=req.params.id;

        const comments=await prisma.comment.findMany({
            where: {postId},
            orderBy: {createdAt: 'desc'},
            include: {
                author: {
                    select: {id: true, username: true, profilePicture: true}
                }
            }
        });

        return res.status(200).json({
            success:true,
            comments
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
}
export const deletePost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const authorId=req.id;
        
        // Check if post exists and user is the author
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { author: true }
        });
        
        if(!post) {
            return res.status(404).json({
                message:'Post not found',
                success:false
            });
        }
        
        if(post.authorId !== authorId) {
            return res.status(403).json({
                message:'Unauthorized - You can only delete your own posts',
                success:false
            });
        }

        // Delete the post (this will cascade delete comments, likes, etc. if configured)
        await prisma.post.delete({
            where: { id: postId }
        });

        return res.status(200).json({
            success:true,
            message:'Post deleted successfully'
        });

    } catch (error) {
        console.log('Delete post error:', error);
        return res.status(500).json({
            message:'Internal server error',
            success:false
        });
    }
}

export const bookmarkPost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const authorId=req.id;
        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({
                message:'Post not found',
                success:false
            });
        }

            const user=await User.findById(authorId);

            if(user.bookmarks.includes(post._id)){
                await user.updateOne({$pull:{bookmarks:post._id}});
                await user.save();
                return res.status(200).json({
                    type:'unsaved',
                    message:'Post removed from bookmark',
                    success:true
                });
            } else {
                await user.updateOne({$addToSet:{bookmarks:post._id}});
                await user.save();
                return res.status(200).json({
                    type:'saved',
                    message:'Post bookmarked',
                    success:true
                });
            }
    } catch(error) {
        console.log(error);
    }
}