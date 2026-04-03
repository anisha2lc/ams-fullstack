import { zodResolver } from "mantine-form-zod-resolver";
import {
  ActionIcon,
  Anchor,
  Button,
  Group,
  Modal,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "@/api/http";
import * as artistsApi from "@/api/artists.api";
import type { Song, SongGenre } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { canMutateArtists } from "@/lib/roles";
import { songSchema } from "@/lib/schemas";

const PAGE_SIZE = 10;

const genreOptions: { value: SongGenre; label: string }[] = [
  { value: "rnb", label: "R&B" },
  { value: "country", label: "Country" },
  { value: "classic", label: "Classic" },
  { value: "rock", label: "Rock" },
  { value: "jazz", label: "Jazz" },
];

export function ArtistSongsPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const id = Number(artistId);
  const { user } = useAuth();
  const canEdit = canMutateArtists(user?.role);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editSong, setEditSong] = useState<Song | null>(null);
  const queryClient = useQueryClient();

  const artistQuery = useQuery({
    queryKey: ["artist", id],
    queryFn: () => artistsApi.getArtist(id),
    enabled: Number.isFinite(id),
  });

  const songsQuery = useQuery({
    queryKey: ["songs", id, page],
    queryFn: () => artistsApi.listSongs(id, page, PAGE_SIZE),
    enabled: Number.isFinite(id),
  });

  const emptySong = {
    title: "",
    album_name: "",
    genre: "rock" as SongGenre,
  };

  const createForm = useForm({
    initialValues: { ...emptySong },
    validate: zodResolver(songSchema),
  });

  const editForm = useForm({
    initialValues: { ...emptySong },
    validate: zodResolver(songSchema),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => artistsApi.createSong(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs", id] });
      notifications.show({ title: "Song added", message: "Saved.", color: "teal" });
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ songId, body }: { songId: number; body: Record<string, unknown> }) =>
      artistsApi.updateSong(id, songId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs", id] });
      notifications.show({ title: "Song updated", message: "Saved.", color: "teal" });
      setEditSong(null);
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (songId: number) => artistsApi.deleteSong(id, songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["songs", id] });
      notifications.show({ title: "Song deleted", message: "Removed.", color: "gray" });
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const openEdit = (s: Song) => {
    setEditSong(s);
    editForm.setValues({
      title: s.title,
      album_name: s.album_name,
      genre: s.genre,
    });
  };

  if (!Number.isFinite(id)) {
    return (
      <Text c="red" size="sm">
        Invalid artist id.
      </Text>
    );
  }

  const artist = artistQuery.data;
  const rows = songsQuery.data?.data.map((s) => (
    <Table.Tr key={s.id}>
      <Table.Td className="hidden sm:table-cell">{s.id}</Table.Td>
      <Table.Td>{s.title}</Table.Td>
      <Table.Td>{s.album_name}</Table.Td>
      <Table.Td>{s.genre}</Table.Td>
      <Table.Td>
        {canEdit ? (
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="subtle" color="teal" onClick={() => openEdit(s)}>
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() =>
                modals.openConfirmModal({
                  title: "Delete song",
                  children: <Text size="sm">Remove “{s.title}”?</Text>,
                  labels: { confirm: "Delete", cancel: "Cancel" },
                  confirmProps: { color: "red" },
                  onConfirm: () => deleteMutation.mutate(s.id),
                })
              }
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            Read only
          </Text>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-4 shadow-lg shadow-zinc-900/5 backdrop-blur-xl sm:rounded-2xl sm:p-6 lg:p-7">
        <Stack gap="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Anchor
                component={Link}
                to="/dashboard?tab=artists"
                className="mb-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 sm:min-h-0"
              >
                <IconArrowLeft size={16} />
                Back to artists
              </Anchor>
              <Title order={2} className="text-zinc-900 tracking-tight">
                Songs
                {artist ? (
                  <Text span inherit fw={500} className="text-zinc-500" size="lg" ml="xs">
                    — {artist.name}
                  </Text>
                ) : null}
              </Title>
              <Text size="sm" className="mt-2 max-w-prose text-zinc-600">
                Create and organize tracks for this artist. Genres are validated against the API enum.
              </Text>
            </div>
            {canEdit && (
              <Button color="teal" radius="md" size="md" onClick={() => setCreateOpen(true)} className="min-h-11 shrink-0 font-semibold shadow-md shadow-teal-600/15 sm:min-h-0">
                Add song
              </Button>
            )}
          </div>

          {artistQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
              {getErrorMessage(artistQuery.error)}
            </div>
          )}
          {songsQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
              {getErrorMessage(songsQuery.error)}
            </div>
          )}

          <div className="-mx-1 overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm sm:mx-0 sm:rounded-2xl">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <Table
                striped
                highlightOnHover
                verticalSpacing="md"
                horizontalSpacing="md"
                classNames={{
                  thead:
                    "bg-zinc-50/95 [&_th]:font-semibold [&_th]:text-zinc-600 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider",
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="hidden sm:table-cell">ID</Table.Th>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Album</Table.Th>
                    <Table.Th>Genre</Table.Th>
                    <Table.Th style={{ width: 120 }} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{songsQuery.isLoading ? null : rows}</Table.Tbody>
              </Table>
            </div>
          </div>

      {songsQuery.data && songsQuery.data.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={songsQuery.data.pagination.totalPages}
            value={page}
            onChange={setPage}
            color="teal"
          />
        </Group>
      )}

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New song" size="md">
        <form onSubmit={createForm.onSubmit((v) => createMutation.mutate(v))}>
          <Stack gap="sm">
            <TextInput label="Title" required {...createForm.getInputProps("title")} />
            <TextInput label="Album" required {...createForm.getInputProps("album_name")} />
            <Select label="Genre" data={genreOptions} {...createForm.getInputProps("genre")} />
            <Button type="submit" loading={createMutation.isPending} color="teal" className="min-h-11 sm:min-h-0">
              Create
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal opened={!!editSong} onClose={() => setEditSong(null)} title="Edit song" size="md">
        <form
          onSubmit={editForm.onSubmit((v) => {
            if (!editSong) return;
            updateMutation.mutate({ songId: editSong.id, body: v });
          })}
        >
          <Stack gap="sm">
            <TextInput label="Title" required {...editForm.getInputProps("title")} />
            <TextInput label="Album" required {...editForm.getInputProps("album_name")} />
            <Select label="Genre" data={genreOptions} {...editForm.getInputProps("genre")} />
            <Button type="submit" loading={updateMutation.isPending} color="teal" className="min-h-11 sm:min-h-0">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
        </Stack>
      </div>
    </div>
  );
}
