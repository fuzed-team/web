import {
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ThemeProvider } from "@/contexts/theme-context";
import { handleServerError } from "@/lib/utils/handle-server-error";
import { useAuth, useAuthStore } from "@/stores/auth-store";
// Generated Routes
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				// eslint-disable-next-line no-console
				if (import.meta.env.DEV) console.log({ failureCount, error });

				if (failureCount >= 0 && import.meta.env.DEV) return false;
				if (failureCount > 3 && import.meta.env.PROD) return false;

				return !(
					error instanceof AxiosError &&
					[401, 403].includes(error.response?.status ?? 0)
				);
			},
			refetchOnWindowFocus: import.meta.env.PROD,
			staleTime: 10 * 1000, // 10s
		},
		mutations: {
			onError: (error) => {
				handleServerError(error);

				if (error instanceof AxiosError) {
					if (error.response?.status === 304) {
						toast.error("Content not modified!");
					}
				}
			},
		},
	},
	queryCache: new QueryCache({
		onError: (error) => {
			if (error instanceof AxiosError) {
				if (error.response?.status === 401) {
					useAuthStore.getState().auth.reset();
					// const redirect = `${router.history.location.href}`;
					// router.navigate({ to: "/sign-in", search: { redirect } });
				}
				if (error.response?.status === 500) {
					toast.error("Internal Server Error!");
					router.navigate({ to: "/500" });
				}
				if (error.response?.status === 403) {
					router.navigate({ to: "/403", replace: true });
				}
			}
		},
	}),
});

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { queryClient, auth: undefined },
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	const { accessToken } = useAuth();

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
				<RouterProvider
					router={router}
					context={{ auth: { isAuthenticated: !!accessToken } }}
				/>
			</ThemeProvider>
		</QueryClientProvider>
	);
}

export default App;
