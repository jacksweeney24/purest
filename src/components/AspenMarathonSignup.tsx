import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

/**
 * Aspen Valley Marathon 2026 giveaway entry form.
 * Subscribes the user to Klaviyo list SE9QyM ("Aspen Valley Marathon 2026")
 * and tags them for post-race email sequences + 10% off code delivery.
 */
export default function AspenMarathonSignup({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function subscribeToList(listId: string) {
    return fetch("https://a.klaviyo.com/client/subscriptions/?company_id=TYfncY", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "revision": "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "subscription",
          attributes: {
            custom_source: "Aspen Valley Marathon Landing Page",
            profile: {
              data: {
                type: "profile",
                attributes: {
                  email: email,
                  ...(name ? { first_name: name } : {}),
                  properties: {
                    event: "Aspen Valley Marathon 2026",
                    source: "aspenmarathon-landing-page"
                  }
                }
              }
            }
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: listId
              }
            }
          }
        }
      })
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");

    try {
      // Subscribe to both the Aspen Marathon list AND the main email list
      const [res1, res2] = await Promise.all([
        subscribeToList("SE9QyM"),  // Aspen Valley Marathon 2026
        subscribeToList("WapMkg"),  // Main Email List
      ]);

      if ((res1.ok || res1.status === 202) && (res2.ok || res2.status === 202)) {
        setStatus("done");
      } else {
        const body = await res1.text();
        console.error("Klaviyo error", res1.status, body);
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
        <p className={`text-sm mt-2 ${dark ? "text-background/60" : "text-muted-foreground"}`}>
          Check your inbox — your 10% off code is on its way!
        </p>
        <p className={`text-xs mt-1 ${dark ? "text-background/40" : "text-muted-foreground/70"}`}>
          Winner announced after the race. Good luck!
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
        className="flex h-11 w-full rounded-full border border-input bg-white text-gray-900 px-4 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Email address"
        className="flex h-11 w-full rounded-full border border-input bg-white text-gray-900 px-4 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full h-11 text-sm font-medium"
      >
        {status === "submitting" ? "Entering…" : "Enter to Win"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-red-500 text-center">
          Something went wrong. Try again or <a href="/contact" className="underline">contact us</a>.
        </p>
      )}
      <p className={`text-xs text-center ${dark ? "text-background/50" : "text-muted-foreground"}`}>
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
