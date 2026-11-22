"use client";

import { Download, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { useT } from "@/i18n/locale-provider";

export function InstallPrompt() {
	const { canInstall, installed, isIOS, promptInstall, dismiss } =
		usePwaInstall();
	const { t } = useT();
	const [iosHidden, setIosHidden] = React.useState(false);

	if (installed) return null;

	// iOS Safari does not fire beforeinstallprompt; show manual instructions.
	if (isIOS && !canInstall && !iosHidden) {
		return (
			<div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-4 sm:end-4 sm:w-80">
				<Card className="card-vintage border-bronze/40">
					<CardContent className="p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<CardTitle className="font-display text-base">
									{t("pwa.install.ios.title")}
								</CardTitle>
								<CardDescription className="mt-1 font-serif text-sm">
									{t("pwa.install.ios.desc")}
								</CardDescription>
							</div>
							<button
								type="button"
								aria-label={t("pwa.close")}
								onClick={() => setIosHidden(true)}
								className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light"
							>
								<X className="size-4" />
							</button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!canInstall) return null;

	return (
		<div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-4 sm:end-4 sm:w-80">
			<Card className="card-vintage border-bronze/40">
				<CardContent className="p-4">
					<div className="flex items-start gap-3">
						<div className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-bronze/15 text-bronze">
							<Download className="size-5" />
						</div>
						<div className="flex-1">
							<CardTitle className="font-display text-base">
								{t("pwa.install.title")}
							</CardTitle>
							<CardDescription className="mt-1 font-serif text-sm">
								{t("pwa.install.desc")}
							</CardDescription>
							<div className="mt-3 flex gap-2">
								<Button size="sm" onClick={() => void promptInstall()}>
									{t("pwa.install.cta")}
								</Button>
								<Button size="sm" variant="ghost" onClick={dismiss}>
									{t("pwa.install.later")}
								</Button>
							</div>
						</div>
						<button
							type="button"
							aria-label={t("pwa.close")}
							onClick={dismiss}
							className="inline-flex size-8 items-center justify-center rounded-full text-ink-soft/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light"
						>
							<X className="size-4" />
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
