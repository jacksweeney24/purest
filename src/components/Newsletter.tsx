import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";

/**
 * Email signup form. Currently a stub — submitting just shows a thank-you state.
 *
 * To wire this up to a real list (Klaviyo, Mailchimp, ConvertKit, Shopify),
 * replace the body of `handleSubmit` with a fetch to that service's API.
 */
export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    // Placeholder: pretend it succeeded.
    setTimeout(() => setStatus("done"), 400);
  }

  if (status === "done") {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks. We'll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-label="Email address"
        className="flex h-10 w-full rounded-full border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}
