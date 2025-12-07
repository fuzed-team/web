"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useUser } from "@/features/auth/api/get-me";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook to subscribe to real-time notification updates
 *
 * Listens to the user-specific notification broadcast channel
 * and automatically invalidates notification queries when new notifications arrive
 */
export function useNotificationsRealtime() {
	const queryClient = useQueryClient();
	const channelRef = useRef<RealtimeChannel | null>(null);
	const user = useUser();

	useEffect(() => {
		if (!user?.id) {
			return;
		}

		const supabase = createClient();
		const channelName = `user:${user.id}:notifications`;

		// Subscribe to broadcast channel for this user
		channelRef.current = supabase
			.channel(channelName)
			.on("broadcast", { event: "notification" }, ({ payload }) => {
				console.log(payload);
				// Invalidate all notifications queries to refetch updated data
				queryClient.invalidateQueries({
					queryKey: ["notifications"],
				});
			})
			.subscribe((status) => {
				if (status === "CHANNEL_ERROR") {
					console.error("❌ Notifications realtime connection failed");
				} else if (status === "TIMED_OUT") {
					console.error("⏱️ Notifications realtime subscription timeout");
				} else if (status === "SUBSCRIBED") {
					console.log("✅ Notifications realtime connected");
				}
			});

		return () => {
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
				channelRef.current = null;
			}
		};
	}, [user, queryClient]);

	return {
		isConnected: channelRef.current?.state === "joined",
	};
}
