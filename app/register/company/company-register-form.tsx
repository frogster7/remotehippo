"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  isAllowedLogoFileName,
  LOGO_ALLOWED_EXTENSIONS,
} from "@/lib/storage";
import {
  uploadLogoAndUpdateProfile,
  addBanner,
} from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Trash2 } from "lucide-react";

const LOGO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BANNERS = 3;

const fieldInputClass =
  "h-11 rounded-lg border border-primary/30 bg-background px-3.5 text-base shadow-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const textareaBaseClass =
  "flex w-full rounded-lg border border-primary/30 bg-background px-3.5 py-3 text-base shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[100px]";

export function CompanyRegisterForm() {
  const router = useRouter();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAbout, setCompanyAbout] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [bannerPreviews, setBannerPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedLogoFileName(file.name)) {
      setError(`Allowed formats: ${LOGO_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleLogoRemove() {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const valid = files.filter((f) => isAllowedLogoFileName(f.name));
    if (valid.length !== files.length) {
      setError(`Allowed formats: ${LOGO_ALLOWED_EXTENSIONS.join(", ")}`);
      return;
    }
    setError(null);
    const combined = [...bannerFiles, ...valid].slice(0, MAX_BANNERS);
    setBannerFiles(combined);
    setBannerPreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return combined.map((f) => URL.createObjectURL(f));
    });
    if (bannerInputRef.current) bannerInputRef.current.value = "";
  }

  function handleBannerRemove(index: number) {
    setBannerFiles((prev) => prev.filter((_, i) => i !== index));
    setBannerPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: companyName.trim(),
          company_name: companyName.trim(),
          company_website: companyWebsite.trim() || null,
          company_about: companyAbout.trim() || null,
          company_location: companyLocation.trim() || null,
          role: "employer",
        },
      },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }
    // If user has session (e.g. email confirmation off), upload logo and banners
    if (data.session) {
      if (logoFile) {
        const formData = new FormData();
        formData.set("file", logoFile);
        const logoResult = await uploadLogoAndUpdateProfile(formData);
        if (logoResult.error) {
          setError(logoResult.error);
          setLoading(false);
          return;
        }
      }
      for (const file of bannerFiles) {
        const formData = new FormData();
        formData.set("file", file);
        const bannerResult = await addBanner(formData);
        if (bannerResult.error) {
          setError(bannerResult.error);
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
    setSuccess(true);
    router.refresh();
    router.push("/login");
  }

  if (success) {
    return (
      <Card className="overflow-hidden rounded-xl border border-primary/30 bg-form-card p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-heading">Check your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to {email}. Click it to activate your
          company account, then log in.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden rounded-xl border border-primary/30 bg-form-card shadow-lg">
      <CardContent className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="companyName">Company name *</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              autoComplete="organization"
              disabled={loading}
              className={fieldInputClass}
            />
          </div>

          {/* Add logo */}
          <div className="space-y-2">
            <Label>Company logo</Label>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP, or GIF (max 2 MB). You can add or change it later in your profile.
            </p>
            {logoPreview ? (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-background p-1 dark:bg-white">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain"
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
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={loading}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLogoRemove}
                    disabled={loading}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="block">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={LOGO_ACCEPT}
                  className="hidden"
                  onChange={handleLogoChange}
                  disabled={loading}
                />
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => logoInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && logoInputRef.current?.click()}
                  className={`flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${loading ? "pointer-events-none opacity-60" : ""}`}
                >
                  <ImagePlus className="h-8 w-8 text-primary/70" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-primary">Add logo</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WebP, GIF</span>
                </span>
              </label>
            )}
          </div>

          {/* Add banner */}
          <div className="space-y-2">
            <Label>Banner images</Label>
            <p className="text-xs text-muted-foreground">
              Up to 3 banners shown in your job listings. JPG, PNG, WebP, GIF (max 2 MB each).
            </p>
            <div className="flex flex-wrap gap-3">
              {bannerPreviews.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg border bg-muted/30"
                >
                  <Image
                    src={url}
                    alt={`Banner ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => handleBannerRemove(i)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {bannerFiles.length < MAX_BANNERS && (
                <label className="block">
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept={LOGO_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={handleBannerChange}
                    disabled={loading}
                  />
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={() => bannerInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && bannerInputRef.current?.click()}
                    className={`flex aspect-video w-40 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${loading ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <ImagePlus className="h-7 w-7 text-primary/70" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-primary">Add banner</span>
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAbout">About your company *</Label>
            <Textarea
              id="companyAbout"
              placeholder="What does your company do? What makes you a great place to work?"
              value={companyAbout}
              onChange={(e) => setCompanyAbout(e.target.value)}
              required
              rows={4}
              disabled={loading}
              className={textareaBaseClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyLocation">Company location *</Label>
            <Input
              id="companyLocation"
              type="text"
              placeholder="e.g. Berlin, London, Remote"
              value={companyLocation}
              onChange={(e) => setCompanyLocation(e.target.value)}
              required
              autoComplete="address-level2"
              disabled={loading}
              className={fieldInputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyWebsite">Company website (optional)</Label>
            <Input
              id="companyWebsite"
              type="url"
              placeholder="https://yourcompany.com"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              autoComplete="url"
              disabled={loading}
              className={fieldInputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="hr@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              className={fieldInputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={loading}
              className={fieldInputClass}
            />
            <p className="text-xs text-muted-foreground">At least 6 characters</p>
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-lg shadow-sm"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
