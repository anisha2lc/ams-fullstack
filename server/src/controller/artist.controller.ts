import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import {
  IRegisterArtist,
  artistRegistrationSchema,
  songSchema,
  songUpdateSchema,
} from "../schemas/artist.schema";
import ArtistService from "../services/artist.services";

const artistService = new ArtistService();

class ArtistController {
  public async registerArtist(req: Request, res: Response) {
    try {
      const artistData: IRegisterArtist = req.body;

      const user = await artistService.registerArtist(artistData);

      res.status(201).json({
        success: true,
        message: "Artist Registration successful.",
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Artist registration failed",
      });
    }
  }

  public async getAllArtists(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await artistService.getAllArtists(page, limit);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve artists",
      });
    }
  }

  public async getArtist(req: Request, res: Response) {
    try {
      const artistId = String(req.params.id);
      const artist = await artistService.getArtistById(artistId);
      if (!artist)
        return res
          .status(404)
          .json({ success: false, message: "Artist not found" });

      res.status(200).json({ success: true, data: artist });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve artist",
        error: error.message,
      });
    }
  }

  public async updateArtist(req: Request, res: Response) {
    try {
      const artistId = String(req.params.id);
      const artist = await artistService.updateArtist(artistId, req.body);
      if (!artist)
        return res
          .status(404)
          .json({ success: false, message: "Artist not found or no updates" });

      res.status(200).json({
        success: true,
        message: "Artist updated successfully",
        data: artist,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update artist",
        error: error.message,
      });
    }
  }

  public async deleteArtist(req: Request, res: Response) {
    try {
      const artistId = String(req.params.id);
      const success = await artistService.deleteArtist(artistId);
      if (!success)
        return res
          .status(404)
          .json({ success: false, message: "Artist not found" });

      res
        .status(200)
        .json({ success: true, message: "Artist deleted successfully" });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete artist",
        error: error.message,
      });
    }
  }

  public async exportCSV(req: Request, res: Response) {
    try {
      const artists = await artistService.exportArtists();
      const header =
        "id,user_id,name,dob,gender,address,first_release_year,no_of_albums_released,created_at,updated_at";
      const rows = artists.map((artist) =>
        [
          artist.id,
          artist.user_id ?? "",
          artist.name,
          artist.dob,
          artist.gender,
          artist.address,
          artist.first_release_year,
          artist.no_of_albums_released,
          artist.created_at,
          artist.updated_at,
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      );
      const csv = [header, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=artists.csv");
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to export artists",
        error: error.message,
      });
    }
  }

  public async importCSV(req: Request, res: Response) {
    try {
      if (!req.file?.buffer) {
        return res
          .status(400)
          .json({ success: false, message: "CSV file is required" });
      }

      const records = parse(req.file.buffer.toString("utf8"), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as Record<string, string>[];

      const validRows: IRegisterArtist[] = [];
      const errors: Array<{ row: number; message: string }> = [];

      records.forEach((record, index) => {
        const parsed = {
          user_id: record.user_id ? Number(record.user_id) : undefined,
          name: record.name,
          dob: record.dob,
          gender: record.gender,
          address: record.address,
          first_release_year: Number(record.first_release_year),
          no_of_albums_released: Number(record.no_of_albums_released),
        };

        const validation = artistRegistrationSchema.safeParse(parsed);
        if (!validation.success) {
          errors.push({
            row: index + 2,
            message: validation.error.issues[0]?.message ?? "Invalid row",
          });
          return;
        }
        validRows.push(validation.data);
      });

      const result = await artistService.importArtists(validRows);

      res.status(200).json({
        success: true,
        message: "CSV import completed",
        data: {
          totalRows: records.length,
          validRows: validRows.length,
          inserted: result.inserted,
          failed: result.failed,
          errors,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to import artists CSV",
        error: error.message,
      });
    }
  }

  public async getArtistSongs(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await artistService.getSongsByArtistId(
        String(req.params.artistId),
        page,
        limit,
      );

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve songs",
        error: error.message,
      });
    }
  }

  public async createArtistSong(req: Request, res: Response) {
    try {
      const validation = songSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
      }

      const song = await artistService.createSongForArtist(
        String(req.params.artistId),
        validation.data,
      );

      if (!song) {
        return res
          .status(404)
          .json({ success: false, message: "Artist not found" });
      }

      res.status(201).json({
        success: true,
        message: "Song created successfully",
        data: song,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to create song",
        error: error.message,
      });
    }
  }

  public async updateArtistSong(req: Request, res: Response) {
    try {
      const validation = songUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
      }

      const song = await artistService.updateSongForArtist(
        String(req.params.artistId),
        String(req.params.songId),
        validation.data,
      );
      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found for this artist",
        });
      }

      res.status(200).json({
        success: true,
        message: "Song updated successfully",
        data: song,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update song",
        error: error.message,
      });
    }
  }

  public async deleteArtistSong(req: Request, res: Response) {
    try {
      const deleted = await artistService.deleteSongForArtist(
        String(req.params.artistId),
        String(req.params.songId),
      );
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Song not found for this artist",
        });
      }

      res
        .status(200)
        .json({ success: true, message: "Song deleted successfully" });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete song",
        error: error.message,
      });
    }
  }
}

export default ArtistController;
