import { Router } from "express";
import UsersController from "../controller/users.controller";
import {
  verifyAuthorizationRole,
  verifyJWT,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validateRequest";
import { validateQuery } from "../middlewares/validateQueryParams";
import {
  userCreateSchema,
  userUpdateSchema,
  usersPaginationQuerySchema,
} from "../schemas/user.schema";

const router = Router();
const usersController = new UsersController();

router.use(verifyJWT);
router.use(verifyAuthorizationRole("super_admin", "artist_manager"));

router.get("/", validateQuery(usersPaginationQuerySchema), usersController.listUsers);
router.get("/:id", usersController.getUser);
router.post("/", validateRequest(userCreateSchema), usersController.createUser);
router.put("/:id", validateRequest(userUpdateSchema), usersController.updateUser);
router.delete("/:id", usersController.deleteUser);

export default router;
