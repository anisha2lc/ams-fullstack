import { zodResolver } from "mantine-form-zod-resolver";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getErrorMessage } from "@/api/http";
import * as usersApi from "@/api/users.api";
import type { User } from "@/api/types";
import { userCreateSchema, userUpdateSchema } from "@/lib/schemas";

const PAGE_SIZE = 10;

const genderOptions = [
  { value: "m", label: "Male" },
  { value: "f", label: "Female" },
  { value: "o", label: "Other" },
];

const roleOptions = [
  { value: "super_admin", label: "Super admin" },
  { value: "artist_manager", label: "Artist manager" },
  { value: "artist", label: "Artist" },
];

export function UserManagement() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["users", page],
    queryFn: () => usersApi.listUsers(page, PAGE_SIZE),
  });

  const createForm = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      dob: "",
      gender: "m" as "m" | "f" | "o",
      address: "",
      role: "artist_manager" as "super_admin" | "artist_manager" | "artist",
      is_active: true,
    },
    validate: zodResolver(userCreateSchema),
  });

  const editForm = useForm({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      dob: "",
      gender: "m" as "m" | "f" | "o",
      address: "",
      role: "artist_manager" as "super_admin" | "artist_manager" | "artist",
      is_active: true,
    },
    validate: zodResolver(userUpdateSchema),
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => usersApi.createUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({ title: "User created", message: "Saved.", color: "teal" });
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      usersApi.updateUser(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({ title: "User updated", message: "Saved.", color: "teal" });
      setEditUser(null);
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({ title: "User deleted", message: "Removed.", color: "gray" });
    },
    onError: (e) =>
      notifications.show({ title: "Error", message: getErrorMessage(e), color: "red" }),
  });

  const openEdit = (u: User) => {
    setEditUser(u);
    editForm.setValues({
      first_name: u.first_name,
      last_name: u.last_name,
      phone: u.phone,
      dob: u.dob?.slice(0, 10) ?? "",
      gender: u.gender,
      address: u.address,
      role: u.role,
      is_active: u.is_active ?? true,
    });
  };

  const rows = data?.data.map((u) => (
    <Table.Tr key={u.id}>
      <Table.Td>{u.id}</Table.Td>
      <Table.Td>
        {u.first_name} {u.last_name}
      </Table.Td>
      <Table.Td>{u.email}</Table.Td>
      <Table.Td>
        <Badge variant="light" color="indigo">
          {u.role.replace("_", " ")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={u.is_active === false ? "red" : "teal"} variant="light">
          {u.is_active === false ? "Inactive" : "Active"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="flex-end">
          <ActionIcon variant="subtle" color="indigo" onClick={() => openEdit(u)}>
            <IconEdit size={18} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() =>
              modals.openConfirmModal({
                title: "Delete user",
                children: <Text size="sm">Delete {u.email}? This cannot be undone.</Text>,
                labels: { confirm: "Delete", cancel: "Cancel" },
                confirmProps: { color: "red" },
                onConfirm: () => deleteMutation.mutate(u.id),
              })
            }
          >
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          Manage admin and artist accounts.
        </Text>
        <Button color="indigo" onClick={() => setCreateOpen(true)}>
          Add user
        </Button>
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
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ width: 120 }} />
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

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New user" size="lg">
        <form
          onSubmit={createForm.onSubmit((values) =>
            createMutation.mutate({
              ...values,
              is_active: values.is_active,
            }),
          )}
        >
          <Stack gap="sm">
            <Group grow>
              <TextInput label="First name" required {...createForm.getInputProps("first_name")} />
              <TextInput label="Last name" required {...createForm.getInputProps("last_name")} />
            </Group>
            <TextInput label="Email" required {...createForm.getInputProps("email")} />
            <TextInput label="Password" type="password" required {...createForm.getInputProps("password")} />
            <TextInput label="Phone" required {...createForm.getInputProps("phone")} />
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
            <Select label="Role" data={roleOptions} {...createForm.getInputProps("role")} />
            <Switch label="Active" {...createForm.getInputProps("is_active", { type: "checkbox" })} />
            <Button type="submit" loading={createMutation.isPending} color="indigo">
              Create
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit user"
        size="lg"
      >
        <form
          onSubmit={editForm.onSubmit((values) => {
            if (!editUser) return;
            updateMutation.mutate({
              id: editUser.id,
              body: {
                first_name: values.first_name,
                last_name: values.last_name,
                phone: values.phone,
                dob: values.dob,
                gender: values.gender,
                address: values.address,
                role: values.role,
                is_active: values.is_active,
              },
            });
          })}
        >
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Email: {editUser?.email} (cannot be changed)
            </Text>
            <Group grow>
              <TextInput label="First name" required {...editForm.getInputProps("first_name")} />
              <TextInput label="Last name" required {...editForm.getInputProps("last_name")} />
            </Group>
            <TextInput label="Phone" required {...editForm.getInputProps("phone")} />
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
            <Select label="Role" data={roleOptions} {...editForm.getInputProps("role")} />
            <Switch label="Active" {...editForm.getInputProps("is_active", { type: "checkbox" })} />
            <Button type="submit" loading={updateMutation.isPending} color="indigo">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
