import jwt from "jsonwebtoken"
const authMiddleware = (req,res,next)=>{
    try{
   // Check whether cookie is reaching the backend
console.log("Cookies received:", req.cookies);
console.log("Token received:", Boolean(req.cookies?.token));

   
  const token = req.cookies?.token;
  if(!token){
    return res.status(401).json({
        success:false,
        message:"Access denied. Please Login First"
    });
  }
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
  );
  req.user = decoded
  next()
    }catch (error) {

        // Display exact error in terminal
        console.error("========== JWT COOKIE ERROR ==========");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        console.error("======================================");

        // Handle expired token
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "JWT token has expired"
            });
        }

        // Handle invalid token
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
}
export default authMiddleware