import React from "react";
import {
  Bell,
  CreditCard,
  Database,
  Link2,
  Play,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getYoutubeAuthUrl } from "../lib/api";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

export default function Settings() {
  const navigate = useNavigate();

  const handleConnectYoutube = async () => {
    try {
      const data = await getYoutubeAuthUrl();

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      alert(error.message || "Failed to connect YouTube.");
    }
  };

  return (
    <DashboardLayout eyebrow="Settings" title="Manage your workspace">
      <section className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
          Account Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          Manage your profile, research preferences, connected accounts,
          notifications, and subscription settings.
        </p>
      </section>

      <section className="grid gap-4">
        <SettingCard
          icon={User}
          title="Profile"
          description="Update your name, email, profile image, and creator profile details."
          buttonText="Edit Profile"
          onClick={() => navigate("/profile")}
        />

        {/* <SettingCard
          icon={Link2}
          title="Connected Accounts"
          description="Connect your YouTube channel to fetch channel details and apply generated metadata to uploaded videos."
          buttonText="Connect YouTube"
          onClick={handleConnectYoutube}
        /> */}

        <SettingCard
          icon={CreditCard}
          title="Subscription"
          description="View your current plan, usage limits, billing details, and upgrade options."
          buttonText="View Plan"
          onClick={() => navigate("/payment")}
        />

        <SettingCard
          icon={Database}
          title="Data & Privacy"
          description="Delete selected records or delete your account after email verification. Permanent purge is scheduled after 300 days."
          buttonText="Manage Data"
          onClick={() => navigate("/data-privacy")}
        />
      </section>

    </DashboardLayout>
  );
}

function SettingCard({ icon: Icon, title, description, buttonText, onClick }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] transition hover:bg-white/[0.06]">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10">
            <Icon className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white sm:text-base">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onClick}
          className="h-10 w-full shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-4 text-xs font-medium text-zinc-200 hover:bg-white/[0.1] sm:w-auto"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}