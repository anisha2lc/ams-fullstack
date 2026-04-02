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
      <Table.Td>{s.id}</Table.Td>
      <Table.Td>{s.title}</Table.Td>
      <Table.Td>{s.album_name}</Table.Td>
      <Table.Td>{s.genre}</Table.Td>
      <Table.Td>
        {canEdit ? (
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="subtle" color="indigo" onClick={() => openEdit(s)}>
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
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Anchor component={Link} to="/dashboard?tab=artists" size="sm" mb="xs" inline>
            <Group gap={6}>
              <IconArrowLeft size={16} />
              Back to artists
            </Group>
          </Anchor>
          <Title order={3} className="text-slate-800">
            Songs
            {artist ? (
              <Text span inherit fw={400} c="dimmed" size="lg" ml="xs">
                — {artist.name}
              </Text>
            ) : null}
          </Title>
        </div>
        {canEdit && (
          <Button color="indigo" onClick={() => setCreateOpen(true)}>
            Add song
          </Button>
        )}
      </Group>

      {artistQuery.isError && (
        <Text c="red" size="sm">
          {getErrorMessage(artistQuery.error)}
        </Text>
      )}
      {songsQuery.isError && (
        <Text c="red" size="sm">
          {getErrorMessage(songsQuery.error)}
        </Text>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Album</Table.Th>
              <Table.Th>Genre</Table.Th>
              <Table.Th style={{ width: 120 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{songsQuery.isLoading ? null : rows}</Table.Tbody>
        </Table>
      </div>

      {songsQuery.data && songsQuery.data.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={songsQuery.data.pagination.totalPages}
            value={page}
            onChange={setPage}
            color="indigo"
          />
        </Group>
      )}

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New song" size="md">
        <form onSubmit={createForm.onSubmit((v) => createMutation.mutate(v))}>
          <Stack gap="sm">
            <TextInput label="Title" required {...createForm.getInputProps("title")} />
            <TextInput label="Album" required {...createForm.getInputProps("album_name")} />
            <Select label="Genre" data={genreOptions} {...createForm.getInputProps("genre")} />
            <Button type="submit" loading={createMutation.isPending} color="indigo">
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
            <Button type="submit" loading={updateMutation.isPending} color="indigo">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
