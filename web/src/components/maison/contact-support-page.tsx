"use client";

import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import {
	AmazighStar,
	OrnamentDivider,
	Reveal,
	WhatsAppIcon,
} from "@/components/maison/motifs";
import { SocialIcons } from "@/components/maison/social-icons";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import {
	googleMapsLink,
	whatsappCatalog,
	whatsappContactLink,
} from "@/lib/brand";

export function ContactSupportPage() {
	const { t } = useT();
	const address = `${site.address.line1}, ${site.address.line2}, ${site.address.city}, ${site.address.country}`;

	return (
		<section className="vintage-paper min-h-[80vh] py-16 sm:py-20">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<Reveal className="text-center">
					<AmazighStar className="mx-auto size-9 text-terracotta" />
					<p className="eyebrow mt-4">{t("contact.eyebrow")}</p>
					<h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl">
						{t("contact.title")}
					</h1>
					<p className="mt-4 font-serif text-[1.05rem] italic leading-relaxed text-ink-soft dark:text-cream/75">
						{t("contact.desc")}
					</p>
					<OrnamentDivider className="mt-6" />
				</Reveal>

				<Reveal className="mt-12">
					<div className="vintage-frame rounded-sm p-6 sm:p-10">
						<div className="grid gap-4 sm:grid-cols-2">
							<a
								href={whatsappCatalog}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-start gap-4 rounded-sm border border-terracotta/35 bg-terracotta/5 p-5 transition-all hover:border-terracotta hover:bg-terracotta/10 sm:col-span-2"
							>
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-terracotta/40 bg-terracotta/10 text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-cream">
									<WhatsAppIcon className="size-4" />
								</span>
								<span>
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("contact.whatsapp")}
									</span>
									<span className="mt-1 block font-serif text-lg text-ink dark:text-cream">
										{site.phones[0].display}
									</span>
									<span className="mt-1 block font-serif text-sm italic text-ink-soft dark:text-cream/70">
										{t("contact.whatsappHint")}
									</span>
								</span>
							</a>

							<a
								href={`tel:${site.phones[0].e164}`}
								className="group flex items-start gap-4 rounded-sm border border-bronze/30 p-5 transition-all hover:border-bronze hover:bg-bronze/5"
							>
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bronze/35 text-bronze transition-colors group-hover:border-bronze group-hover:bg-bronze group-hover:text-cream">
									<Phone className="size-4" />
								</span>
								<span>
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("contact.phone")}
									</span>
									<span className="mt-1 block font-serif text-lg text-ink dark:text-cream">
										{site.phones[0].display}
									</span>
									{site.phones[1] ? (
										<span className="mt-0.5 block font-serif text-sm text-ink-soft dark:text-cream/70">
											{site.phones[1].display}
										</span>
									) : null}
								</span>
							</a>

							<a
								href={`mailto:${site.email}`}
								className="group flex items-start gap-4 rounded-sm border border-bronze/30 p-5 transition-all hover:border-bronze hover:bg-bronze/5"
							>
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bronze/35 text-bronze transition-colors group-hover:border-bronze group-hover:bg-bronze group-hover:text-cream">
									<Mail className="size-4" />
								</span>
								<span className="min-w-0 overflow-hidden">
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("contact.email")}
									</span>
									<span className="mt-1 block break-all font-serif text-lg text-ink dark:text-cream">
										{site.email}
									</span>
								</span>
							</a>

							<a
								href={site.socials.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-start gap-4 rounded-sm border border-bronze/30 p-5 transition-all hover:border-bronze hover:bg-bronze/5"
							>
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bronze/35 text-bronze transition-colors group-hover:border-bronze group-hover:bg-bronze group-hover:text-cream">
									<Instagram className="size-4" />
								</span>
								<span className="min-w-0">
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("contact.instagram")}
									</span>
									<span className="mt-1 block font-serif text-lg text-ink dark:text-cream">
										{site.socials.instagramHandle}
									</span>
								</span>
							</a>

							<a
								href={googleMapsLink()}
								target="_blank"
								rel="noopener noreferrer"
								className="group flex items-start gap-4 rounded-sm border border-bronze/30 p-5 transition-all hover:border-bronze hover:bg-bronze/5"
							>
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bronze/35 text-bronze transition-colors group-hover:border-bronze group-hover:bg-bronze group-hover:text-cream">
									<MapPin className="size-4" />
								</span>
								<span className="min-w-0">
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("find.address")}
									</span>
									<span className="mt-1 block font-serif text-[1rem] leading-relaxed text-ink dark:text-cream">
										{address}
									</span>
									<span className="mt-1 block font-label text-[0.62rem] uppercase tracking-[0.18em] text-terracotta">
										{t("find.directions")}
									</span>
								</span>
							</a>

							<div className="flex items-start gap-4 rounded-sm border border-bronze/30 p-5 sm:col-span-2">
								<span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bronze/35 text-bronze">
									<Clock className="size-4" />
								</span>
								<span className="min-w-0">
									<span className="block font-label text-[0.66rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
										{t("find.hours")}
									</span>
									<ul className="mt-2 space-y-1 font-serif text-[1rem] leading-relaxed text-ink dark:text-cream">
										{site.hours.map((h) => (
											<li key={h.dayKey}>
												{t(h.dayKey)} : {h.time}
											</li>
										))}
									</ul>
								</span>
							</div>
						</div>

						<div className="mt-8 border-t border-bronze/20 pt-6 text-center">
							<p className="mb-3 font-label text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft dark:text-cream/70">
								{t("contact.follow")}
							</p>
							<SocialIcons className="justify-center" size={44} />
						</div>

						<div className="mt-8 grid gap-3 text-center font-serif text-sm text-ink-soft dark:text-cream/75 sm:grid-cols-3">
							<Link
								href="/livraison-retours"
								className="rounded-sm border border-bronze/25 px-4 py-3 transition-colors hover:border-bronze hover:text-terracotta"
							>
								{t("legal.deliveryReturns")}
							</Link>
							<Link
								href="/guide-des-tailles"
								className="rounded-sm border border-bronze/25 px-4 py-3 transition-colors hover:border-bronze hover:text-terracotta"
							>
								{t("legal.sizing")}
							</Link>
							<Link
								href={whatsappContactLink()}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-sm border border-bronze/25 px-4 py-3 transition-colors hover:border-bronze hover:text-terracotta"
							>
								{t("contact.whatsapp")}
							</Link>
						</div>
					</div>
				</Reveal>
			</div>
		</section>
	);
}
