function UserAvatar({name}: {name?: string}) {
   
   return (
			<p className="text-2xl flex justify-center items-center rounded-3xl px-3.5 py-4 bg-gray-600 h-10 w-10 text-white">
				{name?.[0]?.toUpperCase()}
			</p>
		);
}

export default UserAvatar;