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
      <Table.Td>{a.id}</Table.Td>
      <Table.Td>{a.name}</Table.Td>
      <Table.Td>{a.first_release_year}</Table.Td>
      <Table.Td>{a.no_of_albums_released}</Table.Td>
      <Table.Td>
        <Button
          component={Link}
          to={`/dashboard/artists/${a.id}/songs`}
          size="xs"
          variant="light"
          color="indigo"
          leftSection={<IconMusic size={14} />}
        >
          Songs
        </Button>
      </Table.Td>
      <Table.Td>
        {canEdit ? (
          <Group gap="xs" justify="flex-end">
            <ActionIcon variant="subtle" color="indigo" onClick={() => openEdit(a)}>
              <IconEdit size={18} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              color="red"
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
    <Stack gap="md">
      <Group justify="space-between" align="flex-start" wrap="wrap">
        <Text size="sm" c="dimmed" maw={480}>
          Artists and metadata. Super admins can view; artist managers can create, import, and
          export.
        </Text>
        <Group gap="sm">
          {canEdit && (
            <>
              <FileButton onChange={(file) => file && importMutation.mutate(file)} accept=".csv">
                {(props) => (
                  <Button {...props} variant="default" loading={importMutation.isPending}>
                    Import CSV
                  </Button>
                )}
              </FileButton>
              <Button
                variant="default"
                loading={exportMutation.isPending}
                onClick={() => exportMutation.mutate()}
              >
                Export CSV
              </Button>
              <Button color="indigo" onClick={() => setCreateOpen(true)}>
                Add artist
              </Button>
            </>
          )}
        </Group>
      </Group>

      {isError && (
        <Text c="red" size="sm">
          {getErrorMessage(error)}
        </Text>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
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

      {data && data.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={data.pagination.totalPages}
            value={page}
            onChange={setPage}
            color="indigo"
          />
        </Group>
      )}

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New artist" size="lg">
        <form
          onSubmit={createForm.onSubmit((values) => {
            createMutation.mutate(toArtistApiPayload(values));
          })}
        >
          <Stack gap="sm">
            <TextInput
              label="Linked user ID (optional)"
              description="Numeric user id if this artist maps to a user account"
              {...createForm.getInputProps("user_id")}
            />
            <TextInput label="Name" required {...createForm.getInputProps("name")} />
            <Group grow>
              <TextInput
                label="Date of birth"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                {...createForm.getInputProps("dob")}
              />
              <Select label="Gender" data={genderOptions} {...createForm.getInputProps("gender")} />
            </Group>
            <TextInput label="Address" required {...createForm.getInputProps("address")} />
            <Group grow>
              <NumberInput
                label="First release year"
                min={1900}
                max={2100}
                required
                {...createForm.getInputProps("first_release_year")}
              />
              <NumberInput
                label="Albums released"
                min={0}
                required
                {...createForm.getInputProps("no_of_albums_released")}
              />
            </Group>
            <Button type="submit" loading={createMutation.isPending} color="indigo">
              Create
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={!!editArtist}
        onClose={() => setEditArtist(null)}
        title="Edit artist"
        size="lg"
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
          <Stack gap="sm">
            <TextInput label="Linked user ID (optional)" {...editForm.getInputProps("user_id")} />
            <TextInput label="Name" required {...editForm.getInputProps("name")} />
            <Group grow>
              <TextInput
                label="Date of birth"
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                {...editForm.getInputProps("dob")}
              />
              <Select label="Gender" data={genderOptions} {...editForm.getInputProps("gender")} />
            </Group>
            <TextInput label="Address" required {...editForm.getInputProps("address")} />
            <Group grow>
              <NumberInput
                label="First release year"
                min={1900}
                max={2100}
                required
                {...editForm.getInputProps("first_release_year")}
              />
              <NumberInput
                label="Albums released"
                min={0}
                required
                {...editForm.getInputProps("no_of_albums_released")}
              />
            </Group>
            <Button type="submit" loading={updateMutation.isPending} color="indigo">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
