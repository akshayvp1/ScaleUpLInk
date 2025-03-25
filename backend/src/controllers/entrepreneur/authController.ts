import { Request, Response } from "express";
import AuthService from "../../services/entrepreneur/authService";
import { IAuthController } from "../../controllers/entrepreneur/interface/IAuthController";
// import { googleSignInResult } from "../../services/entrepreneur/interface/IAuthService";
import { inject, injectable } from "tsyringe";


@injectable()
class AuthController implements IAuthController {
  private authService: AuthService;

  constructor(@inject("AuthService") authService: AuthService) {
    this.authService = authService;
  }

  // Register User (Only Sends OTP)
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.body) {
        throw new Error("body is empty")
      }

      console.log(req.body, "name")

      const response = await this.authService.register(req.body);
      console.log(response,'daaaa')
      res.status(200).json({response});
    } catch (error) {
      this.handleError(res, error);
    }
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      console.log("resend otp email", email);
      const result = await this.authService.resendOtp(email);
      console.log(result,"result")
      res.status(200).json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  
  // Verify OTP & Save User
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      
      const { email, otp } = req.body;
      console.log(email,otp,"fffsdss")
      const user = await this.authService.verifyOTP(email, otp);
      console.log(user,"rrrrrr")
      res.status(200).json(user);
    } catch (error) {
      this.handleError(res, error);
    }
  };


  signIn = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      console.log(email, password, "daaaai");
      if (!email || !password) {
        res.status(400).json({ 
          success: false, 
          message: "Email and password are required." 
        });
        return; 
      }

      const signInResult = await this.authService.signIn(email, password);
      console.log("ddddddsssss", signInResult);

      if (!signInResult.isMatch) {
         res.status(400).json({ 
          success: false, 
          message: signInResult.message || "Incorrect email or password." 
        });
        return
      }

      const { accessToken, refreshToken, user } = signInResult;

      // Store refreshToken securely in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: "strict", 
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

       res.status(200).json({ 
        success: true, 
        data: {
          accessToken,
          user,
        },
        message: "Verification completed.",
      });

    } catch (error) {
      this.handleError(res, error);
    }
};

googleSignIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ message: "Google credential is required." });
      return;
    }

    const result = await this.authService.googleSignIn(credential);

    if (!result.partialUser) {
      const { user, accessToken, refreshToken, partialUser } = result;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({ user, accessToken, partialUser });
      return;
    }

    const { user: newUser, partialUser } = result;

    res.status(200).json({ user: newUser, partialUser });
  } catch (error) {
    console.error("Google Sign-In Controller Error:", error);
    res.status(500).json({ message: "Failed to authenticate via Google." });
  }
};


completeProfile=async(req:Request,res:Response):Promise<void>=>{
  try{
     const userData = req.body
     console.log(userData,"userrrrrrdata")
     if (!userData) {
      res.status(400).json({ message: "Google credential is required." });
      return;
    }
    const result = await this.authService.completeProfile(userData)
    console.log(result,"MMMMMM")
   
    const {user,accessToken,refreshToken}=result
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      user,
      accessToken,
    });
    

  }catch(error){
    console.log(error)
  }
}
setEntrepreneurRole=async(req:Request,res:Response):Promise<void>=>{
  try{
     const userData = req.body
     console.log(userData,"userrrrrrdata")
     if (!userData) {
      res.status(400).json({ message: "Google credential is required." });
      return;
    }
    const result = await this.authService.setEntrepreneurRole(userData)
    console.log(result,"MMMMMM")
   
    const {user,accessToken,refreshToken}=result
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      user,
      accessToken,
    });
    

  }catch(error){
    console.log(error)
  }
}
addInterests = async (req: Request, res: Response): Promise<void> => {
  const { data} = req.body;
  console.log(data, "VVVVV");

  try {
    
    
    // const result = await this.authService.addInterests(data);
    res.status(200).json({ message: "Interests added successfully", });
  } catch (error) {
    this.handleError(res, error);
  }
};


  // Common Error Handler
  private handleError(res: Response, error: unknown): void {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
}

export default AuthController;
