import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

/**
 * La Jolla Half Marathon 2026 email capture.
 * Subscribes the user to Klaviyo list ShV6w5 ("La Jolla Half Marathon 2026")
 * and tags them with the event for post-race email sequences.
 */
export default function LaJollaSignup({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");

    try {
      // Klaviyo Client API — safe for browser use, no private key needed
      const res = await fetch("https://a.klaviyo.com/client/subscriptions/?company_id=TYfncY", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "revision": "2024-10-15",
        },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              custom_source: "La Jolla Landing Page",
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email: email,
                    ...(name ? { first_name: name } : {}),
                    properties: {
                      event: "La Jolla Half Marathon 2026",
                      source: "lajolla-landing-page"
                    }
                  }
                }
              }
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
        const body = await res.text();
        console.error("Klaviyo error", res.status, body);
        setStatus("error");
      }
    } catch (err) {
      console.error("Signup fetch error", err);
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-4">
        <p className={`text-lg font-serif ${dark ? "text-background" : ""}`}>You're entered to win. 🥥</p>
        <p className={`text-sm mt-1 ${dark ? "text-background/60" : "text-muted-foreground"}`}>
          Winner announced after May 16. Watch your inbox!
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
        {status === "submitting" ? "Entering…" : "Enter to Win"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-500 text-center">Something went wrong. Try again or email us at hydrate@purestelectrolyte.com</p>
      )}
      <p className={`text-xs text-center ${dark ? "text-background/50" : "text-muted-foreground"}`}>
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
