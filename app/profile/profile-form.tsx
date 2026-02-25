"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import type { Profile } from "@/lib/types";
import {
  isAllowedLogoFileName,
  LOGO_ALLOWED_EXTENSIONS,
} from "@/lib/storage";
import {
  updateProfile,
  uploadLogoAndUpdateProfile,
  deleteLogoAndUpdateProfile,
  addBanner,
  deleteBanner,
  addBenefit,
  deleteBenefit,
  addHiringStep,
  deleteHiringStep,
  addGalleryImage,
  deleteGalleryImage,
  type ProfileUpdateData,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Trash2, User, Gift, ListOrdered, ImagePlus } from "lucide-react";
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export type CompanyBanner = { id: string; url: string };
export type CompanyBenefitItem = {
  id: string;
  title: string;
  description: string | null;
};
export type CompanyHiringStepItem = {
  id: string;
  title: string;
  description: string | null;
};
export type CompanyGalleryItem = { id: string; url: string; caption: string | null };

export function ProfileForm({
  profile,
  banners = [],
  benefits = [],
  hiringSteps = [],
  gallery = [],
}: {
  profile: Profile;
  banners?: CompanyBanner[];
  benefits?: CompanyBenefitItem[];
  hiringSteps?: CompanyHiringStepItem[];
  gallery?: CompanyGalleryItem[];
}) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const companyAboutRef = useRef<HTMLTextAreaElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number ?? "");
  const role = profile.role;
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [companyWebsite, setCompanyWebsite] = useState(
    profile.company_website ?? ""
  );
  const [companyAbout, setCompanyAbout] = useState(
    profile.company_about ?? ""
  );
  const [companyLocation, setCompanyLocation] = useState(
    profile.company_location ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [benefitLoading, setBenefitLoading] = useState<string | null>(null);
  const [hiringStepLoading, setHiringStepLoading] = useState<string | null>(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const updateData = (): ProfileUpdateData => ({
    full_name: fullName.trim() || null,
    last_name: lastName.trim() || null,
    phone_number: phoneNumber.trim() || null,
    company_name: role === "employer" ? (companyName.trim() || null) : null,
    company_website:
      role === "employer" ? (companyWebsite.trim() || null) : null,
    company_about:
      role === "employer" ? (companyAbout.trim() || null) : null,
    company_location:
      role === "employer" ? (companyLocation.trim() || null) : null,
    application_preference:
      role === "employer" ? (profile.application_preference ?? null) : null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const result = await updateProfile(updateData());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedLogoFileName(file.name)) {
      setError(`Allowed formats: ${LOGO_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setLogoLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadLogoAndUpdateProfile(formData);
    setLogoLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (logoInputRef.current) logoInputRef.current.value = "";
    router.refresh();
  }

  async function handleDeleteLogo() {
    setError(null);
    setLogoLoading(true);
    const result = await deleteLogoAndUpdateProfile();
    setLogoLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedLogoFileName(file.name)) {
      setError(`Allowed formats: ${LOGO_ACCEPT}`);
      return;
    }
    setError(null);
    setBannerLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await addBanner(formData);
    setBannerLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (bannerInputRef.current) bannerInputRef.current.value = "";
    router.refresh();
  }

  async function handleDeleteBanner(bannerId: string) {
    setError(null);
    setBannerLoading(true);
    const result = await deleteBanner(bannerId);
    setBannerLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAddBenefit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setBenefitLoading("add");
    const result = await addBenefit(formData);
    setBenefitLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  async function handleDeleteBenefit(id: string) {
    setError(null);
    setBenefitLoading(id);
    const result = await deleteBenefit(id);
    setBenefitLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAddHiringStep(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setHiringStepLoading("add");
    const result = await addHiringStep(formData);
    setHiringStepLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    router.refresh();
  }

  async function handleDeleteHiringStep(id: string) {
    setError(null);
    setHiringStepLoading(id);
    const result = await deleteHiringStep(id);
    setHiringStepLoading(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAddGalleryImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedLogoFileName(file.name)) {
      setError(`Allowed formats: ${LOGO_ACCEPT}`);
      return;
    }
    setError(null);
    setGalleryLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await addGalleryImage(formData);
    setGalleryLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    e.target.value = "";
    router.refresh();
  }

  async function handleDeleteGalleryImage(id: string) {
    setError(null);
    setGalleryLoading(true);
    const result = await deleteGalleryImage(id);
    setGalleryLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const hasLogo = !!profile.company_logo_url;

  // Auto-grow "About the company" textarea to avoid scrollbar
  useEffect(() => {
    const ta = companyAboutRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [companyAbout]);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            Your name and contact info. Employers can add company details below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {error}
              </p>
            )}
            {saved && (
              <p className="text-sm text-green-600 dark:text-green-400 bg-green-500/10 p-2 rounded-md">
                Profile saved.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">First name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="given-name"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 234 567 8900"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                disabled={loading}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {role === "employer"
                ? "Employer account"
                : "You're registered as a Job seeker"}
            </p>
            {role === "employer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Acme Inc"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://acme.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAbout">About the company</Label>
                  <Textarea
                    ref={companyAboutRef}
                    id="companyAbout"
                    placeholder="What your company does, culture, mission..."
                    value={companyAbout}
                    onChange={(e) => setCompanyAbout(e.target.value)}
                    onInput={(e) => {
                      const ta = e.currentTarget;
                      ta.style.height = "auto";
                      ta.style.height = `${ta.scrollHeight}px`;
                    }}
                    rows={3}
                    disabled={loading}
                    className="min-h-[4.5rem] resize-none overflow-hidden"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLocation">Location</Label>
                  <Input
                    id="companyLocation"
                    type="text"
                    placeholder="Berlin, Germany"
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {role === "employer" && (
        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company logo
            </CardTitle>
            <CardDescription>
              JPG, PNG, WebP, or GIF (max 2 MB). Shown on job listings and your company page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasLogo ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded border border-border/70 bg-background p-1 dark:bg-white">
                  <Image
                    src={profile.company_logo_url!}
                    alt="Company logo"
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded object-contain"
                    unoptimized
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept={LOGO_ACCEPT}
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={logoLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoLoading}
                  >
                    {logoLoading ? "Uploading…" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteLogo}
                    disabled={logoLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={LOGO_ACCEPT}
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={logoLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoLoading}
                >
                  {logoLoading ? "Uploading…" : "Upload logo"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {role === "employer" && (
        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Banner images</CardTitle>
            <CardDescription>
              Up to 3 banners shown in your job listings. Add more than one for a
              slider. JPG, PNG, WebP, GIF (max 2 MB each).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="relative group rounded-lg overflow-hidden border bg-muted/30 aspect-video w-40 shrink-0"
                >
                  <Image
                    src={b.url}
                    alt="Banner"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteBanner(b.id)}
                    disabled={bannerLoading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {banners.length < 3 && (
                <div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept={LOGO_ACCEPT}
                    className="hidden"
                    onChange={handleBannerChange}
                    disabled={bannerLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={bannerLoading}
                    className="h-full min-h-[80px] aspect-video w-40 border-dashed"
                  >
                    {bannerLoading ? "Uploading…" : "Add banner"}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {role === "employer" && (
        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Benefits
            </CardTitle>
            <CardDescription>
              Perks and benefits you offer. Shown on your company profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {benefits.map((b) => (
                <li
                  key={b.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{b.title}</p>
                    {b.description && (
                      <p className="text-muted-foreground text-sm mt-1">{b.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleDeleteBenefit(b.id)}
                    disabled={benefitLoading === b.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddBenefit} className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  name="title"
                  placeholder="e.g. Health insurance"
                  required
                  disabled={!!benefitLoading}
                />
                <Input
                  name="description"
                  placeholder="Optional description"
                  disabled={!!benefitLoading}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={!!benefitLoading}
              >
                {benefitLoading === "add" ? "Adding…" : "Add benefit"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {role === "employer" && (
        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListOrdered className="h-5 w-5" />
              Hiring process
            </CardTitle>
            <CardDescription>
              Steps in your hiring process. Shown on your company profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="space-y-2 list-decimal list-inside">
              {hiringSteps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 p-3"
                >
                  <div>
                    <span className="font-medium text-sm">{step.title}</span>
                    {step.description && (
                      <p className="text-muted-foreground text-sm mt-1">{step.description}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleDeleteHiringStep(step.id)}
                    disabled={hiringStepLoading === step.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ol>
            <form onSubmit={handleAddHiringStep} className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  name="title"
                  placeholder="e.g. Phone screen"
                  required
                  disabled={!!hiringStepLoading}
                />
                <Input
                  name="description"
                  placeholder="Optional description"
                  disabled={!!hiringStepLoading}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                disabled={!!hiringStepLoading}
              >
                {hiringStepLoading === "add" ? "Adding…" : "Add step"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {role === "employer" && (
        <Card className="rounded-3xl border border-border/80 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5" />
              Gallery
            </CardTitle>
            <CardDescription>
              Images for your company profile. JPG, PNG, WebP, GIF (max 2 MB each).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {gallery.map((g) => (
                <div
                  key={g.id}
                  className="relative group rounded-lg overflow-hidden border bg-muted/30 aspect-square w-24 shrink-0"
                >
                  <Image
                    src={g.url}
                    alt={g.caption || "Gallery"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {g.caption && (
                    <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                      {g.caption}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteGalleryImage(g.id)}
                    disabled={galleryLoading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {gallery.length < 12 && (
                <div>
                  <input
                    type="file"
                    accept={LOGO_ACCEPT}
                    className="hidden"
                    id="gallery-upload"
                    onChange={handleAddGalleryImage}
                    disabled={galleryLoading}
                  />
                  <label
                    htmlFor="gallery-upload"
                    className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors aspect-square"
                  >
                    {galleryLoading ? (
                      <span className="text-xs text-muted-foreground">Uploading…</span>
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </label>
                </div>
              )}
            </div>
          </CardContent>
          {role === "employer" && (
            <div className="px-6 pb-6">
              <Button type="submit" form="profile-form" disabled={loading}>
                {loading ? "Saving…" : "Save profile"}
              </Button>
            </div>
          )}
        </Card>
      )}

    </div>
  );
}
