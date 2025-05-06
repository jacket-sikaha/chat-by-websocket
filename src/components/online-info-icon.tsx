import { useChatUsersStore } from '@/store';

function OnlineInfoIcon() {
  const online_users = useChatUsersStore.use.online_users();
  return (
    <div className="group relative flex items-center justify-center text-base font-bold text-zinc-600">
      <div className="flex cursor-pointer items-center rounded-full bg-gradient-to-br from-[#ff67ca] to-[#fff765] p-3 shadow-md duration-300 group-hover:gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 26 26">
          <path d="M20.281 4.063a1.5 1.5 0 0 0-.906 2.593A8.94 8.94 0 0 1 22 13a8.95 8.95 0 0 1-2.625 6.344a1.503 1.503 0 1 0 2.125 2.125a11.995 11.995 0 0 0 0-16.938a1.5 1.5 0 0 0-1.063-.469a2 2 0 0 0-.156 0zm-14.906.03a1.5 1.5 0 0 0-.875.438a11.995 11.995 0 0 0 0 16.938a1.503 1.503 0 1 0 2.125-2.125A8.94 8.94 0 0 1 4 13a8.95 8.95 0 0 1 2.625-6.344a1.5 1.5 0 0 0-1.25-2.562zm3.813 3.313a1.5 1.5 0 0 0-.876.407A7 7 0 0 0 6 13c0 2.048.87 3.91 2.281 5.188a1.504 1.504 0 1 0 2.031-2.22A3.98 3.98 0 0 1 9 13a3.98 3.98 0 0 1 1.313-2.969a1.5 1.5 0 0 0-1.126-2.625zm7.406 0a1.5 1.5 0 0 0-.907 2.625A3.98 3.98 0 0 1 17 13a3.98 3.98 0 0 1-1.313 2.969a1.5 1.5 0 1 0 2 2.219A7 7 0 0 0 20 13a6.98 6.98 0 0 0-2.281-5.188a1.5 1.5 0 0 0-1.125-.406M13 11.188A1.812 1.812 0 1 0 14.813 13A1.81 1.81 0 0 0 13 11.187z" />
        </svg>
        <span className="text-[0px] duration-300 group-hover:text-base">
          Online: {online_users.length}
        </span>
      </div>
    </div>
  );
}

export default OnlineInfoIcon;
