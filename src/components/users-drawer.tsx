import { socket } from '@/socket';
import { useChatUsersStore } from '@/store';
import { Drawer } from 'antd';
import { useEffect, useState } from 'react';

function UsersDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const online_users = useChatUsersStore.use.online_users();
  const setUsers = useChatUsersStore.use.setUsers();
  const socketIds = useChatUsersStore.use.socketIds();
  const me = socketIds[socketIds.length - 1] ?? '';

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    socket?.emit('connected-users', '', (val: string[]) => {
      setUsers(val);
    });
  }, [open]);

  return (
    <>
      <div onClick={showDrawer}> {children} </div>
      <Drawer title="Online Users" onClose={onClose} open={open}>
        <div className="flex flex-col gap-5">
          {online_users.map((item) => {
            return (
              <div key={item}>
                <div className="relative flex w-80 items-center rounded-md bg-white p-5 shadow-md">
                  {me === item && (
                    <button className="absolute right-2 rounded-xl bg-green-200 px-3 py-1 text-sm text-green-700">
                      You
                    </button>
                  )}
                  <p className="font-sans font-bold">{item}</p>
                  {/* <div className="py-2 font-mono text-sm">
                  branch of science that examines the compounds made of atoms, molecules, and the
                  properties and behavior of materials and the effect of materials on each other....
                </div> */}
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>
    </>
  );
}

export default UsersDrawer;
