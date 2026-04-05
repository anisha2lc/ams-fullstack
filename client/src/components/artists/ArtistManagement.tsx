import { zodResolver } from "mantine-form-zod-resolver";
import {
  ActionIcon,
  Button,
  FileButton,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconMusic, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "@/api/http";
import * as artistsApi from "@/api/artists.api";
import type { Artist } from "@/api/types";
import { useAuth } from "@/context/AuthContext";
import { canMutateArtists } from "@/lib/roles";
import { artistFormSchema, toArtistApiPayload } from "@/lib/schemas";

const PAGE_SIZE = 10;

const genderOptions = [
  { value: "m", label: "Male" },
  { value: "f", label: "Female" },
  { value: "o", label: "Other" },
];

export function ArtistManagement() {
  const { user } = useAuth();
  const canEdit = canMutateArtists(user?.role);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editArtist, setEditArtist] = useState<Artist | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["artists", page],
    queryFn: () => artistsApi.listArtists(page, PAGE_SIZE),
  });

  const emptyForm = {
    user_id: "",
    name: "",
    dob: "",
    gender: "m" as "m" | "f" | "o",
    address: "",
    first_release_year: new Date().getFullYear(),
    no_of_albums_released: 0,
  };

  const createForm = useForm({
    initialValues: { ...emptyForm },
    validate: zodResolver(artistFormSchema),
  });

  const editForm = useForm({
    initialValues: { ...emptyForm },
    validate: zodResolver(artistFormSchema),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => artistsApi.createArtist(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      notifications.show({ title: "Artist created", message: "Saved.", color: "teal" });
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      artistsApi.updateArtist(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      notifications.show({ title: "Artist updated", message: "Saved.", color: "teal" });
      setEditArtist(null);
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => artistsApi.deleteArtist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      notifications.show({ title: "Artist deleted", message: "Removed.", color: "gray" });
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const exportMutation = useMutation({
    mutationFn: () => artistsApi.exportArtistsCsv(),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "artists.csv";
      a.click();
      URL.revokeObjectURL(url);
      notifications.show({ title: "Export started", message: "Download should begin shortly.", color: "teal" });
    },
    onError: (e) =>
      notifications.show({ title: "Export failed", message: getErrorMessage(e), color: "red" }),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => artistsApi.importArtistsCsv(file),
    onSuccess: (body) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      const d = body.data;
      notifications.show({
        title: "Import finished",
        message: `Inserted ${d.inserted}, failed ${d.failed}. ${d.errors?.length ? `${d.errors.length} row errors.` : ""}`,
        color: d.failed ? "yellow" : "teal",
      });
    },
    onError: (e) =>
      notifications.show({ title: "Import failed", message: getErrorMessage(e), color: "red" }),
  });

  const openEdit = (a: Artist) => {
    setEditArtist(a);
    editForm.setValues({
      user_id: a.user_id != null ? String(a.user_id) : "",
      name: a.name,
      dob: a.dob?.slice(0, 10) ?? "",
      gender: a.gender,
      address: a.address,
      first_release_year: a.first_release_year,
      no_of_albums_released: a.no_of_albums_released,
    });
  };

  const rows = data?.data.map((a) => (
    <Table.Tr key={a.id}>
      <Table.Td className="hidden sm:table-cell">{a.id}</Table.Td>
      <Table.Td>{a.name}</Table.Td>
      <Table.Td>{a.first_release_year}</Table.Td>
      <Table.Td>{a.no_of_albums_released}</Table.Td>
      <Table.Td>
        <Button
          component={Link}
          to={`/dashboard/artists/${a.id}/songs`}
          size="sm"
          variant="light"
          color="indigo"
          radius="lg"
          className="font-bold hover:-translate-y-0.5 transition-transform"
          leftSection={<IconMusic size={14} />}
        >
          Songs
        </Button>
      </Table.Td>
      <Table.Td>
        {canEdit ? (
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="light" color="indigo" size="lg" radius="xl" onClick={() => openEdit(a)} className="shadow-sm hover:scale-105 transition-transform">
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
                  title: "Delete artist",
                  children: <Text size="sm">Delete {a.name}?</Text>,
                  labels: { confirm: "Delete", cancel: "Cancel" },
                  confirmProps: { color: "red" },
                  onConfirm: () => deleteMutation.mutate(a.id),
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
    <Stack gap="xl">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/50 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-md sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div className="max-w-xl min-w-0">
          <Text fw={900} size="xl" className="text-slate-800 tracking-tight">
            Artist Catalog
          </Text>
        </div>
        <Group gap="sm" wrap="wrap" className="w-full shrink-0 sm:w-auto [&_button]:min-h-12 sm:[&_button]:min-h-0">
          {canEdit && (
            <>
              <FileButton onChange={(file) => file && importMutation.mutate(file)} accept=".csv">
                {(props) => (
                  <Button {...props} variant="white" radius="xl" size="md" loading={importMutation.isPending} className="font-bold text-indigo-700 shadow-sm border border-indigo-100 hover:bg-slate-50 transition-all">
                    Import CSV
                  </Button>
                )}
              </FileButton>
              <Button
                variant="white"
                radius="xl"
                size="md"
                className="font-bold text-indigo-700 shadow-sm border border-indigo-100 hover:bg-slate-50 transition-all"
                loading={exportMutation.isPending}
                onClick={() => exportMutation.mutate()}
              >
                Export CSV
              </Button>
              <Button variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} radius="xl" size="md" onClick={() => setCreateOpen(true)} className="font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30 transition-all">
                Add Artist
              </Button>
            </>
          )}
        </Group>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
          {getErrorMessage(error)}
        </div>
      )}

      <div className="-mx-1 overflow-hidden rounded-3xl border border-white/60 bg-white/60 shadow-sm backdrop-blur-md sm:mx-0">
        <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
          <Table
            striped
            verticalSpacing="lg"
            horizontalSpacing="lg"
            classNames={{ thead: "bg-white/40 [&_th]:font-bold [&_th]:text-slate-500 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-widest border-b border-white/60", tbody: "[&_td]:text-slate-700 [&_td]:font-medium" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="hidden sm:table-cell">ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>First release</Table.Th>
                <Table.Th>Albums</Table.Th>
                <Table.Th>Songs</Table.Th>
                <Table.Th style={{ width: 200 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{isLoading ? null : rows}</Table.Tbody>
          </Table>
        </div>
      </div>

      {data && data.pagination.totalPages > 1 && (
        <Group justify="center" mt="xl">
          <Pagination
            total={data.pagination.totalPages}
            value={page}
            onChange={setPage}
            color="indigo"
            radius="xl"
            classNames={{ control: 'border-white/60 bg-white/50 backdrop-blur-md shadow-sm' }}
          />
        </Group>
      )}

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title={<Text fw={900} size="lg" className="text-slate-800">New artist</Text>} size="lg" radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/10', header: 'bg-transparent' }}>
        <form
          onSubmit={createForm.onSubmit((values) => {
            createMutation.mutate(toArtistApiPayload(values));
          })}
        >
          <Stack gap="md">
            <TextInput
              label="Linked user ID (optional)"
              description="Numeric user id if this artist maps to a user account"
              variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
              {...createForm.getInputProps("user_id")}
            />
            <TextInput label="Name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("name")} />
            <Group grow>
              <TextInput
                label="Date of birth"
                type="date"
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                max={new Date().toISOString().slice(0, 10)}
                {...createForm.getInputProps("dob")}
              />
              <Select label="Gender" data={genderOptions} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("gender")} />
            </Group>
            <TextInput label="Address" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("address")} />
            <Group grow>
              <NumberInput
                label="First release year"
                min={1900}
                max={2100}
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                {...createForm.getInputProps("first_release_year")}
              />
              <NumberInput
                label="Albums released"
                min={0}
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                {...createForm.getInputProps("no_of_albums_released")}
              />
            </Group>
            <Button type="submit" loading={createMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="md" radius="xl" size="md">
              Create User
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={!!editArtist}
        onClose={() => setEditArtist(null)}
        title={<Text fw={900} size="lg" className="text-slate-800">Edit artist</Text>}
        size="lg"
        radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/10', header: 'bg-transparent' }}
      >
        <form
          onSubmit={editForm.onSubmit((values) => {
            if (!editArtist) return;
            updateMutation.mutate({
              id: editArtist.id,
              body: toArtistApiPayload(values),
            });
          })}
        >
          <Stack gap="md">
            <TextInput label="Linked user ID (optional)" variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("user_id")} />
            <TextInput label="Name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("name")} />
            <Group grow>
              <TextInput
                label="Date of birth"
                type="date"
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                max={new Date().toISOString().slice(0, 10)}
                {...editForm.getInputProps("dob")}
              />
              <Select label="Gender" data={genderOptions} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("gender")} />
            </Group>
            <TextInput label="Address" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("address")} />
            <Group grow>
              <NumberInput
                label="First release year"
                min={1900}
                max={2100}
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                {...editForm.getInputProps("first_release_year")}
              />
              <NumberInput
                label="Albums released"
                min={0}
                required
                variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }}
                {...editForm.getInputProps("no_of_albums_released")}
              />
            </Group>
            <Button type="submit" loading={updateMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="md" radius="xl" size="md">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
