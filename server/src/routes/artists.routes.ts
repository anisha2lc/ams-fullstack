import { Router } from "express";
import ArtistController from "../controller/artist.controller";
import {
  verifyAuthorizationRole,
  verifyJWT,
} from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validateRequest";
import {
  artistRegistrationSchema,
  artistUpdateSchema,
  paginationQuerySchema,
} from "../schemas/artist.schema";
import { validateQuery } from "../middlewares/validateQueryParams";
import upload from "../middlewares/multer.upload";

const router = Router();
const artistController = new ArtistController();

router.use(verifyJWT);

export const ROLE = {
  SUPER_ADMIN: "super_admin",
  ARTIST_MANAGER: "artist_manager",
  ARTIST: "artist",
} as const;
export type UserRole = (typeof ROLE)[keyof typeof ROLE];

router.get(
  "/",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  validateQuery(paginationQuerySchema),
  artistController.getAllArtists,
);

router.get(
  "/export",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.exportCSV,
);

router.post(
  "/import",
  upload.single("file"),
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.importCSV,
);

router.get(
  "/:id",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.getArtist,
);

router.post(
  "/",
  verifyAuthorizationRole(ROLE.ARTIST_MANAGER),
  validateRequest(artistRegistrationSchema),
  artistController.registerArtist,
);

router.put(
  "/:id",
  verifyAuthorizationRole(ROLE.ARTIST_MANAGER),
  validateRequest(artistUpdateSchema),
  artistController.updateArtist,
);

router.delete(
  "/:id",
  verifyAuthorizationRole(ROLE.ARTIST_MANAGER),
  artistController.deleteArtist,
);

router.get(
  "/:artistId/songs",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  validateQuery(paginationQuerySchema),
  artistController.getArtistSongs,
);

router.post(
  "/:artistId/songs",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.createArtistSong,
);

router.put(
  "/:artistId/songs/:songId",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.updateArtistSong,
);

router.delete(
  "/:artistId/songs/:songId",
  verifyAuthorizationRole(ROLE.SUPER_ADMIN, ROLE.ARTIST_MANAGER),
  artistController.deleteArtistSong,
);

export default router;
