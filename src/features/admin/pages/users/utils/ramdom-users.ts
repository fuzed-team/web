import { faker } from "@faker-js/faker";
import { USER_ROLES } from "../constants/user-constants";

export function generateRandomUsers(count: number) {
	const users = [];
	for (let i = 0; i < count; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const useInitials = faker.datatype.boolean();
		const name = useInitials
			? `${firstName[0]}.${lastName[0]}.`
			: firstName.substring(0, 15);
		const email = faker.internet.email({ firstName, lastName });
		const role = USER_ROLES[1];
		const school = "Columbia University";
		const gender = faker.helpers.arrayElement(["male", "female"]);
		const age = faker.number.int({ min: 18, max: 25 });
		const createdAt = faker.date.past().toISOString();

		users.push({
			email,
			name,
			role,
			school,
			gender,
			age,
			createdAt,
		});
	}
	return users;
}
