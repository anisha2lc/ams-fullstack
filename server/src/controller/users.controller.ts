import { Request, Response } from "express";
import UsersService from "../services/users.services";

class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public listUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await this.usersService.listUsers(page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message ?? "Failed to list users",
      });
    }
  };

  public getUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.getUserById(String(req.params.id));
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
        message: error.message ?? "Failed to fetch user",
      });
    }
  };

  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.usersService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      const statusCode = error.message === "Email already in use" ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message ?? "Failed to create user",
      });
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const updated = await this.usersService.updateUser(
        String(req.params.id),
        req.body,
      );
      if (!updated) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message ?? "Failed to update user",
      });
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const deleted = await this.usersService.deleteUser(String(req.params.id));
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message ?? "Failed to delete user",
      });
    }
  };
}

export default UsersController;
