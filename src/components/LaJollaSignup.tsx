import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

/**
 * La Jolla Half Marathon 2026 email capture.
 * Subscribes the user to Klaviyo list ShV6w5 ("La Jolla Half Marathon 2026")
 * and tags them with the event for post-race email sequences.
 */
export default function LaJollaSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");

    try {
      // Subscribe to Klaviyo list ShV6w5 (La Jolla Half Marathon 2026)
      const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "revision": "2024-10-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile-subscription-bulk-create-job",
            attributes: {
              profiles: {
                data: [
                  {
                    type: "profile",
                    attributes: {
                      email: email,
                      first_name: name || undefined,
                      properties: {
                        event: "La Jolla Half Marathon 2026",
                        source: "lajolla-landing-page"
                      }
                    }
                  }
                ]
              },
              custom_source: "La Jolla Landing Page"
            },
            relationships: {
              list: {
                data: {
                  type: "list",
                  id: "ShV6w5"
                }
              }
            }
          }
        })
      });

      if (res.ok || res.status === 202) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-serif">You're in. 🥥</p>
        <p className="text-sm text-muted-foreground mt-1">
          Check your inbox — your recovery guide and runner offer are on their way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md mx-auto">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name (optional)"
        className="flex h-11 w-full rounded-full border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className="flex h-11 w-full rounded-full border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full h-11 text-sm font-medium"
      >
        {status === "submitting" ? "Sending…" : "Get the Recovery Guide"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-500 text-center">Something went wrong. Try again or email us at hydrate@purestelectrolyte.com</p>
      )}
      <p className="text-xs text-muted-foreground text-center">
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
