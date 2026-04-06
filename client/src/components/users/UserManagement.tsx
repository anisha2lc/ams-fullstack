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

  const rows = data?.data.map((u, index) => (
    <Table.Tr key={u.id}>
      <Table.Td className="hidden sm:table-cell">{(page - 1) * PAGE_SIZE + index + 1}</Table.Td>
      <Table.Td>
        {u.first_name} {u.last_name}
      </Table.Td>
      <Table.Td>{u.email}</Table.Td>
      <Table.Td>
        <Badge variant="light" color="teal">
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
          <ActionIcon variant="light" color="indigo" size="lg" radius="xl" onClick={() => openEdit(u)} className="shadow-sm hover:scale-105 transition-transform">
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
    <Stack gap="xl">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/50 p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <Text fw={900} size="xl" className="text-slate-800 tracking-tight">
            User Directory
          </Text>
        </div>
        <Button variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} radius="xl" size="md" onClick={() => setCreateOpen(true)} className="min-h-12 shrink-0 font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30 transition-all sm:min-h-0">
          Add System User
        </Button>
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
                <Table.Th className="hidden sm:table-cell">S.N.</Table.Th>
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
      </div>

      {data && data.pagination.totalPages > 1 && (
        <Group justify="center" mt="xl" pb={"lg"}>
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

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title={<Text fw={900} size="lg" className="text-slate-800">New user</Text>} size="lg" radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/10', header: 'bg-transparent' }}>
        <form
          onSubmit={createForm.onSubmit((values) =>
            createMutation.mutate({
              ...values,
              is_active: values.is_active,
            }),
          )}
        >
          <Stack gap="md">
            <Group grow>
              <TextInput label="First name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("first_name")} />
              <TextInput label="Last name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("last_name")} />
            </Group>
            <TextInput label="Email" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("email")} />
            <TextInput label="Password" type="password" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("password")} />
            <TextInput label="Phone" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("phone")} />
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
            <Select label="Role" data={roleOptions} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...createForm.getInputProps("role")} />
            <Switch label="Active" color="indigo" {...createForm.getInputProps("is_active", { type: "checkbox" })} />
            <Button type="submit" loading={createMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="md" radius="xl" size="md">
              Create User
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={!!editUser}
        onClose={() => setEditUser(null)}
        title={<Text fw={900} size="lg" className="text-slate-800">Edit user</Text>}
        size="lg"
        radius="xl" classNames={{ content: 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/10', header: 'bg-transparent' }}
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
          <Stack gap="md">
            <Text size="sm" className="font-medium text-slate-500">
              Email: {editUser?.email} (cannot be changed)
            </Text>
            <Group grow>
              <TextInput label="First name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("first_name")} />
              <TextInput label="Last name" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("last_name")} />
            </Group>
            <TextInput label="Phone" required variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("phone")} />
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
            <Select label="Role" data={roleOptions} variant="filled" classNames={{ input: "bg-white/60 focus:bg-white" }} {...editForm.getInputProps("role")} />
            <Switch label="Active" color="indigo" {...editForm.getInputProps("is_active", { type: "checkbox" })} />
            <Button type="submit" loading={updateMutation.isPending} variant="gradient" gradient={{ from: 'indigo.5', to: 'cyan.5', deg: 135 }} mt="md" radius="xl" size="md">
              Save changes
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
