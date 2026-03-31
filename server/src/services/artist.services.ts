import { query, queryOne } from "../config/db";
import {
  ICreateSong,
  IRegisterArtist,
  IUpdateArtist,
  IUpdateSong,
} from "../schemas/artist.schema";

interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ArtistRecord {
  id: number;
  user_id: number | null;
  name: string;
  dob: string;
  gender: "m" | "f" | "o";
  address: string;
  first_release_year: number;
  no_of_albums_released: number;
  created_at: string;
  updated_at: string;
}

interface SongRecord {
  id: number;
  artist_id: number;
  title: string;
  album_name: string;
  genre: "rnb" | "country" | "classic" | "rock" | "jazz";
  created_at: string;
  updated_at: string;
}

class ArtistService {
  public async registerArtist(artistData: IRegisterArtist): Promise<ArtistRecord> {
    const artist = await queryOne<ArtistRecord>(
      `INSERT INTO artists
        (user_id, name, dob, gender, address, first_release_year, no_of_albums_released)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        artistData.user_id ?? null,
        artistData.name,
        artistData.dob,
        artistData.gender,
        artistData.address,
        artistData.first_release_year,
        artistData.no_of_albums_released,
      ],
    );

    if (!artist) {
      throw new Error("Failed to create artist");
    }

    return artist;
  }

  public async getAllArtists(
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<ArtistRecord>> {
    const offset = (page - 1) * limit;
    const artists = await query<ArtistRecord>(
      `SELECT * FROM artists
       ORDER BY id DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const totalRows = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM artists",
    );
    const total = Number(totalRows?.count ?? 0);

    return {
      data: artists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getArtistById(id: string): Promise<ArtistRecord | null> {
    return queryOne<ArtistRecord>("SELECT * FROM artists WHERE id = $1", [id]);
  }

  public async updateArtist(
    id: string,
    updateData: IUpdateArtist,
  ): Promise<ArtistRecord | null> {
    const existing = await this.getArtistById(id);
    if (!existing) {
      return null;
    }

    return queryOne<ArtistRecord>(
      `UPDATE artists
       SET user_id = $1,
           name = $2,
           dob = $3,
           gender = $4,
           address = $5,
           first_release_year = $6,
           no_of_albums_released = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        updateData.user_id ?? existing.user_id,
        updateData.name ?? existing.name,
        updateData.dob ?? existing.dob,
        updateData.gender ?? existing.gender,
        updateData.address ?? existing.address,
        updateData.first_release_year ?? existing.first_release_year,
        updateData.no_of_albums_released ?? existing.no_of_albums_released,
        id,
      ],
    );
  }

  public async deleteArtist(id: string): Promise<boolean> {
    const deleted = await queryOne<{ id: number }>(
      "DELETE FROM artists WHERE id = $1 RETURNING id",
      [id],
    );
    return Boolean(deleted);
  }

  public async exportArtists(): Promise<ArtistRecord[]> {
    return query<ArtistRecord>("SELECT * FROM artists ORDER BY id ASC");
  }

  public async importArtists(
    artistRows: IRegisterArtist[],
  ): Promise<{ inserted: number; failed: number }> {
    let inserted = 0;

    for (const row of artistRows) {
      try {
        await this.registerArtist(row);
        inserted += 1;
      } catch {
        // Ignore per-row failures and continue.
      }
    }

    return { inserted, failed: artistRows.length - inserted };
  }

  public async getSongsByArtistId(
    artistId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginationResult<SongRecord>> {
    const offset = (page - 1) * limit;
    const songs = await query<SongRecord>(
      `SELECT * FROM songs
       WHERE artist_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [artistId, limit, offset],
    );

    const totalRows = await queryOne<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM songs WHERE artist_id = $1",
      [artistId],
    );
    const total = Number(totalRows?.count ?? 0);

    return {
      data: songs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async createSongForArtist(
    artistId: string,
    songData: ICreateSong,
  ): Promise<SongRecord | null> {
    const artist = await this.getArtistById(artistId);
    if (!artist) {
      return null;
    }

    return queryOne<SongRecord>(
      `INSERT INTO songs (artist_id, title, album_name, genre)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [artistId, songData.title, songData.album_name, songData.genre],
    );
  }

  public async updateSongForArtist(
    artistId: string,
    songId: string,
    songData: IUpdateSong,
  ): Promise<SongRecord | null> {
    const existingSong = await queryOne<SongRecord>(
      "SELECT * FROM songs WHERE id = $1 AND artist_id = $2",
      [songId, artistId],
    );

    if (!existingSong) {
      return null;
    }

    return queryOne<SongRecord>(
      `UPDATE songs
       SET title = $1,
           album_name = $2,
           genre = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND artist_id = $5
       RETURNING *`,
      [
        songData.title ?? existingSong.title,
        songData.album_name ?? existingSong.album_name,
        songData.genre ?? existingSong.genre,
        songId,
        artistId,
      ],
    );
  }

  public async deleteSongForArtist(artistId: string, songId: string): Promise<boolean> {
    const deleted = await queryOne<{ id: number }>(
      "DELETE FROM songs WHERE id = $1 AND artist_id = $2 RETURNING id",
      [songId, artistId],
    );
    return Boolean(deleted);
  }
}

export default ArtistService;
