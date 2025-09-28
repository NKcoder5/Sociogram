import jwt from "jsonwebtoken";
const isAuthenticated=async(req,res,next)=>{
    try {
        console.log('🔐 Authentication check...');
        console.log('Headers:', req.headers.authorization ? 'Bearer token present' : 'No Bearer token');
        console.log('Cookies:', req.cookies.token ? 'Cookie token present' : 'No cookie token');
        
        // Check for token in cookies first, then in Authorization header
        let token = req.cookies.token;
        
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        
        if(!token){
            console.log('❌ No authentication token found');
            return res.status(401).json({
                message:'User not authenticated - no token provided',
                success:false
            });
        }
        
        console.log('🔑 Token found, verifying...');
        const decode=await jwt.verify(token,process.env.SECRET_KEY);
        if(!decode){
            console.log('❌ Token verification failed');
            return res.status(401).json({
                message:'Invalid token',
                success:false
            });
        }
        
        console.log('✅ Authentication successful, user ID:', decode.userId);
        req.id=decode.userId;
        next();
    } catch (error) {
        console.error('❌ Authentication error:', error.message);
        return res.status(401).json({
            message:'Authentication failed: ' + error.message,
            success:false
        });
    }
}
export default isAuthenticated;