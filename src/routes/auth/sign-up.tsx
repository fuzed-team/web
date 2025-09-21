import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/sign-up")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Navigate to="/" />;
}
