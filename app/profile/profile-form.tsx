"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ApplicationPreference, Profile } from "@/lib/types";
import { APPLICATION_PREFERENCES } from "@/lib/types";
import {
  CV_ALLOWED_EXTENSIONS,
  isAllowedCvFileName,
  isAllowedLogoFileName,
  LOGO_ALLOWED_EXTENSIONS,
} from "@/lib/storage";
import {
  updateProfile,
  uploadCvAndUpdateProfile,
  deleteCvAndUpdateProfile,
  uploadLogoAndUpdateProfile,
  deleteLogoAndUpdateProfile,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp, Trash2, Building2, User } from "lucide-react";

const CV_ACCEPT = ".pdf,.doc,.docx";
const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function getCvFileName(path: string | null): string {
  if (!path) return "";
  const parts = path.split("/");
  const full = parts[parts.length - 1] ?? "";
  const withoutTimestamp = full.replace(/^\d+-/, "");
  return decodeURIComponent(withoutTimestamp) || "CV";
}

export function ProfileForm({
  profile,
  cvDownloadUrl,
}: {
  profile: Profile;
  cvDownloadUrl: string | null;
}) {
  const router = useRouter();
  const cvInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phone_number ?? "");
  const [role, setRole] = useState<"employer" | "job_seeker">(profile.role);
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
  const [applicationPreference, setApplicationPreference] = useState<
    ApplicationPreference | ""
  >(profile.application_preference ?? "");

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);

  const updateData = (): ProfileUpdateData => ({
    full_name: fullName.trim() || null,
    last_name: lastName.trim() || null,
    phone_number: phoneNumber.trim() || null,
    role,
    company_name: role === "employer" ? (companyName.trim() || null) : null,
    company_website:
      role === "employer" ? (companyWebsite.trim() || null) : null,
    company_about:
      role === "employer" ? (companyAbout.trim() || null) : null,
    company_location:
      role === "employer" ? (companyLocation.trim() || null) : null,
    application_preference:
      role === "employer"
        ? (applicationPreference || null)
        : null,
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

  async function handleCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedCvFileName(file.name)) {
      setError(`Allowed formats: ${CV_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    setCvLoading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadCvAndUpdateProfile(formData);
    setCvLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (cvInputRef.current) cvInputRef.current.value = "";
    router.refresh();
  }

  async function handleDeleteCv() {
    setError(null);
    setCvLoading(true);
    const result = await deleteCvAndUpdateProfile();
    setCvLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const hasCv = !!profile.cv_file_url;
  const hasLogo = !!profile.company_logo_url;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account
          </CardTitle>
          <CardDescription>
            Your name and role. Job seekers can add a CV; employers can add company details below.
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
            <div className="space-y-2">
              <Label>Role</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="job_seeker"
                    checked={role === "job_seeker"}
                    onChange={() => setRole("job_seeker")}
                    disabled={loading}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">Job seeker</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="employer"
                    checked={role === "employer"}
                    onChange={() => setRole("employer")}
                    disabled={loading}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm">Employer</span>
                </label>
              </div>
            </div>
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
                <div className="space-y-2">
                  <Label htmlFor="applicationPreference">
                    How to receive applications
                  </Label>
                  <Select
                    value={applicationPreference || undefined}
                    onValueChange={(v) =>
                      setApplicationPreference((v as ApplicationPreference) || "")
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="applicationPreference">
                      <SelectValue placeholder="Choose preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_PREFERENCES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} – {opt.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {role === "job_seeker" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              CV / Resume
            </CardTitle>
            <CardDescription>
              Upload a PDF, DOC, or DOCX (max 10 MB). Used when you apply to jobs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasCv ? (
              <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {getCvFileName(profile.cv_file_url)}
                </span>
                {cvDownloadUrl && (
                  <a
                    href={cvDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Download
                  </a>
                )}
                <div className="flex gap-2 ml-auto">
                  <input
                    ref={cvInputRef}
                    type="file"
                    accept={CV_ACCEPT}
                    className="hidden"
                    onChange={handleCvChange}
                    disabled={cvLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => cvInputRef.current?.click()}
                    disabled={cvLoading}
                  >
                    {cvLoading ? "Uploading…" : "Replace"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteCv}
                    disabled={cvLoading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <input
                  ref={cvInputRef}
                  type="file"
                  accept={CV_ACCEPT}
                  className="hidden"
                  onChange={handleCvChange}
                  disabled={cvLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={cvLoading}
                >
                  {cvLoading ? "Uploading…" : "Upload CV"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {role === "employer" && (
        <Card>
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
                <img
                  src={profile.company_logo_url!}
                  alt="Company logo"
                  className="h-20 w-20 object-contain rounded border bg-muted"
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

      <Card>
        <CardHeader>
          <CardTitle>Sign out</CardTitle>
          <CardDescription>
            Log out of your account on this device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
