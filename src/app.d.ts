// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare global {
	namespace App {
		interface Locals {
			sessionUser: {
				sessionId?: string;
				tenantId?: string;
				tenantCode?: string;
				tenantName?: string;
				userId?: string;
				email?: string;
				username?: string;
				profileImageUrl?: string;
				fullName?: string;
				firstName?: string;
				roleId?: string;
				roleName?: string;
			};

			// interface PageData {}
			// interface Platform {}
		}

		interface Error {
			message: string;
			code?: number;
			userId?: string;
			stack?: string;
		}

		interface PageData {
			flash?: { type: 'success' | 'error'; message: string };
		}
	}
}

export {};
