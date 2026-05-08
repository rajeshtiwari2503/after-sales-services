"use client";

export default function OnlineUsers() {
  const users = [
    {
      name:
        "Rahul Sharma",
    },

    {
      name:
        "Amit Singh",
    },

    {
      name:
        "Vikash Kumar",
    },
  ];

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 p-5">
      <h2 className="text-2xl font-black mb-6">
        Online Users
      </h2>

      <div className="space-y-4">
        {users.map(
          (user) => (
            <div
              key={user.name}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {user.name.charAt(
                    0
                  )}
                </div>

                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              </div>

              <div>
                <h3 className="font-bold">
                  {user.name}
                </h3>

                <p className="text-sm text-green-600">
                  Online
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}