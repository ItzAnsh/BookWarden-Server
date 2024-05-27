export const findRole = (role) => {
	if (role === "librarian") {
		return process.env.LIBRARIAN_KEY;
	} else if (role === "admin") {
		return process.env.ADMIN_KEY;
	}
};
