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
  const rows = songsQuery.data?.data.map((s, index) => (
    <Table.Tr key={s.id}>
      <Table.Td className="hidden sm:table-cell">{(page - 1) * PAGE_SIZE + index + 1}</Table.Td>
      <Table.Td>{s.title}</Table.Td>
      <Table.Td>{s.album_name}</Table.Td>
      <Table.Td>{s.genre}</Table.Td>
      <Table.Td>
        {canEdit ? (
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="light" color="indigo" size="lg" radius="xl" onClick={() => openEdit(s)} className="shadow-sm hover:scale-105 transition-transform">
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="lg"
              radius="xl"
              className="shadow-sm hover:scale-105 transition-transform"
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
      <div className="rounded-3xl border border-white/50 bg-white/40 p-5 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-2xl sm:p-8 lg:p-10">
        <Stack gap="xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Anchor
                component={Link}
                to="/dashboard?tab=artists"
                className="mb-3 flex flex-row min-h-12 items-center gap-2 rounded-2xl bg-white/50 px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm backdrop-blur-md hover:bg-white/70 hover:text-indigo-800 transition-all sm:min-h-0"
              >
                <div className="flex flex-row items-center gap-2">
                  <IconArrowLeft size={16} />
                  <Text>Back to artists</Text>
                </div>
              </Anchor>
              <Title order={2} className="text-2xl font-black text-slate-800 tracking-tight sm:text-3xl mt-4">
                Songs Catalog
                {artist ? (
                  <Text span inherit fw={500} className="text-slate-400" size="xl" ml="md">
                    — {artist.name}
                  </Text>
                ) : null}
              </Title>
            </div>
            {canEdit && (
              <Button
                variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }}
                radius="xl" size="md" onClick={() => setCreateOpen(true)} className="min-h-12 shrink-0 font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30 transition-all sm:min-h-0">
                Add New Song
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

          <div className="-mx-1 overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-sm backdrop-blur-md sm:mx-0">
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <Table
                striped
                verticalSpacing="lg"
                horizontalSpacing="lg"
                classNames={{
                  thead:
                    "bg-white/40 [&_th]:font-bold [&_th]:text-slate-500 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-widest border-b border-white/60",
                  tbody: "[&_td]:text-slate-700 [&_td]:font-medium",
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="hidden sm:table-cell">S.N.</Table.Th>
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
            <Group justify="center" mt="xl" pb={"lg"}>
              <Pagination
                total={songsQuery.data.pagination.totalPages}
                value={page}
                onChange={setPage}
                color="indigo"
                radius="xl"
                classNames={{ control: 'border-white/60 bg-white/50 backdrop-blur-md shadow-sm' }}
              />
            </Group>
          )}

          <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title={<Text fw={800} size="lg">New song</Text>} size="md" radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl', header: 'bg-transparent' }}>
            <form onSubmit={createForm.onSubmit((v) => createMutation.mutate(v))}>
              <Stack gap="md">
                <TextInput label="Title" required {...createForm.getInputProps("title")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <TextInput label="Album" required {...createForm.getInputProps("album_name")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <Select label="Genre" data={genreOptions} {...createForm.getInputProps("genre")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <Button type="submit" loading={createMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="sm" radius="xl" size="md">
                  Create
                </Button>
              </Stack>
            </form>
          </Modal>

          <Modal opened={!!editSong} onClose={() => setEditSong(null)} title={<Text fw={800} size="lg">Edit song</Text>} size="md" radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl', header: 'bg-transparent' }}>
            <form
              onSubmit={editForm.onSubmit((v) => {
                if (!editSong) return;
                updateMutation.mutate({ songId: editSong.id, body: v });
              })}
            >
              <Stack gap="md">
                <TextInput label="Title" required {...editForm.getInputProps("title")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <TextInput label="Album" required {...editForm.getInputProps("album_name")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <Select label="Genre" data={genreOptions} {...editForm.getInputProps("genre")} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} />
                <Button type="submit" loading={updateMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="sm" radius="xl" size="md">
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
