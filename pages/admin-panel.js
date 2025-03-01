import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useRouter } from "next/router";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(["admin", "user", "owner"]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role, users(email)")
        .eq("user_id", "users.id");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers(); 
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole });

    if (error) {
      alert("Error updating role:", error.message);
    } else {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.push("/"); 
    } catch (e) {
      alert(e.message); 
    }
  };

  return (
    <div className="flex flex-col p-4 bg-gray-900 text-white h-screen">
      <h1 className="text-xl mb-4">Admin Panel</h1>
      
      {/* Mostrar la lista de usuarios y roles */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td className="px-4 py-2">{user.users.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.user_id, e.target.value)
                    }
                    className="bg-gray-700 text-white px-2 py-1 rounded"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded"
                    onClick={() => handleRoleChange(user.user_id, "user")} // Reset to user if needed
                  >
                    Reset to User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón de cerrar sesión */}
      <div className="mt-auto">
        <button
          className="p-2 bg-black text-white rounded w-24"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
