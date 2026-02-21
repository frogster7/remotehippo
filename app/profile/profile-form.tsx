"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
import { Building2, Trash2, User } from "lucide-react";
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export type CompanyBanner = { id: string; url: string };

export function ProfileForm({
  profile,
  banners = [],
}: {
  profile: Profile;
  banners?: CompanyBanner[];
}) {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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

  const hasLogo = !!profile.company_logo_url;

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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    id="companyAbout"
                    placeholder="What your company does, culture, mission..."
                    value={companyAbout}
                    onChange={(e) => setCompanyAbout(e.target.value)}
                    rows={4}
                    disabled={loading}
                    className="resize-none"
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
                <Image
                  src={profile.company_logo_url!}
                  alt="Company logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain rounded border bg-muted"
                  unoptimized
                />
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

    </div>
  );
}
