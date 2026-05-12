 "use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import UserDialog from "@/components/dashboard/user-dialog";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] =
    useState("all");

  const [open, setOpen] = useState(false);
  const [editData, setEditData] =
    useState<any>(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "/api/users"
      );

      setUsers(response.data.data);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.email
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all"
          ? true
          : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const deleteUser = async (id: string) => {
    try {
      await axios.delete(`/api/users/${id}`);

      toast.success("User deleted");

      fetchUsers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            Users
          </h1>

          <p className="text-slate-500 mt-2">
            Manage CRM users
          </p>
        </div>

        <button
          onClick={() => {
            setEditData(null);
            setOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-3 rounded-xl"
        >
          Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-xl px-4 py-3 w-full"
          />

          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value)
            }
            className="border rounded-xl px-4 py-3"
          >
            <option value="all">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="brand">
              Brand
            </option>

            <option value="serviceCenter">
              Service Center
            </option>

            <option value="technician">
              Technician
            </option>

            <option value="customer">
              Customer
            </option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Role
              </th>

              <th className="p-4 text-left">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user._id}
                className="border-t"
              >
                <td className="p-4">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4 capitalize">
                  {user.role}
                </td>

                <td className="p-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditData(user);
                        setOpen(true);
                      }}
                      className="bg-slate-200 px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteUser(user._id)
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDialog
        open={open}
        onClose={() => setOpen(false)}
        fetchUsers={fetchUsers}
        editData={editData}
      />
    </div>
  );
}