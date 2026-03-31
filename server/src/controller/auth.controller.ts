import { Request, Response } from "express";
import AuthService from "../services/auth.services";
import { AuthRequest } from "../middlewares/auth.middleware";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.register(req.body);
      res.status(201).json({
        success: true,
        message: "Registration successful",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message ?? "Registration failed",
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message ?? "Invalid credentials",
      });
    }
  };

  public refresh = async (_req: Request, res: Response): Promise<void> => {
    res.status(501).json({
      success: false,
      message: "Refresh token flow not implemented yet",
    });
  };

  public getCurrentUser = async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const user = await this.authService.getCurrentUser(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message ?? "Failed to fetch current user",
      });
    }
  };
}

export default AuthController;
